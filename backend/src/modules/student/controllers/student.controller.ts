/**
 * Student Controller
 *
 * NOTICE HOW THIN EVERY HANDLER IS:
 * Each one does exactly 3 things:
 *   1. Extract validated data from the request (body, params, schoolId)
 *   2. Call the service
 *   3. Send the response
 *
 * No if-statements, no try-catch (catchAsync handles that),
 * no database queries, no business rules.
 */

import type { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.utils.js";
import * as studentService from "../services/student.service.js";

// ─── Create ───────────────────────────────────────────────────────────────────

export const createStudentHandler = catchAsync(
  async (req: Request, res: Response) => {
    const student = await studentService.createStudent(
      req.schoolId!, // guaranteed by requireSchool middleware
      req.body
    );

    res.status(201).json({ student });
  }
);

// ─── Get One ──────────────────────────────────────────────────────────────────

export const getStudentHandler = catchAsync(
  async (req: Request, res: Response) => {
    const student = await studentService.getStudentById(
      req.schoolId!,
      req.params.id as string // validated by Zod studentIdParamSchema
    );

    res.status(200).json({ student });
  }
);

// ─── List ─────────────────────────────────────────────────────────────────────

export const listStudentsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const students = await studentService.listStudents(req.schoolId!);

    res.status(200).json({ students });
  }
);

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateStudentHandler = catchAsync(
  async (req: Request, res: Response) => {
    const student = await studentService.updateStudent(
      req.schoolId!,
      req.params.id as string, // validated by Zod updateStudentSchema
      req.body
    );

    res.status(200).json({ student });
  }
);

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Returns 204 No Content — the standard HTTP response for successful deletes.
 * No JSON body needed; the absence of an error IS the success signal.
 */
export const deleteStudentHandler = catchAsync(
  async (req: Request, res: Response) => {
    await studentService.deleteStudent(req.schoolId!, req.params.id as string);

    res.status(204).send();
  }
);
