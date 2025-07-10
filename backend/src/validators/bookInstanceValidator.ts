import { z } from 'zod';

export const createBookInstanceSchema = z.object({
  book: z.string().uuid({ message: 'Invalid bookId format' }),
  status: z.enum(['Available', 'Checked Out', 'Reserved']),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateBookInstanceSchema = z.object({
  status: z.enum(['Available', 'Checked Out', 'Reserved']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().optional(),
});
