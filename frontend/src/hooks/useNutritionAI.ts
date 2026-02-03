import { useState, useCallback } from 'react';
import { estimateNutrition, type NutritionEstimate } from '@services/ai.service';

interface UseNutritionAIReturn {
  isLoading: boolean;
  error: string | null;
  estimateMacros: (foodName: string) => Promise<NutritionEstimate | null>;
  clearError: () => void;
}

/**
 * Hook for AI-powered nutrition estimation
 */
export function useNutritionAI(): UseNutritionAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimateMacros = useCallback(
    async (foodName: string): Promise<NutritionEstimate | null> => {
      if (!foodName.trim()) {
        setError('Please enter a food name first');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await estimateNutrition(foodName.trim());
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to estimate nutrition';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { isLoading, error, estimateMacros, clearError };
}

export default useNutritionAI;
