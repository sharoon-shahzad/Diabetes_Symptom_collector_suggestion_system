import express from 'express';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';
import { superAdminMiddleware } from '../middlewares/superAdminMiddleware.js';
import { 
    getAllPermissions, 
    getPermissionById 
} from '../controllers/permissionController.js';

const router = express.Router();

// All routes require authentication and super admin role
router.use(verifyAccessTokenMiddleware, superAdminMiddleware);

// Get all permissions
router.get('/', getAllPermissions);

// Get permission by ID
router.get('/:id', getPermissionById);

export default router;
