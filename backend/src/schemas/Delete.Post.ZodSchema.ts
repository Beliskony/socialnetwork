// DeletePostSchema.ts
import { z } from "zod";

export const DeletePostSchema = z.object({
    postId: z.string().nonempty("Post ID is required"),
    user: z.string().nonempty("User ID is required"),
});
