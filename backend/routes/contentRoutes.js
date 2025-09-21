import express from 'express';
import {
  getAllContent,
  getContent,
  getContentBySlug,
  createContent,
  updateContent,
  deleteContent,
  getContentStats,
  getRelatedContent
} from '../controllers/contentController.js';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';
import { superAdminMiddleware } from '../middlewares/superAdminMiddleware.js';
import {
  validateContent,
  validateContentUpdate,
  validateContentQuery,
  validateId,
  validateSlug
} from '../middlewares/contentValidationMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', validateContentQuery, getAllContent);
router.get('/stats', verifyAccessTokenMiddleware, superAdminMiddleware, getContentStats);
router.get('/slug/:slug', validateSlug, getContentBySlug);
router.get('/:id/related', validateId, getRelatedContent);
router.get('/:id', validateId, getContent);

// Protected routes (SuperAdmin only)
router.post('/', verifyAccessTokenMiddleware, superAdminMiddleware, validateContent, createContent);
router.put('/:id', verifyAccessTokenMiddleware, superAdminMiddleware, validateId, validateContentUpdate, updateContent);
router.delete('/:id', verifyAccessTokenMiddleware, superAdminMiddleware, validateId, deleteContent);

export default router;
