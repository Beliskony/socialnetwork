import { z } from "zod";

export const PostZodSchema = z.object({
    user: z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), {
        message: "Invalid ObjectId format",
    }), // Assuming ObjectId is represented as a string
    text: z.string().optional(), // Optional text field with a maximum length of 500 characters,
    media: z
        .object({
            images: z.array(z.string().url().trim()).optional(),
            videos: z.array(z.string().url().trim()).optional(),
        })
        .optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Example usage for validation
export type PostValidationType = z.infer<typeof PostZodSchema>;