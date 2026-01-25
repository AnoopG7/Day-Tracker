import { z } from 'zod';
import { DEFAULT_ACTIVITIES } from '../models/daylog.model.js';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Base schema without refinements for updates
const activityBaseSchema = z.object({
  startTime: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
  endTime: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
  duration: z.number().min(0, 'Duration cannot be negative').optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Full schema with refinement for creation
const activityWithValidation = activityBaseSchema.refine(
  (data) => {
    const hasStart = data.startTime != null;
    const hasEnd = data.endTime != null;
    const hasDuration = data.duration != null;

    // If nothing provided, that's fine for optional fields
    if (!hasStart && !hasEnd && !hasDuration) return true;
    // If duration provided, don't allow times
    if (hasDuration && (hasStart || hasEnd)) return false;
    // If times provided, need both
    if (!hasDuration && hasStart !== hasEnd) return false;
    return true;
  },
  { message: 'Provide either duration OR both start/end times' }
);

export const createActivitySchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  name: z
    .string()
    .min(1, 'Activity name is required')
    .max(50, 'Activity name cannot exceed 50 characters')
    .trim()
    .toLowerCase()
    .refine(
      (val) => !DEFAULT_ACTIVITIES.includes(val as typeof DEFAULT_ACTIVITIES[number]),
      { message: `Activity name cannot be one of: ${DEFAULT_ACTIVITIES.join(', ')}` }
    ),
  startTime: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
  endTime: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
  duration: z.number().min(0, 'Duration cannot be negative').optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
}).refine(
  (data) => {
    const hasStart = data.startTime != null;
    const hasEnd = data.endTime != null;
    const hasDuration = data.duration != null;

    if (hasDuration && (hasStart || hasEnd)) return false;
    if (!hasDuration && hasStart !== hasEnd) return false;
    if (!hasDuration && !hasStart && !hasEnd) return false;
    return true;
  },
  { message: 'Provide either duration OR both start/end times' }
);

// Update schema - separate definition without refinements
export const updateActivitySchema = z.object({
  startTime: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
  endTime: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
  duration: z.number().min(0, 'Duration cannot be negative').optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
