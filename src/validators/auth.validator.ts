import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(3).max(30).optional(),
    email: z.string({ required_error: "Email is required." }).email("Invalid email address."),
    password: z.string({ required_error: "Password is required." }).min(8, "Password must be at least 8 characters long.").max(100),
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    fullName: z.string().min(2).max(100).optional(),
    phoneNumber: z.string().min(10).max(15).optional(),
});

export type RegisterType = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string({ required_error: "Email is required." }).email("Invalid email address."),
    password: z.string({ required_error: "Password is required." }).min(8, "Password must be at least 8 characters long.").max(100),
});

export type LoginType = z.infer<typeof loginSchema>;
