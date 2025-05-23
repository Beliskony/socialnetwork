import { z } from "zod";

export const PostZodSchema = z.object({

    text: z.string().max(500, "Le texte doit contenir maxi 500 caractere").optional(), // Optional text field with a maximum length of 500 characters,
    media: z
        .object({
            images: z.array(z.string().url().trim()).max(5).optional(),
            videos: z.array(z.string().url().trim()).max(2).optional(),
        })
        .optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

// Example usage for validation
export type PostValidationType = z.infer<typeof PostZodSchema>;