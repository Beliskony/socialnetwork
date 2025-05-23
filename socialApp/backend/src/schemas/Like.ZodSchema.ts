import { z } from 'zod';

export const LikeZodSchema = z.object({
    userId: z.string().nonempty("User ID is required"),
    postId: z.string().nonempty("Post ID is required"),
    isLiked: z.boolean().default(false), // Default to false if not provided
});

export type LikeValidationType = z.infer<typeof LikeZodSchema>;