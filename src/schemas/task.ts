import { z } from 'zod';

const title = z.string().trim().min(1, 'Title is required').max(200, 'Title must be at most 200 characters');
const description = z.string().trim().max(5000, 'Description must be at most 5000 characters');
const optionalUuid = z.string().refine((value) => value === '' || z.string().uuid().safeParse(value).success, 'Select a team member');

export const taskFormSchema = z.object({
  title,
  description,
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  deadline: z.string().refine((value) => value === '' || !Number.isNaN(new Date(value).getTime()), 'Enter a valid deadline'),
  teamId: z.string().uuid('Select a team'),
  assignedToId: optionalUuid,
});

export const statusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
});

export const assignSchema = z.object({
  assignedToId: z.string().uuid('Select a team member'),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type StatusFormValues = z.infer<typeof statusSchema>;
export type AssignFormValues = z.infer<typeof assignSchema>;
