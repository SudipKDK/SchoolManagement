/**
 * Academic Repository
 * 
 * Handles database operations for Classrooms and Subjects.
 * ALWAYS scopes queries by `schoolId` to maintain tenant isolation.
 */
import { prisma } from "../../../lib/prisma.js";
import type { Classroom, Subject } from "../../../generated/prisma/client.js";
import type { CreateClassroomInput, CreateSubjectInput } from "../validators/academic.validator.js";

// ─── Classroom ────────────────────────────────────────────────────────────────

export async function createClassroom(schoolId: string, data: CreateClassroomInput): Promise<Classroom> {
  return prisma.classroom.create({
    data: { schoolId, name: data.name, capacity: data.capacity },
  });
}

export async function listClassrooms(schoolId: string): Promise<Classroom[]> {
  return prisma.classroom.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });
}

// ─── Subject ──────────────────────────────────────────────────────────────────

export async function createSubject(schoolId: string, data: CreateSubjectInput): Promise<Subject> {
  return prisma.subject.create({
    data: { schoolId, name: data.name, code: data.code },
  });
}

export async function listSubjects(schoolId: string): Promise<Subject[]> {
  return prisma.subject.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });
}

// ─── Teacher Assignments (Junction) ──────────────────────────────────────────

const assignmentInclude = {
  teacher: { include: { user: { select: { id: true, email: true } } } },
  subject: true,
  classroom: true,
};

export async function assignTeacher(schoolId: string, data: { teacherId: string, subjectId: string, classroomId: string }) {
  return prisma.teacherSubjectClass.create({
    data: {
      schoolId,
      teacherId: data.teacherId,
      subjectId: data.subjectId,
      classroomId: data.classroomId,
    },
    include: assignmentInclude,
  });
}

export async function getAssignmentsByClassroom(schoolId: string, classroomId: string) {
  return prisma.teacherSubjectClass.findMany({
    where: { schoolId, classroomId },
    include: assignmentInclude,
  });
}
