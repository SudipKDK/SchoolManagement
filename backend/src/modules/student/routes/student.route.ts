import { Router } from "express";
import { requireAuth } from "../../../middleware/auth/requireAuth.js";
import { requireSchool } from "../../../middleware/auth/requireSchool.js";
import { authorize } from "../../../middleware/auth/authorize.js";
import { validate } from "../../../middleware/validate.middleware.js";
import {
  createStudentSchema,
  updateStudentSchema,
  studentIdParamSchema,
} from "../validators/student.validator.js";
import * as studentController from "../controllers/student.controller.js";

const studentRouter = Router();

/**
 * ── THE FULL PIPELINE ──────────────────────────────────────────────────────
 *
 * This is the first module to use ALL middleware layers:
 *
 *   requireAuth       → Verifies JWT, attaches req.user
 *   requireSchool     → Reads x-school-id header, attaches req.schoolId
 *   authorize("...") → Checks user has this permission AT this school
 *   validate(schema)  → Validates request body/params with Zod
 *   controller        → Thin handler that calls service
 *
 * Every future module (teachers, fees, attendance) will follow
 * this exact same pattern.
 * ────────────────────────────────────────────────────────────────────────────
 */

// All student routes require auth + school context
studentRouter.use(requireAuth, requireSchool);

/**
 * POST /api/v1/students
 */
studentRouter.post(
  "/",
  authorize("student.create"),
  validate(createStudentSchema),
  studentController.createStudentHandler
);

/**
 * GET /api/v1/students
 */
studentRouter.get(
  "/",
  authorize("student.list"),
  studentController.listStudentsHandler
);

/**
 * GET /api/v1/students/:id
 */
studentRouter.get(
  "/:id",
  authorize("student.read"),
  validate(studentIdParamSchema),
  studentController.getStudentHandler
);

/**
 * PATCH /api/v1/students/:id
 */
studentRouter.patch(
  "/:id",
  authorize("student.update"),
  validate(updateStudentSchema),
  studentController.updateStudentHandler
);

/**
 * DELETE /api/v1/students/:id
 */
studentRouter.delete(
  "/:id",
  authorize("student.delete"),
  validate(studentIdParamSchema),
  studentController.deleteStudentHandler
);

export { studentRouter };
