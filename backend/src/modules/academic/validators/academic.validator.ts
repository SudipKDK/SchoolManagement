import { z } from "zod";

// ─── Classroom Schemas ────────────────────────────────────────────────────────

export const createClassroomSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Classroom name is required" })
      .min(1, "Name cannot be empty")
      .max(50, "Name is too long")
      .trim(),
    capacity: z
      .number()
      .int()
      .positive("Capacity must be a positive number")
      .max(200, "Capacity cannot exceed 200")
      .optional(),
  }),
});

// ─── Subject Schemas ──────────────────────────────────────────────────────────

export const createSubjectSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Subject name is required" })
      .min(1, "Name cannot be empty")
      .max(100, "Name is too long")
      .trim(),
    code: z
      .string()
      .max(20, "Code is too long")
      .trim()
      .toUpperCase()
      .optional(),
  }),
});

export type CreateClassroomInput = z.infer<typeof createClassroomSchema>["body"];
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>["body"];

// ─── Teacher Assignment Schema ────────────────────────────────────────────────

export const assignTeacherSchema = z.object({
  params: z.object({
    classroomId: z.string().min(1, "Classroom ID is required in URL"),
  }),
  body: z.object({
    teacherId: z.string().min(1, "Teacher ID is required"),
    subjectId: z.string().min(1, "Subject ID is required"),
  }),
});

export type AssignTeacherInput = z.infer<typeof assignTeacherSchema>["body"];
