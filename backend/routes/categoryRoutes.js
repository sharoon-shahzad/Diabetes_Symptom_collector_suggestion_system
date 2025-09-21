import express from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} from '../controllers/categoryController.js';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';
import { superAdminMiddleware } from '../middlewares/superAdminMiddleware.js';
import {
  validateCategory,
  validateCategoryUpdate,
  validateCategoryQuery,
  validateId
} from '../middlewares/contentValidationMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', validateCategoryQuery, getAllCategories);
router.get('/stats', verifyAccessTokenMiddleware, superAdminMiddleware, getCategoryStats);
router.get('/:id', validateId, getCategory);

// Protected routes (SuperAdmin only)
router.post('/', verifyAccessTokenMiddleware, superAdminMiddleware, validateCategory, createCategory);
router.put('/:id', verifyAccessTokenMiddleware, superAdminMiddleware, validateId, validateCategoryUpdate, updateCategory);
router.delete('/:id', verifyAccessTokenMiddleware, superAdminMiddleware, validateId, deleteCategory);

export default router;
