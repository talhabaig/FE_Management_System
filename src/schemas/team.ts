import { z } from 'zod';

const teamName = z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters');
const teamDescription = z.string().trim().max(1000, 'Description must be at most 1000 characters');

export const createTeamSchema = z.object({
  name: teamName,
  description: teamDescription,
  managerId: z.string().uuid('Select a manager'),
});

export const updateTeamSchema = z.object({
  name: teamName,
  description: teamDescription,
  managerId: z.string().uuid('Select a manager').or(z.literal('')),
});

export const addMemberSchema = z.object({
  userId: z.string().uuid('Select a user'),
});

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;
export type UpdateTeamFormValues = z.infer<typeof updateTeamSchema>;
export type AddMemberFormValues = z.infer<typeof addMemberSchema>;
