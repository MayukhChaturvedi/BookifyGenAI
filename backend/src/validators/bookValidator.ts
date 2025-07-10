import { z } from 'zod';

export const bookCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().uuid('Invalid author ID'),
  summary: z.string().min(1, 'Summary is required'),
  genre: z.string().uuid('Invalid genre ID'),
});

export const bookUpdateSchema = bookCreateSchema;

export const bookQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  author: z.string().uuid().optional(),
  genre: z.string().uuid().optional(),
});
