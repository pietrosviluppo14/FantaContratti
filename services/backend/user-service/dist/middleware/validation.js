"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = exports.validateForgotPassword = exports.validateRegisterUser = exports.validateLoginUser = exports.validateUserUpdate = exports.validateUserCreation = void 0;
const validateUserCreation = (req, res, next) => {
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
exports.validateUserCreation = validateUserCreation;
const validateUserUpdate = (_req, _res, next) => {
    next();
};
exports.validateUserUpdate = validateUserUpdate;
const validateLoginUser = (req, res, next) => {
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
exports.validateLoginUser = validateLoginUser;
const validateRegisterUser = (req, res, next) => {
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
exports.validateRegisterUser = validateRegisterUser;
const validateForgotPassword = (req, res, next) => {
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
exports.validateForgotPassword = validateForgotPassword;
const validateResetPassword = (req, res, next) => {
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
exports.validateResetPassword = validateResetPassword;
//# sourceMappingURL=validation.js.map