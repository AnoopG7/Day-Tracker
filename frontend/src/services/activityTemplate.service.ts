import api from './api';
import type { ApiResponse } from '../types/api.types';
import type {
  ActivityTemplate,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplatesResponse,
} from '@/types/activityTemplate.types';

/**
 * Activity Template Service
 * Handles all API calls related to activity template management
 */

const TEMPLATES_BASE_URL = '/activities/templates';

/**
 * Fetch all active templates for the current user
 */
export const getTemplates = async (includeInactive = false): Promise<TemplatesResponse> => {
  const params = includeInactive ? { includeInactive: 'true' } : {};
  const response = await api.get<ApiResponse<TemplatesResponse>>(TEMPLATES_BASE_URL, { params });
  return response.data.data;
};

/**
 * Fetch a single template by ID
 */
export const getTemplateById = async (id: string): Promise<ActivityTemplate> => {
  const response = await api.get<ApiResponse<ActivityTemplate>>(`${TEMPLATES_BASE_URL}/${id}`);
  return response.data.data;
};

/**
 * Create a new activity template
 */
export const createTemplate = async (data: CreateTemplateDto): Promise<ActivityTemplate> => {
  const response = await api.post<ApiResponse<ActivityTemplate>>(TEMPLATES_BASE_URL, data);
  return response.data.data;
};

/**
 * Update an existing template
 */
export const updateTemplate = async (
  id: string,
  data: UpdateTemplateDto
): Promise<ActivityTemplate> => {
  const response = await api.put<ApiResponse<ActivityTemplate>>(
    `${TEMPLATES_BASE_URL}/${id}`,
    data
  );
  return response.data.data;
};

/**
 * Delete a template (soft delete)
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  await api.delete(`${TEMPLATES_BASE_URL}/${id}`);
};

/**
 * Restore a soft-deleted template
 */
export const restoreTemplate = async (id: string): Promise<ActivityTemplate> => {
  const response = await api.patch<ApiResponse<ActivityTemplate>>(
    `${TEMPLATES_BASE_URL}/${id}/restore`
  );
  return response.data.data;
};
