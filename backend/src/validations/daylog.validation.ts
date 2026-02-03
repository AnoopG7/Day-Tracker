import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const exerciseTypes = [
  'running',
  'walking',
  'cycling',
  'swimming',
  'gym',
  'yoga',
  'sports',
  'cardio',
  'other',
] as const;

// Activity entry schema for sleep/exercise
const activityEntrySchema = z
  .object({
    startTime: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
    endTime: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
    duration: z.number().min(0, 'Duration cannot be negative').optional(),
    exerciseType: z.enum(exerciseTypes).optional(),
  })
  .refine(
    (data) => {
      const hasStart = data.startTime != null;
      const hasEnd = data.endTime != null;

      // If times are provided, both start and end must be present
      if (hasStart || hasEnd) {
        return hasStart && hasEnd;
      }
      return true;
    },
    { message: 'Both start and end times must be provided together' }
  );

export const createDayLogSchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  sleep: activityEntrySchema.optional(),
  exercise: activityEntrySchema.optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Update schema - separate definition without refinement issues
export const updateDayLogSchema = z.object({
  sleep: activityEntrySchema.optional(),
  exercise: activityEntrySchema.optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const dateParamSchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
});

export type CreateDayLogInput = z.infer<typeof createDayLogSchema>;
export type UpdateDayLogInput = z.infer<typeof updateDayLogSchema>;
