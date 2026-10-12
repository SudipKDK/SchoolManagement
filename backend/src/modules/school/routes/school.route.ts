import { Router } from "express";
import { requireAuth } from "../../../middleware/auth/requireAuth.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { createSchoolSchema } from "../validators/school.validator.js";
import * as schoolController from "../controllers/school.controller.js";

const schoolRouter = Router();

/**
 * POST /api/v1/schools
 * Pipeline: requireAuth -> validate -> controller
 *
 * No requireSchool here — the school is being created, it doesn't exist yet.
 * No authorize here — any authenticated user can create a school.
 */
schoolRouter.post(
  "/",
  requireAuth,
  validate(createSchoolSchema),
  schoolController.createSchoolHandler
);

/**
 * GET /api/v1/schools/my
 * Pipeline: requireAuth -> controller
 *
 * No validation needed — no request body or params to validate.
 * No requireSchool — this is a cross-tenant query by design.
 */
schoolRouter.get(
  "/my",
  requireAuth,
  schoolController.getMySchoolsHandler
);

export { schoolRouter };
