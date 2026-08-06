import { z } from 'zod';

export const goalSchema = z.object({
  goalName: z.string().min(1, 'Goal name is required').max(100, 'Goal name cannot exceed 100 characters'),
  targetAmount: z.coerce.number().positive('Target amount must be greater than 0'),
  currentAmount: z.coerce.number().min(0, 'Current amount cannot be negative').optional(),
  targetDate: z.string().min(1, 'Target date is required').refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, {
    message: 'Target date must be a valid future date',
  }),
  notes: z.string().max(255, 'Notes cannot exceed 255 characters').optional().or(z.literal('')),
});

export const goalProgressSchema = z.object({
  currentAmount: z.coerce.number().min(0, 'Current amount cannot be negative'),
});
