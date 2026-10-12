import { z } from "zod";

// ─── Create Student ───────────────────────────────────────────────────────────

export const createStudentSchema = z.object({
  body: z.object({
    firstName: z
      .string({ error: "First name is required" })
      .min(1, "First name cannot be empty")
      .max(100, "First name is too long")
      .trim(),
    lastName: z
      .string({ error: "Last name is required" })
      .min(1, "Last name cannot be empty")
      .max(100, "Last name is too long")
      .trim(),
    email: z
      .string()
      .email("Must be a valid email")
      .toLowerCase()
      .trim()
      .optional(),
    dateOfBirth: z
      .string()
      .datetime({ message: "Must be a valid ISO date" })
      .optional(),
    classroomId: z
      .string()
      .trim()
      .optional(),
  }),
});

// ─── Update Student ───────────────────────────────────────────────────────────
// Uses .partial() — every field becomes optional.
// This is the "PATCH" pattern: only send the fields you want to change.

export const updateStudentSchema = z.object({
  params: z.object({
    id: z.string({ error: "Student ID is required" }),
  }),
  body: createStudentSchema.shape.body.partial(),
});

// ─── Params-only schemas ──────────────────────────────────────────────────────

export const studentIdParamSchema = z.object({
  params: z.object({
    id: z.string({ error: "Student ID is required" }),
  }),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateStudentInput = z.infer<typeof createStudentSchema>["body"];
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>["body"];
