import { z } from "zod";

// ─── Academic Year Schemas ───────────────────────────────────────────────────

export const createAcademicYearSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Academic year name is required" })
      .min(1, "Name cannot be empty")
      .max(50, "Name is too long")
      .trim(),
    startDate: z.string({ error: "Start date is required" }).datetime(),
    endDate: z.string({ error: "End date is required" }).datetime(),
    isCurrent: z.boolean().optional().default(false),
  }),
});

export const updateAcademicYearSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Academic year ID is required"),
  }),
  body: z.object({
    name: z.string().min(1).max(50).trim().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    isCurrent: z.boolean().optional(),
  }),
});

export const academicYearIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Academic year ID is required"),
  }),
});

export const createTermSchema = z.object({
  params: z.object({
    yearId: z.string().min(1, "Academic year ID is required"),
  }),
  body: z.object({
    name: z
      .string({ error: "Term name is required" })
      .min(1, "Name cannot be empty")
      .max(50, "Name is too long")
      .trim(),
    startDate: z.string({ error: "Start date is required" }).datetime(),
    endDate: z.string({ error: "End date is required" }).datetime(),
  }),
});

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
    academicYearId: z.string().trim().optional(),
  }),
});

export const updateClassroomSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Classroom ID is required"),
  }),
  body: z.object({
    name: z.string().min(1).max(50).trim().optional(),
    capacity: z.number().int().positive().max(200).optional(),
    academicYearId: z.string().trim().nullable().optional(),
  }),
});

export const classroomIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Classroom ID is required"),
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

export const updateSubjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Subject ID is required"),
  }),
  body: z.object({
    name: z.string().min(1).max(100).trim().optional(),
    code: z.string().max(20).trim().toUpperCase().optional(),
  }),
});

export const subjectIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Subject ID is required"),
  }),
});

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

export const assignmentIdParamSchema = z.object({
  params: z.object({
    classroomId: z.string().min(1, "Classroom ID is required"),
    assignmentId: z.string().min(1, "Assignment ID is required"),
  }),
});

// ─── Timetable Schemas ────────────────────────────────────────────────────────

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createTimetablePeriodSchema = z.object({
  body: z.object({
    classroomId: z.string().min(1, "Classroom ID is required"),
    subjectId: z.string().min(1, "Subject ID is required"),
    teacherId: z.string().min(1, "Teacher ID is required"),
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    startTime: z.string().regex(timeRegex, "Start time must be in HH:mm format (e.g. 09:00)"),
    endTime: z.string().regex(timeRegex, "End time must be in HH:mm format (e.g. 09:45)"),
  }),
});

export const timetableIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Timetable Period ID is required"),
  }),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>["body"];
export type UpdateAcademicYearInput = z.infer<typeof updateAcademicYearSchema>["body"];
export type CreateTermInput = z.infer<typeof createTermSchema>["body"];
export type CreateClassroomInput = z.infer<typeof createClassroomSchema>["body"];
export type UpdateClassroomInput = z.infer<typeof updateClassroomSchema>["body"];
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>["body"];
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>["body"];
export type AssignTeacherInput = z.infer<typeof assignTeacherSchema>["body"];
export type CreateTimetablePeriodInput = z.infer<typeof createTimetablePeriodSchema>["body"];
