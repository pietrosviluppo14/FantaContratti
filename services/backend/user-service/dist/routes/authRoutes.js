"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const authController = __importStar(require("../controllers/authController.js"));
const validation_js_1 = require("../middleware/validation.js");
const router = (0, express_1.Router)();
router.post('/register', validation_js_1.validateRegisterUser, (0, errorHandler_js_1.asyncHandler)(authController.register));
router.post('/login', validation_js_1.validateLoginUser, (0, errorHandler_js_1.asyncHandler)(authController.login));
router.post('/logout', (0, errorHandler_js_1.asyncHandler)(authController.logout));
router.post('/refresh', (0, errorHandler_js_1.asyncHandler)(authController.refreshToken));
router.post('/forgot-password', validation_js_1.validateForgotPassword, (0, errorHandler_js_1.asyncHandler)(authController.forgotPassword));
router.post('/reset-password', validation_js_1.validateResetPassword, (0, errorHandler_js_1.asyncHandler)(authController.resetPassword));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map