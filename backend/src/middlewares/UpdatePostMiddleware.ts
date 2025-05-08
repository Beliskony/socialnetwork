import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import PostModel from "../models/Post.model";

export const UpdatePostMiddleware = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const postId = req.params.id;
            const post = await PostModel.findById(postId);

            if (!post) {
                 res.status(404).json({ error: "Post not found" });
                 return;
            }

            const validatedData = schema.parse(req.body);
            Object.assign(post, validatedData);

            await post.save();
            req.body = post; // Attach the updated post to the request object
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                 res.status(400).json({ error: error.errors });
            }
            next(error);
        }
    };
};