/**
 * Student Repository
 *
 * CRITICAL DESIGN RULE — TENANT ISOLATION:
 * Every single query in this file takes a `schoolId` parameter and
 * includes it in the WHERE clause. This is non-negotiable in a
 * multi-tenant system. Without it, a user at School A could read
 * or modify students at School B.
 *
 * Think of schoolId as a "partition key" — data is invisible across partitions.
 */

import { prisma } from "../../../lib/prisma.js";
import type { Student } from "../../../generated/prisma/client.js";
import type { CreateStudentInput, UpdateStudentInput } from "../validators/student.validator.js";

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createStudent(
  schoolId: string,
  data: CreateStudentInput
): Promise<Student> {
  return prisma.student.create({
    data: {
      schoolId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      classroomId: data.classroomId,
    },
  });
}

// ─── Read One ─────────────────────────────────────────────────────────────────

/**
 * Find a student by ID, but ONLY if they belong to the given school.
 * This prevents cross-tenant data access.
 */
export async function findStudentById(
  schoolId: string,
  studentId: string
): Promise<Student | null> {
  return prisma.student.findFirst({
    where: { id: studentId, schoolId },
  });
}

// ─── Read Many (List) ─────────────────────────────────────────────────────────

export async function findStudentsBySchool(
  schoolId: string
): Promise<Student[]> {
  return prisma.student.findMany({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Update a student, scoped to a school.
 * Uses findFirst + update instead of update directly, because Prisma's
 * update() only accepts the @id field in `where`. We need to also verify
 * schoolId for tenant isolation.
 */
export async function updateStudent(
  schoolId: string,
  studentId: string,
  data: UpdateStudentInput
): Promise<Student | null> {
  // First verify the student exists AND belongs to this school
  const existing = await prisma.student.findFirst({
    where: { id: studentId, schoolId },
  });

  if (!existing) return null;

  return prisma.student.update({
    where: { id: studentId },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete a student, scoped to a school.
 * Returns the deleted record, or null if not found in this school.
 */
export async function deleteStudent(
  schoolId: string,
  studentId: string
): Promise<Student | null> {
  const existing = await prisma.student.findFirst({
    where: { id: studentId, schoolId },
  });

  if (!existing) return null;

  return prisma.student.delete({ where: { id: studentId } });
}
