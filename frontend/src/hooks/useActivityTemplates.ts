import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  restoreTemplate,
} from '@/services/activityTemplate.service';
import type {
  ActivityTemplate,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplatesResponse,
} from '@/types/activityTemplate.types';

interface UseActivityTemplatesReturn {
  templates: ActivityTemplate[];
  count: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createTemplate: (data: CreateTemplateDto) => Promise<void>;
  updateTemplate: (id: string, data: UpdateTemplateDto) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  restoreTemplate: (id: string) => Promise<void>;
}

/**
 * Custom hook for managing activity templates
 * Provides data fetching and mutation operations with React Query
 */
export const useActivityTemplates = (): UseActivityTemplatesReturn => {
  const queryClient = useQueryClient();

  // Fetch templates
  const { data, isLoading, error, refetch }: UseQueryResult<TemplatesResponse, Error> = useQuery({
    queryKey: ['activity-templates'],
    queryFn: () => getTemplates(false), // Only fetch active templates
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['activity-templates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Refresh dashboard too
    },
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) => updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-templates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-templates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Restore template mutation
  const restoreMutation = useMutation({
    mutationFn: restoreTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-templates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    templates: data?.templates || [],
    count: data?.count || 0,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      refetch();
    },
    createTemplate: async (templateData: CreateTemplateDto) => {
      await createMutation.mutateAsync(templateData);
    },
    updateTemplate: async (id: string, templateData: UpdateTemplateDto) => {
      await updateMutation.mutateAsync({ id, data: templateData });
    },
    deleteTemplate: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    restoreTemplate: async (id: string) => {
      await restoreMutation.mutateAsync(id);
    },
  };
};
