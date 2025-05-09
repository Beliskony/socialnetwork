// DeletePostSchema.ts
import { z } from "zod";

export const DeletePostSchema = z.object({
    postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format").nonempty("Post ID is required"),
    user: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format").nonempty("User ID is required"),
});
