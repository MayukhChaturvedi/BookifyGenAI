import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin'], {
    errorMap: () => ({ message: 'Role must be either "user" or "admin"' }),
  }),
  adminPassword: z
    .string()
    .optional()
    .refine((val) => val === process.env.ADMIN_PASSWORD, {
      message: 'Invalid admin password',
    }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refresh: z.string().min(1, 'Refresh token is required'),
});
