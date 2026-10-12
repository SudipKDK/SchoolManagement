import { AppError } from "../../../utils/AppError.js";
import * as academicRepo from "../repositories/academic.repository.js";
import type { CreateClassroomInput, CreateSubjectInput } from "../validators/academic.validator.js";

const PRISMA_UNIQUE_CONSTRAINT = "P2002";

export async function createClassroom(schoolId: string, data: CreateClassroomInput) {
  try {
    return await academicRepo.createClassroom(schoolId, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      throw new AppError("CONFLICT", `A classroom named '${data.name}' already exists in this school.`, 409);
    }
    throw error;
  }
}

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

export async function assignTeacher(schoolId: string, data: { teacherId: string, subjectId: string, classroomId: string }) {
  try {
    return await academicRepo.assignTeacher(schoolId, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      throw new AppError("CONFLICT", "This teacher is already assigned to this subject in this classroom.", 409);
    }
    throw error;
  }
}
