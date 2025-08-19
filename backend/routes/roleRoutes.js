import express from 'express';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';
import { superAdminMiddleware } from '../middlewares/superAdminMiddleware.js';
import { 
    getAllRoles, 
    getRolePermissions, 
    updateRolePermissions 
} from '../controllers/roleController.js';

const router = express.Router();

// All routes require authentication and super admin role
router.use(verifyAccessTokenMiddleware, superAdminMiddleware);

// Get all roles
router.get('/', getAllRoles);

// Get permissions for a specific role
router.get('/:roleId/permissions', getRolePermissions);

// Update permissions for a role
router.put('/:roleId/permissions', updateRolePermissions);

export default router;
