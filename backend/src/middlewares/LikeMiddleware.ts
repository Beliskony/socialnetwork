import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const LikeRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
             res.status(400).json({ 
                message: "Validation error", 
                errors: result.error.errors 
            });
        }
        req.body = result.data; // Update req.body with parsed data
        next();
    };
};
