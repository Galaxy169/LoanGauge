import { z } from 'zod';

export const consultationSchema = z.object({
  assessmentId: z.coerce.number().int().positive('Assessment ID is required'),
});

export const advisorRemarkSchema = z.object({
  remarks: z.string().min(10, 'Remarks must be at least 10 characters long').max(2000, 'Remarks cannot exceed 2000 characters'),
});
