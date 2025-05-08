import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const CommentMiddleware = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate the request body against the schema
            schema.parse(req.body);
            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            // Handle validation errors
            res.status(400).json({ message: 'Validation error', errors: error });
        }
    };
}