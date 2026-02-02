import { Router } from 'express';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  restoreTemplate,
} from '../controllers/activityTemplate.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createTemplateSchema,
  updateTemplateSchema,
  templateIdParamSchema,
} from '../validations/activityTemplate.validation.js';

const router = Router();

// All routes are protected
router.use(authenticate);

// CRUD routes for templates
router.get('/', getTemplates);
router.get('/:id', validate(templateIdParamSchema, 'params'), getTemplateById);
router.post('/', validate(createTemplateSchema), createTemplate);
router.put('/:id', validate(templateIdParamSchema, 'params'), validate(updateTemplateSchema), updateTemplate);
router.delete('/:id', validate(templateIdParamSchema, 'params'), deleteTemplate);

// Restore soft-deleted template
router.patch('/:id/restore', validate(templateIdParamSchema, 'params'), restoreTemplate);

export default router;
