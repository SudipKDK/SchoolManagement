import { AppError } from "../../../utils/AppError.js";
import * as academicRepo from "../repositories/academic.repository.js";
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

const PRISMA_UNIQUE_CONSTRAINT = "P2002";
const PRISMA_NOT_FOUND = "P2025";

// ─── Academic Years ──────────────────────────────────────────────────────────

export async function createAcademicYear(schoolId: string, data: CreateAcademicYearInput) {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (start >= end) {
    throw new AppError("BAD_REQUEST", "Start date must be before end date.", 400);
  }

  try {
    return await academicRepo.createAcademicYear(schoolId, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      throw new AppError("CONFLICT", `An academic year named '${data.name}' already exists.`, 409);
    }
    throw error;
  }
}

export async function listAcademicYears(schoolId: string) {
  return academicRepo.listAcademicYears(schoolId);
}

export async function getAcademicYearById(schoolId: string, id: string) {
  const year = await academicRepo.getAcademicYearById(schoolId, id);
  if (!year) {
    throw new AppError("NOT_FOUND", "Academic year not found.", 404);
  }
  return year;
}

export async function updateAcademicYear(schoolId: string, id: string, data: UpdateAcademicYearInput) {
  await getAcademicYearById(schoolId, id);

  if (data.startDate && data.endDate) {
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new AppError("BAD_REQUEST", "Start date must be before end date.", 400);
    }
  }

  try {
    return await academicRepo.updateAcademicYear(schoolId, id, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      throw new AppError("CONFLICT", `An academic year named '${data.name}' already exists.`, 409);
    }
    throw error;
  }
}

export async function setCurrentAcademicYear(schoolId: string, id: string) {
  await getAcademicYearById(schoolId, id);
  return academicRepo.setCurrentAcademicYear(schoolId, id);
}

export async function deleteAcademicYear(schoolId: string, id: string) {
  await getAcademicYearById(schoolId, id);
  try {
    return await academicRepo.deleteAcademicYear(schoolId, id);
  } catch (error: any) {
    if (error.code === PRISMA_NOT_FOUND) {
      throw new AppError("NOT_FOUND", "Academic year not found.", 404);
    }
    throw error;
  }
}

// ─── Terms ───────────────────────────────────────────────────────────────────

export async function createTerm(schoolId: string, yearId: string, data: CreateTermInput) {
  const year = await getAcademicYearById(schoolId, yearId);
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (start >= end) {
    throw new AppError("BAD_REQUEST", "Term start date must be before end date.", 400);
  }

  if (start < year.startDate || end > year.endDate) {
    throw new AppError(
      "BAD_REQUEST", 
      "Term dates must fall within the academic year timeframe.", 
      400
    );
  }

  try {
    return await academicRepo.createTerm(schoolId, yearId, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      throw new AppError("CONFLICT", `A term named '${data.name}' already exists in this academic year.`, 409);
    }
    throw error;
  }
}

export async function listTerms(schoolId: string, yearId: string) {
  await getAcademicYearById(schoolId, yearId);
  return academicRepo.listTermsByAcademicYear(schoolId, yearId);
}

// ─── Classrooms ───────────────────────────────────────────────────────────────

export async function createClassroom(schoolId: string, data: CreateClassroomInput) {
  if (data.academicYearId) {
    await getAcademicYearById(schoolId, data.academicYearId);
  }

  try {
    return await academicRepo.createClassroom(schoolId, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      throw new AppError("CONFLICT", `A classroom named '${data.name}' already exists in this school.`, 409);
    }
    throw error;
  }
}

export async function listClassrooms(schoolId: string, academicYearId?: string) {
  return academicRepo.listClassrooms(schoolId, academicYearId);
}

export async function getClassroomById(schoolId: string, id: string) {
  const classroom = await academicRepo.getClassroomById(schoolId, id);
  if (!classroom) {
    throw new AppError("NOT_FOUND", "Classroom not found.", 404);
  }
  return classroom;
}

export async function updateClassroom(schoolId: string, id: string, data: UpdateClassroomInput) {
  await getClassroomById(schoolId, id);

  if (data.academicYearId) {
    await getAcademicYearById(schoolId, data.academicYearId);
  }

  try {
    return await academicRepo.updateClassroom(schoolId, id, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      throw new AppError("CONFLICT", `A classroom named '${data.name}' already exists in this school.`, 409);
    }
    throw error;
  }
}

export async function deleteClassroom(schoolId: string, id: string) {
  await getClassroomById(schoolId, id);
  return academicRepo.deleteClassroom(schoolId, id);
}

// ─── Subjects ─────────────────────────────────────────────────────────────────

export async function createSubject(schoolId: string, data: CreateSubjectInput) {
  try {
    return await academicRepo.createSubject(schoolId, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      throw new AppError("CONFLICT", `The subject '${data.name}' or code '${data.code}' already exists.`, 409);
    }
    throw error;
  }
}

export async function listSubjects(schoolId: string) {
  return academicRepo.listSubjects(schoolId);
}

export async function getSubjectById(schoolId: string, id: string) {
  const subject = await academicRepo.getSubjectById(schoolId, id);
  if (!subject) {
    throw new AppError("NOT_FOUND", "Subject not found.", 404);
  }
  return subject;
}

export async function updateSubject(schoolId: string, id: string, data: UpdateSubjectInput) {
  await getSubjectById(schoolId, id);

  try {
    return await academicRepo.updateSubject(schoolId, id, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      throw new AppError("CONFLICT", `The subject '${data.name}' or code '${data.code}' already exists.`, 409);
    }
    throw error;
  }
}

export async function deleteSubject(schoolId: string, id: string) {
  await getSubjectById(schoolId, id);
  return academicRepo.deleteSubject(schoolId, id);
}

// ─── Teacher Assignments ─────────────────────────────────────────────────────

export async function assignTeacher(
  schoolId: string, 
  data: { teacherId: string; subjectId: string; classroomId: string }
) {
  try {
    return await academicRepo.assignTeacher(schoolId, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      throw new AppError("CONFLICT", "This teacher is already assigned to this subject in this classroom.", 409);
    }
    throw error;
  }
}

export async function getClassroomAssignments(schoolId: string, classroomId: string) {
  await getClassroomById(schoolId, classroomId);
  return academicRepo.getAssignmentsByClassroom(schoolId, classroomId);
}

export async function deleteTeacherAssignment(schoolId: string, classroomId: string, assignmentId: string) {
  try {
    return await academicRepo.deleteAssignment(schoolId, classroomId, assignmentId);
  } catch (error: any) {
    if (error.code === PRISMA_NOT_FOUND) {
      throw new AppError("NOT_FOUND", "Assignment not found.", 404);
    }
    throw error;
  }
}

// ─── Timetable & Scheduling ───────────────────────────────────────────────────

export async function createTimetablePeriod(schoolId: string, data: CreateTimetablePeriodInput) {
  if (data.startTime >= data.endTime) {
    throw new AppError("BAD_REQUEST", "Start time must be strictly before end time.", 400);
  }

  // Verify referenced entities exist
  await getClassroomById(schoolId, data.classroomId);
  await getSubjectById(schoolId, data.subjectId);

  // Check for timetable conflict (overlapping periods)
  const conflicts = await academicRepo.findOverlappingTimetablePeriods(schoolId, {
    classroomId: data.classroomId,
    teacherId: data.teacherId,
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
  });

  if (conflicts.length > 0) {
    const conflict = conflicts[0]!;
    if (conflict.classroomId === data.classroomId) {
      throw new AppError(
        "CONFLICT",
        `Classroom schedule conflict: period already occupied by '${conflict.subject.name}' (${conflict.startTime}-${conflict.endTime}) on ${data.dayOfWeek}.`,
        409
      );
    }
    if (conflict.teacherId === data.teacherId) {
      throw new AppError(
        "CONFLICT",
        `Teacher schedule conflict: teacher is already teaching in '${conflict.classroom.name}' (${conflict.startTime}-${conflict.endTime}) on ${data.dayOfWeek}.`,
        409
      );
    }
  }

  try {
    return await academicRepo.createTimetablePeriod(schoolId, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      throw new AppError("CONFLICT", "A timetable entry already exists at this exact slot.", 409);
    }
    throw error;
  }
}

export async function listTimetableByClassroom(schoolId: string, classroomId: string) {
  await getClassroomById(schoolId, classroomId);
  return academicRepo.listTimetableByClassroom(schoolId, classroomId);
}

export async function listTimetableByTeacher(schoolId: string, teacherId: string) {
  return academicRepo.listTimetableByTeacher(schoolId, teacherId);
}

export async function deleteTimetablePeriod(schoolId: string, id: string) {
  try {
    return await academicRepo.deleteTimetablePeriod(schoolId, id);
  } catch (error: any) {
    if (error.code === PRISMA_NOT_FOUND) {
      throw new AppError("NOT_FOUND", "Timetable period not found.", 404);
    }
    throw error;
  }
}
