import api from './api';
import type { ApiResponse } from '../types/api.types';

/** Streak data from backend */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

/** DayLog API service */
export const daylogService = {
  /**
   * Get current and longest streak
   * Streak counts if sleep OR exercise is logged
   */
  async getStreak(): Promise<StreakData> {
    const response = await api.get<ApiResponse<StreakData>>('/daylogs/streak');
    return response.data.data;
  },
};

export default daylogService;
