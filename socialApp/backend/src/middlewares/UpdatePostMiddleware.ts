import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";


export const UpdatePostMiddleware = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
           const validatedData = schema.parse(req.body);
           req.body = validatedData;
           next();
        } catch (error) {
            if (error instanceof ZodError) {
                 res.status(400).json({ error: error.errors });
            }
            next(error);
        }
    };
};