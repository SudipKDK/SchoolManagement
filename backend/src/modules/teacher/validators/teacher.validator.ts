import { z } from "zod";

export const createTeacherSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID is required"),
    employeeId: z.string().optional(),
    designation: z.string().optional(),
    joinedAt: z.string().datetime().optional(), // ISO 8601 string
  }),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>["body"];
