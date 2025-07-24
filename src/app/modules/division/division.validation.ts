import z from "zod";

export const createDivisionZodSchema = z.object({
    name: z
        .string()
        .min(1, { message: "name must be at least 1 characters long." }),
    thumbnail: z.string().optional(),
    description: z.string().optional()
});

export const updateDivisionZodSchema = z.object({
    name: z
        .string()
        .min(1, { message: "name must be at least 1 characters long." }).optional(),
    thumbnail: z.string().optional(),
    description: z.string().optional()
});