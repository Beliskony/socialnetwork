import { z } from "zod";
export const PostZodValidator = z.object({
    user: z.string().nonempty("User ID is required"), // Assuming ObjectId is represented as a string
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
