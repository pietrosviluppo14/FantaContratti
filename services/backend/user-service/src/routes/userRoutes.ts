import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as userController from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'user-service' });
});

// Protected routes
router.use(authenticateToken);

router.get('/', asyncHandler(userController.getAllUsers));
router.get('/:id', asyncHandler(userController.getUserById));
router.post('/', asyncHandler(userController.createUser));
router.put('/:id', asyncHandler(userController.updateUser));
router.delete('/:id', asyncHandler(userController.deleteUser));
router.get('/:id/profile', asyncHandler(userController.getUserProfile));
router.put('/:id/profile', asyncHandler(userController.updateUserProfile));

export default router;