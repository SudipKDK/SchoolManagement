import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync.utils.js';
import * as academicService from '../services/academic.service.js';
import * as academicRepo from '../repositories/academic.repository.js';

export const createClassroom = catchAsync(async (req: Request, res: Response) => {
  const classroom = await academicService.createClassroom(req.schoolId!, req.body);
  res.status(201).json({ success: true, data: classroom });
});

export const getClassrooms = catchAsync(async (req: Request, res: Response) => {
  const classrooms = await academicRepo.listClassrooms(req.schoolId!);
  res.status(200).json({ success: true, data: classrooms });
});

export const createSubject = catchAsync(async (req: Request, res: Response) => {
  const subject = await academicService.createSubject(req.schoolId!, req.body);
  res.status(201).json({ success: true, data: subject });
});

export const getSubjects = catchAsync(async (req: Request, res: Response) => {
  const subjects = await academicRepo.listSubjects(req.schoolId!);
  res.status(200).json({ success: true, data: subjects });
});

export const assignTeacher = catchAsync(async (req: Request, res: Response) => {
  const assignment = await academicService.assignTeacher(req.schoolId!, {
    teacherId: req.body.teacherId,
    subjectId: req.body.subjectId,
    classroomId: req.params.classroomId as string,
  });
  res.status(201).json({ success: true, data: assignment });
});

export const getClassroomAssignments = catchAsync(async (req: Request, res: Response) => {
  const assignments = await academicRepo.getAssignmentsByClassroom(
    req.schoolId!, 
    req.params.classroomId as string
  );
  res.status(200).json({ success: true, data: assignments });
});
