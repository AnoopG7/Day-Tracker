import mongoose, { Document, Schema } from 'mongoose';

// Activity can be tracked with EITHER times OR duration, not both
interface IActivityEntry {
  startTime?: string; // "HH:mm" format
  endTime?: string; // "HH:mm" format
  duration?: number; // minutes (use if start/end not provided)
}

export interface IDayLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  sleep: IActivityEntry;
  exercise: IActivityEntry;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Default activity names (used to block in CustomActivity)
export const DEFAULT_ACTIVITIES = ['sleep', 'exercise'] as const;

/**
 * Validates activity entry:
 * - Empty object is valid (no data entered yet)
 * - Duration alone is valid
 * - Both startTime and endTime together is valid
 * - Partial times or all three is invalid
 */
function validateActivityEntry(entry: IActivityEntry): boolean {
  const hasStart = entry.startTime != null;
  const hasEnd = entry.endTime != null;
  const hasDuration = entry.duration != null;

  // Empty object is ok (no data yet)
  if (!hasDuration && !hasStart && !hasEnd) return true;

  // Can't have duration AND any times
  if (hasDuration && (hasStart || hasEnd)) return false;

  // If using times, must have BOTH (not just one)
  if ((hasStart || hasEnd) && hasStart !== hasEnd) return false;

  return true;
}

// Reusable activity entry schema
const activityEntrySchema = new Schema<IActivityEntry>(
  {
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
  },
  { _id: false }
);

const dayLogSchema = new Schema<IDayLog>(
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
    sleep: {
      type: activityEntrySchema,
      default: {},
      validate: {
        validator: validateActivityEntry,
        message: 'Invalid sleep entry',
      },
    },
    exercise: {
      type: activityEntrySchema,
      default: {},
      validate: {
        validator: validateActivityEntry,
        message: 'Invalid exercise entry',
      },
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

// Unique compound index (descending date for recent-first queries)
dayLogSchema.index({ userId: 1, date: -1 }, { unique: true });

export const DayLog = mongoose.model<IDayLog>('DayLog', dayLogSchema);
