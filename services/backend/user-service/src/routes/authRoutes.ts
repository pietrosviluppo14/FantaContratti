import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as authController from '../controllers/authController.js';
import { validateLoginUser, validateRegisterUser, validateForgotPassword, validateResetPassword } from '../middleware/validation.js';

const router = Router();

// Authentication routes
router.post('/register', validateRegisterUser, asyncHandler(authController.register));
router.post('/login', validateLoginUser, asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/forgot-password', validateForgotPassword, asyncHandler(authController.forgotPassword));
router.post('/reset-password', validateResetPassword, asyncHandler(authController.resetPassword));

export default router;