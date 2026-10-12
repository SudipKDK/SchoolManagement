import type { Request, Response } from "express";
import { Router } from "express";
import { catchAsync } from "../../../utils/catchAsync.utils.js";
import { requireAuth } from "../../../middleware/auth/requireAuth.js";
import { requireSchool } from "../../../middleware/auth/requireSchool.js";
import { authorize } from "../../../middleware/auth/authorize.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { addMemberSchema } from "../validators/member.validator.js";
import * as memberService from "../services/member.service.js";

// ─── Controller ───────────────────────────────────────────────────────────────

export const addMemberHandler = catchAsync(async (req: Request, res: Response) => {
  const member = await memberService.addMemberToSchool(
    req.schoolId!,
    req.body
  );

  res.status(201).json({ 
    message: "Member added successfully", 
    member 
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

const memberRouter = Router();

// Apply context to all member routes
memberRouter.use(requireAuth, requireSchool);

/**
 * POST /api/v1/members
 * 
 * Adds a user (by email) to the school with a specific role.
 * Requires the 'user.create' permission.
 */
memberRouter.post(
  "/",
  authorize("user.create"),
  validate(addMemberSchema),
  addMemberHandler
);

export { memberRouter };
