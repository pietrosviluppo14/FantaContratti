import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

// Utility function per validare email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utility function per validare password
const isValidPassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 6;
};

// Utility function per validare username
const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Middleware di validazione per la registrazione
 */
export const validateRegister = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const { email, username, password } = req.body;

    // Verifica che tutti i campi richiesti siano presenti
    if (!email || !username || !password) {
      throw createError('All fields are required: email, username, password', 400);
    }

    // Validazione email
    if (!isValidEmail(email)) {
      throw createError('Please provide a valid email address', 400);
    }

    // Validazione username
    if (!isValidUsername(username)) {
      throw createError('Username must be 3-20 characters and contain only letters, numbers, and underscores', 400);
    }

    // Validazione password
    if (!isValidPassword(password)) {
      throw createError('Password must be at least 6 characters long', 400);
    }

    // Se arriva qui, la validazione è passata
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware di validazione per il login
 */
export const validateLogin = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const { email, password } = req.body;

    // Verifica che tutti i campi richiesti siano presenti
    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    // Validazione email
    if (!isValidEmail(email)) {
      throw createError('Please provide a valid email address', 400);
    }

    // Se arriva qui, la validazione è passata
    next();
  } catch (error) {
    next(error);
  }
};