import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { tool } from '@langchain/core/tools';
import sql from '../../db/db.js';

/**
 * This tool allows the agent to record a user's request for a new book.
 */
const requestBookTool = tool(
  async ({ title, author, genre, notes, userId }): Promise<string> => {
    try {
      const id = uuidv4();

      await sql`
      INSERT INTO requested_books (id, title, author, genre, notes, requested_by)
      VALUES (${id}, ${title.slice(0, 255)}, ${author || null}, ${genre || null}, ${notes || null}), ${userId}
    `;

      return `Your request for "${title}" has been recorded. Thank you!`;
    } catch (error) {
      console.error('Error requesting book:', error);
      return 'An error occurred while processing your request. Please try again later.';
    }
  },
  {
    name: 'requestBook',
    description:
      "Use this to record a user's request for a book that the library does not have. The tool will confirm when the request is saved. After calling this tool, inform the user that their request has been successfully recorded.",
    schema: z.object({
      title: z.string().min(1).describe('The title of the requested book'),
      author: z
        .string()
        .optional()
        .describe('The author of the requested book, if known'),
      genre: z
        .string()
        .optional()
        .describe('The genre of the requested book, if known'),
      notes: z
        .string()
        .optional()
        .describe('Any additional notes or reason for the request'),
      userId: z
        .string()
        .uuid()
        .describe('The UUID of the user making the request.'),
    }),
  },
);

export default requestBookTool;
