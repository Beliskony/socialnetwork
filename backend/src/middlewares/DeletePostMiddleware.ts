import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import PostModel from "../models/Post.model";

export const DeletePostMiddleware = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // 1. Valider le body via Zod
            const { postId, userId } = schema.parse(req.body);

            // 2. Trouver le post
            const post = await PostModel.findById(postId);
            if (!post) {
                 res.status(404).json({ message: "Post not found" });
            }

            // 3. Vérifier l'auteur
            if (post && post.user.toString() !== userId) {
                 res.status(403).json({ message: "You are not authorized to delete this post" });
                 
            }

            // Ajouter le post dans req.body si besoin
            req.body.post = post;

            next();
        } catch (error: any) {
            if (error.name === "ZodError") {
                 res.status(400).json({ message: "Validation failed", errors: error.errors });
            }
             res.status(500).json({ message: "Internal server error", error });
        }
    };
};
