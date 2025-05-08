import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

const StoryMiddleware = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (['POST', 'Delete'].includes(req.method)) {
                await schema.parseAsync(req.body);
            } else if (req.method === 'GET') {
                await schema.parseAsync(req.query);
            }
            next();
        } catch (error) {
            res.status(400).json({
                message: 'Validation error',
                detail: error instanceof Error ? error : error,
            });
    };
};
}

export default StoryMiddleware;