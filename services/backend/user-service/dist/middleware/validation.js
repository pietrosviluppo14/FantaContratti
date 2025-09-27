"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegister = void 0;
const errorHandler_1 = require("./errorHandler");
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const isValidPassword = (password) => {
    return typeof password === 'string' && password.length >= 6;
};
const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};
const validateRegister = (req, _res, next) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            throw (0, errorHandler_1.createError)('All fields are required: email, username, password', 400);
        }
        if (!isValidEmail(email)) {
            throw (0, errorHandler_1.createError)('Please provide a valid email address', 400);
        }
        if (!isValidUsername(username)) {
            throw (0, errorHandler_1.createError)('Username must be 3-20 characters and contain only letters, numbers, and underscores', 400);
        }
        if (!isValidPassword(password)) {
            throw (0, errorHandler_1.createError)('Password must be at least 6 characters long', 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateRegister = validateRegister;
const validateLogin = (req, _res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw (0, errorHandler_1.createError)('Email and password are required', 400);
        }
        if (!isValidEmail(email)) {
            throw (0, errorHandler_1.createError)('Please provide a valid email address', 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateLogin = validateLogin;
//# sourceMappingURL=validation.js.map