import { z } from "zod";

export const StoryZodSchema = z.object({
    userId: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val),"userId doit être un ObjectId valide"), // Assuming authorId is a MongoDB ObjectId
    content: z.object({
        type: z.enum(["image", "video"]),
        data: z.string().url("Le lien doit être une URL valide"),
      }),
    createdAt: z.date().optional(),
    expiresAt: z.date().optional(),
});
export type StoryValidatorType = z.infer<typeof StoryZodSchema>;


export const DeleteStoryZodSchema = z.object({
    id: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), "Invalid ID format"),
});
export type DeleteStoryValidatorType = z.infer<typeof DeleteStoryZodSchema>;