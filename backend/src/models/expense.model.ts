import mongoose, { Document, Schema } from 'mongoose';

export const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'shopping',
  'bills',
  'entertainment',
  'health',
  'other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const PAYMENT_METHODS = ['cash', 'card', 'upi', 'netbanking', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const DATA_SOURCES = ['manual', 'imported'] as const;
export type DataSource = (typeof DATA_SOURCES)[number];

export interface IExpenseEntry extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  merchant?: string;
  source: DataSource;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseEntrySchema = new Schema<IExpenseEntry>(
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
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: EXPENSE_CATEGORIES,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      maxlength: [3, 'Currency code should be 3 characters'],
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
    },
    merchant: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Merchant name cannot exceed 100 characters'],
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
expenseEntrySchema.index({ userId: 1, date: -1 }); // Most recent expenses
expenseEntrySchema.index({ userId: 1, category: 1, date: -1 }); // Category analytics

export const ExpenseEntry = mongoose.model<IExpenseEntry>('ExpenseEntry', expenseEntrySchema);
