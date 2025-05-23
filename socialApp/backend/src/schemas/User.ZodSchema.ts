import { z } from "zod";

export const UserZodSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character"),
    profilePicture: z.string().optional(),
    phoneNumber: z.string().regex(/^(\+?\d{10,20})$/, "Invalid phone number").min(10, "Phone number must be at least 10 digits long").max(20).optional(),
    followers: z.array(z.string()).optional(), // Array of user IDs (as strings)
    createdAt: z.date().optional(), // Date of account creation (optional for validation)
});





export const LoginZodSchema = z.object({
    email: z.string().email().trim().toLowerCase().optional(),
    username: z.string().optional(),
    contact: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
}).refine(data => data.email || data.username || data.contact, {
    message: "Email, username, or contact is required",
    path: ["email"]
});



