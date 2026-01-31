import { z } from "zod";

const responseSchema = z.object({
    idComplaint : z.preprocess(
        (val) => {
            if (val === "" || val === undefined || val === null) return undefined;
            const num = Number(val);
            return isNaN(num) ? undefined : num;
        },
        z.number().int().positive("Invalid complaint id")
    ),
    status : z.enum(["pending", "in_progress", "completed"]).optional(),
    progress : z.preprocess(
        (val) => val === "" || val === undefined || val === null ? undefined : Number(val),
        z.number().optional()
    ),
    response : z.string().min(3, "Response must be at least 3 characters long"),
});

export const createResponseSchema = responseSchema;
export const updateResponseSchema = responseSchema.partial();