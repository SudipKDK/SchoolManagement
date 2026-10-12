/**
 * School Service
 *
 * WHY THIS FILE EXISTS:
 * The service orchestrates business logic for the School domain.
 * It calls the repository, applies business rules, and returns clean
 * data structures to the controller.
 *
 * KEY DESIGN DECISION:
 * When a user creates a school, we automatically make them the SCHOOL_ADMIN.
 * This is a business rule, not a database concern — so it lives here in
 * the service, and is executed atomically via the repository's transaction.
 */

import { AppError } from "../../../utils/AppError.js";
import * as schoolRepo from "../repositories/school.repository.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SchoolResponse = {
  id: string;
  name: string;
  createdAt: Date;
};

// ─── Create School ────────────────────────────────────────────────────────────

/**
 * Creates a new school and assigns the creator as SCHOOL_ADMIN.
 * 
 * Business Rules:
 * 1. Any authenticated user can create a school (they become its admin).
 * 2. The creator is automatically assigned the SCHOOL_ADMIN role.
 * 3. All of this happens atomically — no orphan schools.
 */
export async function createSchool(
  name: string,
  creatorUserId: string
): Promise<SchoolResponse> {
  const { school } = await schoolRepo.createSchoolWithAdmin({
    name,
    creatorUserId,
  });

  return {
    id: school.id,
    name: school.name,
    createdAt: school.createdAt,
  };
}

// ─── Get School by ID ─────────────────────────────────────────────────────────

export async function getSchoolById(schoolId: string): Promise<SchoolResponse> {
  const school = await schoolRepo.findSchoolById(schoolId);
  if (!school) {
    throw new AppError("NOT_FOUND", "School not found", 404);
  }

  return {
    id: school.id,
    name: school.name,
    createdAt: school.createdAt,
  };
}

// ─── List My Schools ──────────────────────────────────────────────────────────

/**
 * Returns all schools the user has been assigned a role in.
 * This powers the "Switch School" dropdown on the frontend.
 */
export async function getMySchools(
  userId: string
): Promise<SchoolResponse[]> {
  const schools = await schoolRepo.findSchoolsByUserId(userId);

  return schools.map((s) => ({
    id: s.id,
    name: s.name,
    createdAt: s.createdAt,
  }));
}
