import mongoose, { Document, Schema } from 'mongoose';
import { DEFAULT_ACTIVITIES } from './daylog.model.js';

export interface ICustomActivity extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  name: string;
  startTime?: string; // "HH:mm" format
  endTime?: string; // "HH:mm" format
  duration?: number; // minutes (use if start/end not provided)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customActivitySchema = new Schema<ICustomActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      lowercase: true,
      maxlength: [50, 'Activity name cannot exceed 50 characters'],
      validate: [
        {
          validator: function (value: string) {
            const normalized = value.trim().toLowerCase();
            return !DEFAULT_ACTIVITIES.includes(normalized as (typeof DEFAULT_ACTIVITIES)[number]);
          },
          message: `Activity name cannot be one of the defaults: ${DEFAULT_ACTIVITIES.join(', ')}`,
        },
        {
          validator: function (value: string) {
            // Only allow letters, numbers, spaces, hyphens, and apostrophes
            return /^[a-zA-Z0-9 '-]+$/.test(value);
          },
          message:
            'Activity name can only contain letters, numbers, spaces, hyphens, and apostrophes',
        },
      ],
    },
    startTime: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'],
    },
    endTime: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'],
    },
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Schema-level validation (runs on every validate, not just one field)
customActivitySchema.pre('validate', function () {
  const hasStart = this.startTime != null;
  const hasEnd = this.endTime != null;
  const hasDuration = this.duration != null;

  if (hasDuration && (hasStart || hasEnd)) {
    throw new Error('Cannot have both duration AND start/end times');
  }

  if (!hasDuration && hasStart !== hasEnd) {
    throw new Error('Must provide both startTime and endTime together');
  }

  if (!hasDuration && !hasStart && !hasEnd) {
    throw new Error('Activity must have duration or start/end time');
  }
});

// Unique: one activity name per user per day
customActivitySchema.index({ userId: 1, date: 1, name: 1 }, { unique: true });

export const CustomActivity = mongoose.model<ICustomActivity>(
  'CustomActivity',
  customActivitySchema
);
