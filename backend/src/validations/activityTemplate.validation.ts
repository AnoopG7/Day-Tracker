import { z } from 'zod';
import { DEFAULT_ACTIVITIES } from '../models/daylog.model.js';

const ACTIVITY_CATEGORIES = ['health', 'learning', 'hobbies', 'work', 'social', 'selfcare', 'other'] as const;

/**
 * Schema for creating activity template
 */
export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(2, 'Activity name must be at least 2 characters')
    .max(50, 'Activity name cannot exceed 50 characters')
    .trim()
    .toLowerCase()
    .refine(
      (val) => !DEFAULT_ACTIVITIES.includes(val as typeof DEFAULT_ACTIVITIES[number]),
      { message: `Activity name cannot be one of the reserved activities: ${DEFAULT_ACTIVITIES.join(', ')}` }
    ),
  category: z.enum(ACTIVITY_CATEGORIES, {
    message: `Category must be one of: ${ACTIVITY_CATEGORIES.join(', ')}`,
  }),
  icon: z.string().max(10, 'Icon cannot exceed 10 characters').optional(),
  defaultDuration: z
    .number()
    .min(1, 'Default duration must be at least 1 minute')
    .max(1440, 'Default duration cannot exceed 1440 minutes (24 hours)')
    .optional(),
});

/**
 * Schema for updating activity template (all fields optional)
 */
export const updateTemplateSchema = z.object({
  name: z
    .string()
    .min(2, 'Activity name must be at least 2 characters')
    .max(50, 'Activity name cannot exceed 50 characters')
    .trim()
    .toLowerCase()
    .refine(
      (val) => !DEFAULT_ACTIVITIES.includes(val as typeof DEFAULT_ACTIVITIES[number]),
      { message: `Activity name cannot be one of the reserved activities: ${DEFAULT_ACTIVITIES.join(', ')}` }
    )
    .optional(),
  category: z.enum(ACTIVITY_CATEGORIES, {
    message: `Category must be one of: ${ACTIVITY_CATEGORIES.join(', ')}`,
  }).optional(),
  icon: z.string().max(10, 'Icon cannot exceed 10 characters').optional(),
  defaultDuration: z
    .number()
    .min(1, 'Default duration must be at least 1 minute')
    .max(1440, 'Default duration cannot exceed 1440 minutes (24 hours)')
    .optional(),
});

export const templateIdParamSchema = z.object({
  id: z.string().min(1, 'Template ID is required'),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
