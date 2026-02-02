import { Response } from 'express';
import { ActivityTemplate } from '../models/index.js';
import { successResponse } from '../utils/apiResponse.util.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import type { AuthRequest } from '../types/index.js';
import type { CreateTemplateInput, UpdateTemplateInput } from '../validations/activityTemplate.validation.js';

/**
 * @desc    Get all active templates for the user
 * @route   GET /api/activities/templates
 */
export const getTemplates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { includeInactive } = req.query;

  const filter: Record<string, unknown> = { userId };
  
  // By default, only show active templates
  if (includeInactive !== 'true') {
    filter.isActive = true;
  }

  const templates = await ActivityTemplate.find(filter)
    .sort({ category: 1, name: 1 }) // Sort by category then name
    .select('-__v'); // Exclude version key

  successResponse(
    res,
    {
      templates,
      count: templates.length,
    },
    'Templates fetched successfully'
  );
});

/**
 * @desc    Get single template by ID
 * @route   GET /api/activities/templates/:id
 */
export const getTemplateById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const template = await ActivityTemplate.findOne({
    _id: req.params.id,
    userId: req.user?.userId,
  });

  if (!template) {
    throw new NotFoundError('Template not found');
  }

  successResponse(res, template, 'Template fetched successfully');
});

/**
 * @desc    Create new activity template
 * @route   POST /api/activities/templates
 */
export const createTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const templateData = req.body as CreateTemplateInput;

  // Check if template with same name already exists for this user (active or inactive)
  const existingTemplate = await ActivityTemplate.findOne({
    userId,
    name: templateData.name.toLowerCase(),
  });

  if (existingTemplate) {
    if (existingTemplate.isActive) {
      throw new ConflictError('An activity template with this name already exists');
    } else {
      // Reactivate the soft-deleted template instead of creating new one
      existingTemplate.category = templateData.category;
      existingTemplate.icon = templateData.icon;
      existingTemplate.defaultDuration = templateData.defaultDuration;
      existingTemplate.isActive = true;
      await existingTemplate.save();

      return successResponse(
        res,
        existingTemplate,
        'Template reactivated successfully',
        200
      );
    }
  }

  // Create new template
  const template = await ActivityTemplate.create({
    ...templateData,
    userId,
  });

  successResponse(res, template, 'Template created successfully', 201);
});

/**
 * @desc    Update activity template
 * @route   PUT /api/activities/templates/:id
 */
export const updateTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const templateData = req.body as UpdateTemplateInput;

  // If name is being updated, check for conflicts
  if (templateData.name) {
    const existingTemplate = await ActivityTemplate.findOne({
      userId,
      name: templateData.name.toLowerCase(),
      _id: { $ne: req.params.id }, // Exclude current template
    });

    if (existingTemplate) {
      throw new ConflictError('An activity template with this name already exists');
    }
  }

  const template = await ActivityTemplate.findOneAndUpdate(
    { _id: req.params.id, userId, isActive: true },
    { $set: templateData },
    { new: true, runValidators: true }
  );

  if (!template) {
    throw new NotFoundError('Template not found or has been deleted');
  }

  successResponse(res, template, 'Template updated successfully');
});

/**
 * @desc    Delete activity template (soft delete)
 * @route   DELETE /api/activities/templates/:id
 */
export const deleteTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const template = await ActivityTemplate.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.userId, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!template) {
    throw new NotFoundError('Template not found or already deleted');
  }

  successResponse(res, null, 'Template deleted successfully');
});

/**
 * @desc    Restore soft-deleted template
 * @route   PATCH /api/activities/templates/:id/restore
 */
export const restoreTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const template = await ActivityTemplate.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.userId, isActive: false },
    { $set: { isActive: true } },
    { new: true }
  );

  if (!template) {
    throw new NotFoundError('Template not found or is already active');
  }

  successResponse(res, template, 'Template restored successfully');
});
