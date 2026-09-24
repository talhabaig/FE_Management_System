import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
});

export const userEditSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER'], { required_error: 'Select a role' }),
  isActive: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type UserEditFormValues = z.infer<typeof userEditSchema>;
