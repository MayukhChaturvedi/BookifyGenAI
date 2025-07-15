import { pipeline } from '@xenova/transformers';
import sql from '../db/db.js';

// Use a singleton pattern to ensure the embedding model is loaded only once.
let embedderPromise: Promise<any> | undefined;
function getEmbedder() {
  if (!embedderPromise) {
    console.log('🔹 Initializing embedding model...');
    embedderPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedderPromise;
}

/**
 * Generates an embedding vector for a given text string.
 * This is a helper function that isolates the model interaction.
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const embedder = await getEmbedder();
  const tensor = await embedder(text, {
    pooling: 'mean',
    normalize: true,
  });
  return Array.from(tensor.data);
}

/**
 * Fetches all necessary data for a single book, generates a new embedding,
 * and then creates or updates its entry in the book_embeddings table.
 * This is used when a book is created or its core data (title, summary, author, genre) changes.
 * @param bookId The UUID of the book to generate an embedding for.
 */
export async function syncBookEmbedding(bookId: string): Promise<void> {
  console.log(`🔹 Syncing embedding for book ID: ${bookId}`);

  // 1. Fetch all required data from the source-of-truth tables.
  const [bookData] = await sql`
    SELECT 
      b.title,
      b.summary,
      a.name as author,
      g.name as genre
    FROM books b
    LEFT JOIN authors a ON b.author = a.id
    LEFT JOIN genres g ON b.genre = g.id
    WHERE b.id = ${bookId}
  `;

  if (!bookData) {
    console.warn(
      `⚠️ Attempted to sync embedding for non-existent book ID: ${bookId}. Deleting orphan embedding if it exists.`,
    );
    await deleteBookEmbedding(bookId); // Clean up any orphaned embeddings
    return;
  }

  // 2. Prepare the text payload for the embedding model, just like in your script.
  const textToEmbed = `Title: ${bookData.title}\nAuthor: ${bookData.author}\nGenre: ${bookData.genre}\nSummary: ${bookData.summary || ''}`;

  const embedding = await generateEmbedding(textToEmbed);

  const embeddingString = `[${embedding.join(',')}]`;
  // 3. Use an "UPSERT" command to insert a new record or update an existing one.
  await sql`
    INSERT INTO book_embeddings (book_id, embedding, title, summary, genre, author)
    VALUES (
      ${bookId}, 
      ${embeddingString}, 
      ${bookData.title}, 
      ${bookData.summary}, 
      ${bookData.genre}, 
      ${bookData.author}
    )
    ON CONFLICT (book_id) 
    DO UPDATE SET
      embedding = EXCLUDED.embedding,
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      genre = EXCLUDED.genre,
      author = EXCLUDED.author;
  `;
  console.log(`✅ Embedding synced for book: ${bookData.title}`);
}

/**
 * EFFICIENTLY updates the author's name for all their books in the embeddings table.
 * This avoids costly re-embedding for a simple text change.
 * @param authorId The UUID of the author who was updated.
 */
export async function updateAuthorNameForBooks(
  authorId: string,
): Promise<void> {
  const [author] = await sql`SELECT name FROM authors WHERE id = ${authorId}`;
  if (!author) return;

  console.log(
    `🔹 Updating denormalized author name to "${author.name}" in embeddings...`,
  );
  const result = await sql`
    UPDATE book_embeddings
    SET author = ${author.name}
    WHERE book_id IN (SELECT id FROM books WHERE author = ${authorId});
  `;
  console.log(
    `✅ Updated ${result.count} book embeddings with new author name.`,
  );
}

/**
 * EFFICIENTLY updates the genre name for all relevant books in the embeddings table.
 * @param genreId The UUID of the genre that was updated.
 */
export async function updateGenreNameForBooks(genreId: string): Promise<void> {
  const [genre] = await sql`SELECT name FROM genres WHERE id = ${genreId}`;
  if (!genre) return;

  console.log(
    `🔹 Updating denormalized genre name to "${genre.name}" in embeddings...`,
  );
  const result = await sql`
        UPDATE book_embeddings
        SET genre = ${genre.name}
        WHERE book_id IN (SELECT id FROM books WHERE genre = ${genreId});
    `;
  console.log(
    `✅ Updated ${result.count} book embeddings with new genre name.`,
  );
}

/**
 * Deletes a book's record from the embeddings table when the book itself is deleted.
 * @param bookId The UUID of the book to delete.
 */
export async function deleteBookEmbedding(bookId: string): Promise<void> {
  console.log(`🔹 Deleting embedding for book ID: ${bookId}`);
  await sql`DELETE FROM book_embeddings WHERE book_id = ${bookId};`;
  console.log(`✅ Embedding deleted.`);
}
