import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as userController from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validateUserCreation, validateUserUpdate } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'user-service' });
});

// Protected routes
router.use(authenticateToken);

router.get('/', asyncHandler(userController.getAllUsers));
router.get('/:id', asyncHandler(userController.getUserById));
router.post('/', validateUserCreation, asyncHandler(userController.createUser));
router.put('/:id', validateUserUpdate, asyncHandler(userController.updateUser));
router.delete('/:id', asyncHandler(userController.deleteUser));
router.get('/:id/profile', asyncHandler(userController.getUserProfile));
router.put('/:id/profile', asyncHandler(userController.updateUserProfile));

export default router;