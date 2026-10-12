import { AppError } from "../../../utils/AppError.js";
import { prisma } from "../../../lib/prisma.js";
import * as teacherRepo from "../repositories/teacher.repository.js";
import type { CreateTeacherInput } from "../validators/teacher.validator.js";

const PRISMA_UNIQUE_CONSTRAINT = "P2002";

export async function createTeacherProfile(schoolId: string, data: CreateTeacherInput) {
  const isMember = await prisma.userRole.findFirst({
    where: { userId: data.userId, schoolId },
  });

  if (!isMember) {
    throw new AppError("BAD_REQUEST", "This user is not a member of the school. Please add them first.", 400);
  }

  try {
    return await teacherRepo.createTeacherProfile(schoolId, data);
  } catch (error: any) {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
      if (error.meta?.target?.includes("userId")) {
        throw new AppError("CONFLICT", "This user already has a teacher profile at this school.", 409);
      }
      if (error.meta?.target?.includes("employeeId")) {
        throw new AppError("CONFLICT", `The employee ID '${data.employeeId}' is already in use.`, 409);
      }
      throw new AppError("CONFLICT", "A unique constraint violation occurred.", 409);
    }
    throw error;
  }
}

export async function getTeacherById(schoolId: string, teacherId: string) {
  const teacher = await teacherRepo.getTeacherById(schoolId, teacherId);
  if (!teacher) throw new AppError("NOT_FOUND", "Teacher profile not found.", 404);
  return teacher;
}
