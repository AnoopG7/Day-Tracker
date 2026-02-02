import mongoose, { Document, Schema } from 'mongoose';
import { DEFAULT_ACTIVITIES } from './daylog.model.js';

export type ActivityCategory =
  | 'health'
  | 'learning'
  | 'hobbies'
  | 'work'
  | 'social'
  | 'selfcare'
  | 'other';

export interface IActivityTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string; // e.g., "yoga", "reading"
  category: ActivityCategory;
  icon?: string; // emoji or icon identifier
  defaultDuration?: number; // minutes (optional preset)
  isActive: boolean; // soft delete flag
  createdAt: Date;
  updatedAt: Date;
}

const activityTemplateSchema = new Schema<IActivityTemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      lowercase: true,
      minlength: [2, 'Activity name must be at least 2 characters'],
      maxlength: [50, 'Activity name cannot exceed 50 characters'],
      validate: [
        {
          validator: function (value: string) {
            const normalized = value.trim().toLowerCase();
            return !DEFAULT_ACTIVITIES.includes(normalized as typeof DEFAULT_ACTIVITIES[number]);
          },
          message: `Activity name cannot be one of the defaults: ${DEFAULT_ACTIVITIES.join(', ')}`,
        },
        {
          validator: function (value: string) {
            // Only allow letters, numbers, spaces, hyphens, and apostrophes
            return /^[a-zA-Z0-9 '-]+$/.test(value);
          },
          message: 'Activity name can only contain letters, numbers, spaces, hyphens, and apostrophes',
        },
      ],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['health', 'learning', 'hobbies', 'work', 'social', 'selfcare', 'other'],
        message: '{VALUE} is not a valid category',
      },
    },
    icon: {
      type: String,
      maxlength: [10, 'Icon cannot exceed 10 characters'],
    },
    defaultDuration: {
      type: Number,
      min: [1, 'Default duration must be at least 1 minute'],
      max: [1440, 'Default duration cannot exceed 1440 minutes (24 hours)'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one template name per user (case-insensitive via lowercase)
activityTemplateSchema.index({ userId: 1, name: 1 }, { unique: true });

// Index for fetching active templates
activityTemplateSchema.index({ userId: 1, isActive: 1 });

export const ActivityTemplate = mongoose.model<IActivityTemplate>(
  'ActivityTemplate',
  activityTemplateSchema
);
