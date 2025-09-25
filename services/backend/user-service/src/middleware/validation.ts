/**
 * Validation middleware
 */
import { Request, Response, NextFunction } from 'express';

export const validateUserCreation = (req: Request, res: Response, next: NextFunction): void => {
  // Basic validation for user creation
  const { email, username, password } = req.body;
  
  if (!email || !username || !password) {
    res.status(400).json({
      success: false,
      message: 'Email, username, and password are required'
    });
    return;
  }
  
  next();
};

export const validateUserUpdate = (_req: Request, _res: Response, next: NextFunction): void => {
  // Basic validation for user update
  next();
};

export const validateLoginUser = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
    return;
  }
  
  next();
};

export const validateRegisterUser = (req: Request, res: Response, next: NextFunction): void => {
  const { email, username, password } = req.body;
  
  if (!email || !username || !password) {
    res.status(400).json({
      success: false,
      message: 'Email, username, and password are required'
    });
    return;
  }
  
  next();
};

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400).json({
      success: false,
      message: 'Email is required'
    });
    return;
  }
  
  next();
};

export const validateResetPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    res.status(400).json({
      success: false,
      message: 'Token and password are required'
    });
    return;
  }
  
  next();
};
