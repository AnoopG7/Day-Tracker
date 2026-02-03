import api from './api';

export interface NutritionEstimate {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  servingSize: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Get AI-estimated nutrition macros from food name
 */
export async function estimateNutrition(foodName: string): Promise<NutritionEstimate> {
  const response = await api.post<{ success: boolean; data: NutritionEstimate }>('/ai/nutrition', {
    foodName,
  });
  return response.data.data;
}

export default { estimateNutrition };
