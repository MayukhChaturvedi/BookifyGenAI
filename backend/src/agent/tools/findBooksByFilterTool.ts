import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import sql from '../../db/db.js';
import { cat } from '@xenova/transformers';

// The result type remains the same, which is great for consistency.
type BookResult = {
  id: string; // We'll select book_id and alias it to id
  title: string;
  author: string;
  genre: string;
  summary: string;
};

const findBooksByFilterTool = tool(
  async ({
    title,
    author,
    genre,
  }: {
    title?: string;
    author?: string;
    genre?: string;
  }): Promise<string> => {
    if (!title && !author && !genre) {
      return 'I cannot search for a book without at least one criterion (title, author, or genre).';
    }

    // Build the WHERE clause dynamically, just like before.
    try {
      const conditions = [];
      if (title) conditions.push(sql`title ILIKE ${'%' + title + '%'}`);
      if (author) conditions.push(sql`author ILIKE ${'%' + author + '%'}`);
      if (genre) conditions.push(sql`genre ILIKE ${'%' + genre + '%'}`);

      // --- THE OPTIMIZED QUERY ---
      // Query the single, fast 'book_embeddings' table. No joins needed!
      // Alias book_id to id to match our BookResult type.
      const results = await sql<BookResult[]>`
      SELECT 
        book_id as id,
        title, 
        author, 
        genre,
        summary
      FROM book_embeddings
      WHERE ${conditions.reduce((acc, cur, idx) => (idx === 0 ? cur : sql`${acc} AND ${cur}`))}
      LIMIT 10;
    `;

      if (results.length === 0) {
        return 'No books were found matching the specified criteria.';
      }

      // Return the results as a JSON string for the agent to process
      return JSON.stringify(results, null, 2);
    } catch (error) {
      console.error(`❌ Error in findBooksByFilterTool:`, error);
      return 'An error occurred while searching for books. Please try again later.';
    }
  },
  {
    name: 'findBooksByFilter',
    description:
      "Use this tool for precise lookups when a user provides a specific book title, author name, or genre. This is the correct tool for questions like 'Do you have 'Project Hail Mary'?' or 'Show me books by Brandon Sanderson in the fantasy genre'. This is NOT for recommendations or topic-based searches like 'books similar to Harry Potter'.",
    schema: z.object({
      title: z
        .string()
        .optional()
        .describe('The title of the book to search for.'),
      author: z
        .string()
        .optional()
        .describe('The name of the author to search for.'),
      genre: z.string().optional().describe('The genre to search for.'),
    }),
  },
);

export default findBooksByFilterTool;
