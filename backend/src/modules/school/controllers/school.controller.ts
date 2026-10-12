import type { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.utils.js";
import * as schoolService from "../services/school.service.js";

/**
 * POST /api/v1/schools
 *
 * Creates a new school. The authenticated user (req.user.id)
 * automatically becomes the SCHOOL_ADMIN.
 *
 * Notice: This route only requires `requireAuth`, NOT `requireSchool`.
 * Why? Because the school doesn't exist yet — there's no tenant context
 * to attach. The school IS the thing being created.
 */
export const createSchoolHandler = catchAsync(
  async (req: Request, res: Response) => {
    const school = await schoolService.createSchool(
      req.body.name,
      req.user!.id // guaranteed by requireAuth middleware
    );

    res.status(201).json({ school });
  }
);

/**
 * GET /api/v1/schools/my
 *
 * Lists all schools the authenticated user belongs to.
 * Powers the "Switch School" dropdown on the frontend.
 *
 * Also only requires `requireAuth` — the user is asking
 * "which schools am I part of?" which is a cross-tenant query by design.
 */
export const getMySchoolsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const schools = await schoolService.getMySchools(req.user!.id);

    res.status(200).json({ schools });
  }
);
