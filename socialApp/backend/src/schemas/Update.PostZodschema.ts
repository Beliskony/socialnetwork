import { z } from "zod";

export const PostUpdateZodSchema = z.object({

  text: z.string().max(500, "Text must be at most 500 characters").optional(),
  media: z
    .object({
      images: z.array(z.string().url().trim()).max(5, "Maximum 5 images are allowed.").optional(),
      videos: z.array(z.string().url().trim()).max(2, "Maximum 2 videos are allowed.").optional(),
    })
    .optional(),
});