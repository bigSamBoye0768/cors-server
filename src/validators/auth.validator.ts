import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(3).max(30).optional(),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    fullName: z.string().min(2).max(100).optional(),
    phoneNumber: z.string().min(10).max(15).optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
});
