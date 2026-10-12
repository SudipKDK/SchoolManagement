import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync.utils.js';
import * as teacherService from '../services/teacher.service.js';
import * as teacherRepo from '../repositories/teacher.repository.js';

export const createTeacher = catchAsync(async (req: Request, res: Response) => {
  const teacher = await teacherService.createTeacherProfile(req.schoolId!, req.body);
  res.status(201).json({ success: true, data: teacher });
});

export const getTeachers = catchAsync(async (req: Request, res: Response) => {
  const teachers = await teacherRepo.getTeachers(req.schoolId!);
  res.status(200).json({ success: true, data: teachers });
});

export const getTeacherById = catchAsync(async (req: Request, res: Response) => {
  const teacher = await teacherService.getTeacherById(req.schoolId!, req.params.id as string);
  res.status(200).json({ success: true, data: teacher });
});
