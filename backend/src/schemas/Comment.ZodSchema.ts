import { comment } from 'postcss';
import { z } from 'zod';

export const CreateCommentZodSchema = z.object({
    user: z.string().nonempty("User ID is required"),
    post: z.string().nonempty("Post ID is required"),
    content: z.string().nonempty("Comment content is required"),
    createdAt: z.date().optional(),
});
export type CommentValidationType = z.infer<typeof CreateCommentZodSchema>;


export const UpdateCommentZodSchema = z.object({
    user: z.string().nonempty("User ID is required"),
    commentId: z.string().nonempty("Comment ID is required"),
    newCommentId: z.string().nonempty("New Comment ID is required"),
    content: z.string().nonempty("Comment content is required"),
    createdAt: z.date().optional(),
});
export type UpdateCommentValidationType = z.infer<typeof UpdateCommentZodSchema>;


export const DeleteCommentZodSchema = z.object({
    user: z.string().nonempty("User ID is required"),
    commentId: z.string().nonempty("Comment ID is required"),
});
export type DeleteCommentValidationType = z.infer<typeof DeleteCommentZodSchema>;




