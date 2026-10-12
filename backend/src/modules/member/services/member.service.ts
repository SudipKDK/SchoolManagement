/**
 * Member Service
 * 
 * Handles the business logic of adding users to a school (tenant).
 */
import { AppError } from "../../../utils/AppError.js";
import { prisma } from "../../../lib/prisma.js";
import type { AddMemberInput } from "../validators/member.validator.js";

// We use Prisma directly here because these are cross-domain queries 
// (User + Role + UserRole) specific to onboarding. 

export async function addMemberToSchool(
  schoolId: string,
  data: AddMemberInput
) {
  // 1. Check if the user exists in the system
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    // In a real app, this is where you'd trigger an email invite system.
    // For now, we require them to register first.
    throw new AppError(
      "NOT_FOUND",
      `No user found with email ${data.email}. They must register an account first.`,
      404
    );
  }

  // 2. Find the role in this specific school
  const role = await prisma.role.findUnique({
    where: {
      schoolId_name: {
        schoolId,
        name: data.roleName,
      },
    },
  });

  if (!role) {
    throw new AppError(
      "NOT_FOUND",
      `The role '${data.roleName}' does not exist in this school.`,
      404
    );
  }

  // 3. Assign the user to the role in this school (Upsert prevents duplicates)
  const userRole = await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: role.id,
      },
    },
    update: {}, // if it exists, do nothing
    create: {
      userId: user.id,
      roleId: role.id,
      schoolId: schoolId,
    },
    include: {
      user: { select: { id: true, email: true } },
      role: { select: { name: true } },
    },
  });

  return {
    userId: userRole.user.id,
    email: userRole.user.email,
    role: userRole.role.name,
    assignedAt: new Date(), // UserRole doesn't have createdAt, so we return current time
  };
}
