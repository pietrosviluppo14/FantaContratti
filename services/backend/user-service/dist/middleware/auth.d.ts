import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: any;
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=auth.d.ts.map