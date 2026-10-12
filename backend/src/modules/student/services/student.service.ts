/**
 * Student Service
 *
 * WHY THE SERVICE ALWAYS RECEIVES schoolId:
 * The controller extracts `req.schoolId` (set by requireSchool middleware)
 * and passes it down. The service never reads from `req` — it's pure business
 * logic. This means you could call studentService.create() from a CLI script,
 * a background job, or a test — no HTTP context required.
 *
 * The service also transforms Prisma models into clean response shapes,
 * ensuring we never accidentally leak internal fields (like updatedAt).
 */

import { AppError } from "../../../utils/AppError.js";
import * as studentRepo from "../repositories/student.repository.js";
import type { CreateStudentInput, UpdateStudentInput } from "../validators/student.validator.js";

// ─── Response Type ────────────────────────────────────────────────────────────

export type StudentResponse = {
  id: string;
  classroomId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  dateOfBirth: Date | null;
  enrolledAt: Date;
  createdAt: Date;
};

/** Transforms a Prisma Student into a clean API response. */
function toResponse(student: {
  id: string;
  classroomId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  dateOfBirth: Date | null;
  enrolledAt: Date;
  createdAt: Date;
}): StudentResponse {
  return {
    id: student.id,
    classroomId: student.classroomId,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    dateOfBirth: student.dateOfBirth,
    enrolledAt: student.enrolledAt,
    createdAt: student.createdAt,
  };
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createStudent(
  schoolId: string,
  data: CreateStudentInput
): Promise<StudentResponse> {
  const student = await studentRepo.createStudent(schoolId, data);
  return toResponse(student);
}

// ─── Get One ──────────────────────────────────────────────────────────────────

export async function getStudentById(
  schoolId: string,
  studentId: string
): Promise<StudentResponse> {
  const student = await studentRepo.findStudentById(schoolId, studentId);
  if (!student) {
    throw new AppError("NOT_FOUND", "Student not found", 404);
  }
  return toResponse(student);
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listStudents(
  schoolId: string
): Promise<StudentResponse[]> {
  const students = await studentRepo.findStudentsBySchool(schoolId);
  return students.map(toResponse);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateStudent(
  schoolId: string,
  studentId: string,
  data: UpdateStudentInput
): Promise<StudentResponse> {
  const student = await studentRepo.updateStudent(schoolId, studentId, data);
  if (!student) {
    throw new AppError("NOT_FOUND", "Student not found", 404);
  }
  return toResponse(student);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteStudent(
  schoolId: string,
  studentId: string
): Promise<void> {
  const student = await studentRepo.deleteStudent(schoolId, studentId);
  if (!student) {
    throw new AppError("NOT_FOUND", "Student not found", 404);
  }
  // No return value — 204 No Content will be sent by the controller.
}
