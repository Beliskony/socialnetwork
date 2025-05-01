import { z } from "zod";


export const StoryZodValidator = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    content: z.string().min(1, "Content is required"),
    authorId: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val)), // Assuming authorId is a MongoDB ObjectId
    published: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type StoryValidatorType = z.infer<typeof StoryZodValidator>;