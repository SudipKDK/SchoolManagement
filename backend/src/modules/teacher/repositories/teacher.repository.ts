import { prisma } from "../../../lib/prisma.js";
import type { CreateTeacherInput } from "../validators/teacher.validator.js";

const teacherInclude = {
  user: {
    select: {
      id: true,
      email: true,
    },
  },
};

export async function createTeacherProfile(schoolId: string, data: CreateTeacherInput) {
  return prisma.teacher.create({
    data: {
      schoolId,
      userId: data.userId,
      employeeId: data.employeeId,
      designation: data.designation,
      joinedAt: data.joinedAt ? new Date(data.joinedAt) : undefined,
    },
    include: teacherInclude,
  });
}

export async function getTeachers(schoolId: string) {
  return prisma.teacher.findMany({
    where: { schoolId },
    include: teacherInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTeacherById(schoolId: string, teacherId: string) {
  return prisma.teacher.findFirst({
    where: { id: teacherId, schoolId },
    include: teacherInclude,
  });
}
