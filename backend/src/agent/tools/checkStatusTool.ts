import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import sql from '../../db/db.js';

const checkStatusTool = tool(
  async ({ identifier }): Promise<string> => {
    // First, see if it's a UUID (simple heuristic: length 36 and dashes)
    const isUuid = /^[0-9a-f-]{36}$/i.test(identifier.trim());

    let bookRows;
    try {
      if (isUuid) {
        bookRows = await sql`
        SELECT id, title
        FROM books
        WHERE id = ${identifier}
      `;
      } else {
        bookRows = await sql`
        SELECT id, title
        FROM books
        WHERE LOWER(title) LIKE ${`%${identifier.toLowerCase()}%`}
        LIMIT 1
      `;
      }

      if (bookRows.length === 0) {
        return `No book found matching identifier "${identifier}".`;
      }

      const book = bookRows[0];

      const instances = await sql`
      SELECT id, status, due_date
      FROM bookinstances
      WHERE book = ${book.id}
      ORDER BY status, due_date
    `;

      if (instances.length === 0) {
        return `No copies (bookinstances) found for "${book.title}".`;
      }

      const result = instances.map((i) => {
        return `ID: ${i.id}, Status: ${i.status}, Due date: ${
          i.due_date || 'N/A'
        }`;
      });

      return `Book: "${book.title}"\n\nInstances:\n${result.join('\n')}`;
    } catch (error) {
      console.error('Error checking book instances:', error);
      return `An error occurred while checking the status of "${identifier}". Please try again later.`;
    }
  },
  {
    name: 'checkBookInstances',
    description:
      "Checks the status of all physical copies (instances) of a specific book. Use this when a user asks if a book is 'available', 'in stock', or when it's 'due'. You must provide the book's title or its UUID. It will return the status ('Available', 'Checked Out', 'Reserved') and due date for every copy. After getting the status list from this tool, present the information clearly to the user.",
    schema: z.object({
      identifier: z
        .string()
        .min(1)
        .describe('The exact title or the UUID of the book to check.'),
    }),
  },
);

export default checkStatusTool;
