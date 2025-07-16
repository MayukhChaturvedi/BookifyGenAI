import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { tool } from '@langchain/core/tools';
import sql from '../../db/db.js';

const requestBookTool = tool(
  async ({ title, author, genre, notes, userId }): Promise<string> => {
    // 1. Wrap everything in a try...catch block. This is our safety net.
    try {
      // 2. Proactive Check: Before trying to insert, see if the request exists.
      // This is more user-friendly than waiting for a database error.
      const existingRequest = await sql`
        SELECT id, status FROM requested_books 
        WHERE title ILIKE ${title} AND author ILIKE ${author || ''}
      `;

      if (existingRequest.length > 0) {
        // If the request exists, we don't proceed. We return a specific message.
        console.log(
          `🔹 User attempted to request an existing book: "${title}"`,
        );
        return `This book has already been requested. Its current status is '${existingRequest[0].status}'. Please inform the user and ask if they need anything else.`;
      }

      // 3. If no existing request is found, proceed with the INSERT.
      const id = uuidv4();
      await sql`
        INSERT INTO requested_books (id, title, author, genre, notes, requested_by)
        VALUES (${id}, ${title}, ${author || null}, ${genre || null}, ${notes || null}, ${userId})
      `;

      // 4. Return the success message.
      return `✅ Your request for "${title}" has been recorded. Thank you!`;
    } catch (error: any) {
      // 5. Reactive Safety Net: If the INSERT fails for ANY reason (like the
      // unique constraint we just added, or a network issue), we catch it here.
      console.error('❌ Error in requestBookTool:', error);

      // Check if the error is the one we expect
      if (error.code && error.code === '23505') {
        // PostgreSQL's code for unique_violation
        return `It seems this book has already been requested. Please ask the user if they need help with another book.`;
      }

      // For any other unexpected errors
      return 'An unexpected error occurred while trying to record the book request. Please inform the user and ask them to try again later.';
    }
  },
  {
    name: 'requestBook',
    description:
      "Use this to record a user's request for a book that the library does not have. You must provide the userId of the currently authenticated user.",
    schema: z.object({
      title: z.string().describe('The title of the requested book'),
      author: z
        .string()
        .optional()
        .describe('The author of the requested book'),
      genre: z.string().optional().describe('The genre of the requested book'),
      notes: z
        .string()
        .optional()
        .describe('Any additional notes for the request'),
      userId: z
        .string()
        .uuid()
        .describe('The UUID of the authenticated user making the request.'),
    }),
  },
);

export default requestBookTool;
