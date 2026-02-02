/**
 * Activity Template Types
 * Templates are definitions of custom activities that users create.
 * They serve as "templates" for daily activity logs.
 */

export type ActivityCategory =
  | 'health'
  | 'learning'
  | 'hobbies'
  | 'work'
  | 'social'
  | 'selfcare'
  | 'other';

// Reserved activity names that users cannot create
export const RESERVED_NAMES = [
  'sleep',
  'exercise',
  'meal',
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'water',
  'expense',
  'nutrition',
] as const;

export interface ActivityTemplate {
  _id: string;
  userId: string;
  name: string; // e.g., "yoga", "reading"
  category: ActivityCategory;
  icon?: string; // emoji or icon identifier
  defaultDuration?: number; // minutes (optional preset)
  isActive: boolean; // soft delete flag
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  category: ActivityCategory;
  icon?: string;
  defaultDuration?: number;
}

export interface UpdateTemplateDto {
  name?: string;
  category?: ActivityCategory;
  icon?: string;
  defaultDuration?: number;
}

export interface TemplatesResponse {
  templates: ActivityTemplate[];
  count: number;
}

// Category display information
export interface CategoryInfo {
  value: ActivityCategory;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORY_INFO: Record<ActivityCategory, CategoryInfo> = {
  health: {
    value: 'health',
    label: 'Health & Fitness',
    icon: '💪',
    color: '#4caf50', // green
  },
  learning: {
    value: 'learning',
    label: 'Learning',
    icon: '📚',
    color: '#2196f3', // blue
  },
  hobbies: {
    value: 'hobbies',
    label: 'Hobbies',
    icon: '🎨',
    color: '#ff9800', // orange
  },
  work: {
    value: 'work',
    label: 'Work',
    icon: '💼',
    color: '#9c27b0', // purple
  },
  social: {
    value: 'social',
    label: 'Social',
    icon: '👥',
    color: '#e91e63', // pink
  },
  selfcare: {
    value: 'selfcare',
    label: 'Self Care',
    icon: '🧘',
    color: '#00bcd4', // cyan
  },
  other: {
    value: 'other',
    label: 'Other',
    icon: '✨',
    color: '#607d8b', // gray
  },
};

// Common activity icons for picker
export const ACTIVITY_ICONS = [
  '🧘',
  '💪',
  '🏃',
  '🚴',
  '🏊',
  '⚽',
  '🏀',
  '🎾', // Sports & Fitness
  '📚',
  '✍️',
  '💻',
  '🎓',
  '🔬',
  '🎨',
  '📖',
  '🖊️', // Learning & Work
  '🎸',
  '🎵',
  '🎮',
  '🎬',
  '📷',
  '🎭',
  '🎪',
  '🎰', // Hobbies & Entertainment
  '🍳',
  '🧘‍♀️',
  '💆',
  '💅',
  '🛀',
  '😴',
  '🧹',
  '🌱', // Self Care
  '☕',
  '🍷',
  '🎉',
  '🎂',
  '🎁',
  '💬',
  '📞',
  '✉️', // Social
  '⚡',
  '🌟',
  '✨',
  '🔥',
  '💎',
  '🏆',
  '🎯',
  '💫', // General
];
