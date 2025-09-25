import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode: number;
    isOperational: boolean;
}
export declare const createError: (message: string, statusCode: number) => AppError;
export declare const errorHandler: (err: AppError, req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, _res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map