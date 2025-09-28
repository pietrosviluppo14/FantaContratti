"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({
            success: false,
            error: {
                message: 'Access token required',
                status: 401
            }
        });
        return;
    }
    try {
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({
            success: false,
            error: {
                message: 'Invalid or expired token',
                status: 403
            }
        });
        return;
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map