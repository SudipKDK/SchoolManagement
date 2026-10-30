/**
 * Academic Repository
 * 
 * Handles database operations for Academic Years, Terms, Classrooms, Subjects, and Timetable.
 * ALWAYS scopes queries by `schoolId` to maintain strict tenant isolation.
 */
import { prisma } from "../../../lib/prisma.js";
import type { 
  Classroom, 
  Subject, 
  AcademicYear, 
  Term, 
  TimetablePeriod,
  DayOfWeek,
} from "../../../generated/prisma/client.js";
import type { 
  CreateClassroomInput, 
  UpdateClassroomInput,
  CreateSubjectInput,
  UpdateSubjectInput,
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
  CreateTermInput,
  CreateTimetablePeriodInput,
} from "../validators/academic.validator.js";

// ─── Academic Years ──────────────────────────────────────────────────────────

export async function createAcademicYear(
  schoolId: string, 
  data: CreateAcademicYearInput
): Promise<AcademicYear> {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (data.isCurrent) {
    return prisma.$transaction(async (tx) => {
      await tx.academicYear.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });

      return tx.academicYear.create({
        data: {
          schoolId,
          name: data.name,
          startDate,
          endDate,
          isCurrent: true,
        },
      });
    });
  }

  return prisma.academicYear.create({
    data: {
      schoolId,
      name: data.name,
      startDate,
      endDate,
      isCurrent: data.isCurrent ?? false,
    },
  });
}

export async function listAcademicYears(schoolId: string) {
  return prisma.academicYear.findMany({
    where: { schoolId },
    include: {
      terms: {
        orderBy: { startDate: "asc" },
      },
      _count: {
        select: { classrooms: true },
      },
    },
    orderBy: { startDate: "desc" },
  });
}

export async function getAcademicYearById(schoolId: string, id: string) {
  return prisma.academicYear.findFirst({
    where: { id, schoolId },
    include: {
      terms: {
        orderBy: { startDate: "asc" },
      },
      classrooms: {
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function updateAcademicYear(
  schoolId: string, 
  id: string, 
  data: UpdateAcademicYearInput
) {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);

  if (data.isCurrent === true) {
    return prisma.$transaction(async (tx) => {
      await tx.academicYear.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });
      return tx.academicYear.update({
        where: { id },
        data: { ...updateData, isCurrent: true },
      });
    });
  }

  if (data.isCurrent === false) {
    updateData.isCurrent = false;
  }

  return prisma.academicYear.update({
    where: { id },
    data: updateData,
  });
}

export async function setCurrentAcademicYear(schoolId: string, id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.academicYear.updateMany({
      where: { schoolId, isCurrent: true },
      data: { isCurrent: false },
    });
    return tx.academicYear.update({
      where: { id },
      data: { isCurrent: true },
    });
  });
}

export async function deleteAcademicYear(schoolId: string, id: string) {
  return prisma.academicYear.delete({
    where: { id },
  });
}

// ─── Terms ───────────────────────────────────────────────────────────────────

export async function createTerm(
  schoolId: string, 
  yearId: string, 
  data: CreateTermInput
): Promise<Term> {
  return prisma.term.create({
    data: {
      schoolId,
      academicYearId: yearId,
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });
}

export async function listTermsByAcademicYear(schoolId: string, yearId: string): Promise<Term[]> {
  return prisma.term.findMany({
    where: { schoolId, academicYearId: yearId },
    orderBy: { startDate: "asc" },
  });
}

// ─── Classroom ────────────────────────────────────────────────────────────────

export async function createClassroom(schoolId: string, data: CreateClassroomInput): Promise<Classroom> {
  return prisma.classroom.create({
    data: { 
      schoolId, 
      name: data.name, 
      capacity: data.capacity,
      academicYearId: data.academicYearId || null,
    },
  });
}

export async function listClassrooms(schoolId: string, academicYearId?: string) {
  return prisma.classroom.findMany({
    where: { 
      schoolId,
      ...(academicYearId ? { academicYearId } : {}),
    },
    include: {
      academicYear: {
        select: { id: true, name: true, isCurrent: true },
      },
      _count: {
        select: { students: true, assignments: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getClassroomById(schoolId: string, id: string) {
  return prisma.classroom.findFirst({
    where: { id, schoolId },
    include: {
      academicYear: true,
      students: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      assignments: {
        include: {
          teacher: { include: { user: { select: { id: true, email: true } } } },
          subject: true,
        },
      },
    },
  });
}

export async function updateClassroom(
  schoolId: string, 
  id: string, 
  data: UpdateClassroomInput
): Promise<Classroom> {
  return prisma.classroom.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
      ...(data.academicYearId !== undefined ? { academicYearId: data.academicYearId } : {}),
    },
  });
}

export async function deleteClassroom(schoolId: string, id: string): Promise<Classroom> {
  return prisma.classroom.delete({
    where: { id },
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

export async function getSubjectById(schoolId: string, id: string): Promise<Subject | null> {
  return prisma.subject.findFirst({
    where: { id, schoolId },
  });
}

export async function updateSubject(
  schoolId: string, 
  id: string, 
  data: UpdateSubjectInput
): Promise<Subject> {
  return prisma.subject.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.code !== undefined ? { code: data.code } : {}),
    },
  });
}

export async function deleteSubject(schoolId: string, id: string): Promise<Subject> {
  return prisma.subject.delete({
    where: { id },
  });
}

// ─── Teacher Assignments (Junction) ──────────────────────────────────────────

const assignmentInclude = {
  teacher: { include: { user: { select: { id: true, email: true } } } },
  subject: true,
  classroom: true,
};

export async function assignTeacher(
  schoolId: string, 
  data: { teacherId: string; subjectId: string; classroomId: string }
) {
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

export async function deleteAssignment(schoolId: string, classroomId: string, assignmentId: string) {
  return prisma.teacherSubjectClass.delete({
    where: { id: assignmentId, schoolId, classroomId },
  });
}

// ─── Timetable ────────────────────────────────────────────────────────────────

const timetableInclude = {
  classroom: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true, code: true } },
  teacher: { 
    include: { 
      user: { select: { id: true, email: true } } 
    } 
  },
};

export async function findOverlappingTimetablePeriods(
  schoolId: string,
  params: {
    classroomId: string;
    teacherId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }
) {
  // Overlap occurs when: existing.startTime < new.endTime AND existing.endTime > new.startTime
  return prisma.timetablePeriod.findMany({
    where: {
      schoolId,
      dayOfWeek: params.dayOfWeek,
      startTime: { lt: params.endTime },
      endTime: { gt: params.startTime },
      OR: [
        { classroomId: params.classroomId },
        { teacherId: params.teacherId },
      ],
    },
    include: timetableInclude,
  });
}

export async function createTimetablePeriod(
  schoolId: string, 
  data: CreateTimetablePeriodInput
): Promise<TimetablePeriod> {
  return prisma.timetablePeriod.create({
    data: {
      schoolId,
      classroomId: data.classroomId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
    },
    include: timetableInclude,
  });
}

export async function listTimetableByClassroom(schoolId: string, classroomId: string) {
  return prisma.timetablePeriod.findMany({
    where: { schoolId, classroomId },
    include: timetableInclude,
    orderBy: [
      { dayOfWeek: "asc" },
      { startTime: "asc" },
    ],
  });
}

export async function listTimetableByTeacher(schoolId: string, teacherId: string) {
  return prisma.timetablePeriod.findMany({
    where: { schoolId, teacherId },
    include: timetableInclude,
    orderBy: [
      { dayOfWeek: "asc" },
      { startTime: "asc" },
    ],
  });
}

export async function deleteTimetablePeriod(schoolId: string, id: string) {
  return prisma.timetablePeriod.delete({
    where: { id },
  });
}
