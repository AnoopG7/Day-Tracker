import mongoose, { Document, Schema } from 'mongoose';

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const DATA_SOURCES = ['manual', 'imported'] as const;
export type DataSource = (typeof DATA_SOURCES)[number];

export interface INutritionEntry extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  mealType: MealType;
  foodName: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  source: DataSource;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const nutritionEntrySchema = new Schema<INutritionEntry>(
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
    mealType: {
      type: String,
      required: [true, 'Meal type is required'],
      enum: MEAL_TYPES,
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      lowercase: true,
      maxlength: [100, 'Food name cannot exceed 100 characters'],
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
    },
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative'],
    },
    carbs: {
      type: Number,
      min: [0, 'Carbs cannot be negative'],
    },
    fats: {
      type: Number,
      min: [0, 'Fats cannot be negative'],
    },
    fiber: {
      type: Number,
      min: [0, 'Fiber cannot be negative'],
    },
    source: {
      type: String,
      enum: DATA_SOURCES,
      default: 'manual',
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

// Indexes for different query patterns
nutritionEntrySchema.index({ userId: 1, date: -1 }); // Most recent entries
nutritionEntrySchema.index({ userId: 1, mealType: 1, date: -1 }); // Meal type analytics

export const NutritionEntry = mongoose.model<INutritionEntry>('NutritionEntry', nutritionEntrySchema);
