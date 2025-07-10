import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import postgres from 'postgres';
import fs from 'fs';

dotenv.config();

const sql = postgres(process.env.DB_URL || '', {
  max: 3,
  connect_timeout: 60,
});

(async () => {
  try {
    console.log('🌱 Seeding data...');

    const booksData = JSON.parse(fs.readFileSync('books.json', 'utf8'));

    // 1️⃣ Clean tables
    await sql`DELETE FROM bookinstances`;
    await sql`DELETE FROM books`;
    await sql`DELETE FROM authors`;
    await sql`DELETE FROM genres`;

    const genres = new Map<string, string>();
    const authors = new Map<string, string>();

    console.log('📝 Preparing genres...');
    const genreRows = [];
    for (const book of booksData) {
      const genre = (book.genre || 'Unknown').trim();
      if (!genres.has(genre)) {
        const id = uuidv4();
        genreRows.push([id, genre.slice(0, 255), `Books related to ${genre}`]);
        genres.set(genre, id);
      }
    }
    if (genreRows.length) {
      await sql`
        INSERT INTO genres (id, name, description)
        VALUES ${sql(genreRows)}
      `;
    }

    console.log('📝 Preparing authors...');
    const authorRows = [];
    for (const book of booksData) {
      const author = (book.author || 'Unknown').trim();
      if (!authors.has(author)) {
        const id = uuidv4();
        authorRows.push([id, author.slice(0, 255), `Biography of ${author}`]);
        authors.set(author, id);
      }
    }
    if (authorRows.length) {
      await sql`
        INSERT INTO authors (id, name, bio)
        VALUES ${sql(authorRows)}
      `;
    }

    console.log('📝 Preparing books data...');
    const books: {
      id: string;
      title: string;
      authorId: string;
      summary: string;
      genreId: string;
    }[] = [];
    for (const book of booksData) {
      books.push({
        id: uuidv4(),
        title: (book.title || 'Untitled').slice(0, 255),
        authorId: authors.get(book.author?.trim() || 'Unknown')!,
        summary: book.summary || 'No description.',
        genreId: genres.get(book.genre?.trim() || 'Unknown')!,
      });
    }

    console.log('📝 Inserting books...');
    const bookRows = books.map((b) => [
      b.id,
      b.title,
      b.authorId,
      b.summary.replace(/\n/g, ' '),
      b.genreId,
    ]);
    if (bookRows.length) {
      await sql`
        INSERT INTO books (id, title, author, summary, genre)
        VALUES ${sql(bookRows)}
      `;
    }

    console.log(`✅ Inserted ${books.length} books.`);

    console.log('📝 Generating bookinstances...');
    const statuses = ['Available', 'Checked Out', 'Reserved'];
    const bookInstances: {
      id: string;
      book: string;
      status: string;
      due_date: string | null;
    }[] = [];

    for (let i = 0; i < 1200; i++) {
      const id = uuidv4();
      const book = books[Math.floor(Math.random() * books.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const dueDate =
        status === 'Available'
          ? null
          : new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0];

      bookInstances.push({
        id,
        book: book.id,
        status,
        due_date: dueDate,
      });
    }
    console.log('📝 Inserting bookinstances...');

    const ids: string[] = [];
    const booksArr: string[] = [];
    const statusesArr: string[] = [];
    const dueDates: (string | null)[] = [];

    for (const r of bookInstances) {
      ids.push(r.id);
      booksArr.push(r.book);
      statusesArr.push(r.status);
      dueDates.push(r.due_date);
    }

    await sql`
      INSERT INTO bookinstances (id, book, status, due_date)
      SELECT * FROM UNNEST(
      ${sql.array(ids)}::uuid[],
      ${sql.array(booksArr)}::uuid[],
      ${sql.array(statusesArr)}::text[],
      ${sql.array(dueDates)}::date[]
      )
    `;

    console.log(`✅ Inserted ${bookInstances.length} bookinstances.`);

    console.log(`✅ Inserted ${bookInstances.length} bookinstances.`);

    console.log('🎉 Seeding completed successfully.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    try {
      await sql.end();
    } catch (e) {
      console.error('Error closing DB connection', e);
    }
    // 💡 Ensures no hanging
    process.exit(0);
  }
})();
