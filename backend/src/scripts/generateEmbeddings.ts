import postgres from 'postgres';
import { pipeline } from '@xenova/transformers';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DB_URL || '', {
  max: 3,
  connect_timeout: 60,
});

(async () => {
  try {
    console.log('🔹 Loading embedding model...');
    const embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
    );

    console.log('🔹 Fetching books...');
    const rows = await sql`
      SELECT
        b.id,
        b.title,
        b.summary,
        g.name AS genre,
        a.name AS author
      FROM books b
      LEFT JOIN genres g ON b.genre = g.id
      LEFT JOIN authors a ON b.author = a.id
    `;

    console.log(`🔹 ${rows.length} books loaded.`);

    for (const row of rows) {
      const text = `
        Title: ${row.title || ''}
        Summary: ${row.summary || ''}
        Genre: ${row.genre || ''}
        Author: ${row.author || ''}
      `.trim();

      const embeddingArray = await embedder(text, {
        pooling: 'mean',
        normalize: true,
      });

      // Convert to Postgres vector string representation
      const embeddingString = `[${Array.from(embeddingArray.data).join(',')}]`;

      await sql`
        INSERT INTO book_embeddings (
          book_id,
          embedding,
          title,
          summary,
          genre,
          author
        )
        VALUES (
          ${row.id},
          ${embeddingString},
          ${row.title},
          ${row.summary},
          ${row.genre},
          ${row.author}
        )
        ON CONFLICT (book_id) DO UPDATE
        SET embedding = EXCLUDED.embedding;
      `;

      console.log(`✅ Embedded book: ${row.title}`);
    }

    console.log('🎉 All embeddings generated and saved.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.end();
    process.exit(0);
  }
})();
