import { z } from 'zod';
export const CommentZodValidator = z.object({
    user: z.string().nonempty("User ID is required"),
    post: z.string().nonempty("Post ID is required"),
    content: z.string().nonempty("Comment content is required"),
    createdAt: z.date().optional(),
});
