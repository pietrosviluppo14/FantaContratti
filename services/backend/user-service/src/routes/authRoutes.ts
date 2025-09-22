import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as authController from '../controllers/authController';
import { validateLogin, validateRegister } from '../middleware/validation';

const router = Router();

// Authentication routes
router.post('/register', validateRegister, asyncHandler(authController.register));
router.post('/login', validateLogin, asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));

export default router;