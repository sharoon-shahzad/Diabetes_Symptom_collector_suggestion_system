import express from 'express';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';
import { roleCheckMiddleware } from '../middlewares/roleCheckMiddleware.js';
import { superAdminMiddleware } from '../middlewares/superAdminMiddleware.js';
import { 
  getCurrentUser, 
  getAllUsers, 
  updateUser, 
  deleteUser, 
  getMyDiseaseData,
  getUserDiseaseDataForEditing,
  updateUserDiseaseDataAnswer,
  submitDiseaseData,
  getAllAdmins,
  getUserRoles,
  updateUserRole
} from '../controllers/userController.js';

const router = express.Router();

//! Protected Routes for admin

router.get('/profile', verifyAccessTokenMiddleware, getCurrentUser);

//! protected routes for admin
router.get('/allUsers', verifyAccessTokenMiddleware, roleCheckMiddleware, getAllUsers);

router.put('/updateUser/:id', verifyAccessTokenMiddleware, roleCheckMiddleware, updateUser);

router.delete('/deleteUser/:id', verifyAccessTokenMiddleware, roleCheckMiddleware, deleteUser);

// Add this route for dashboard disease data
router.get('/my-disease-data', verifyAccessTokenMiddleware, getMyDiseaseData);

// Disease data editing routes
router.get('/disease-data-for-editing', verifyAccessTokenMiddleware, getUserDiseaseDataForEditing);
router.put('/update-disease-data-answer', verifyAccessTokenMiddleware, updateUserDiseaseDataAnswer);
router.post('/submit-disease-data', verifyAccessTokenMiddleware, submitDiseaseData);

// New routes for super admin functionality
router.get('/allAdmins', verifyAccessTokenMiddleware, superAdminMiddleware, getAllAdmins);
router.get('/roles', verifyAccessTokenMiddleware, getUserRoles);
router.put('/updateUserRole/:id', verifyAccessTokenMiddleware, superAdminMiddleware, updateUserRole);

export default router;
