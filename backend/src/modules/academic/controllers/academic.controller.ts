import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync.utils.js';
import * as academicService from '../services/academic.service.js';

// ─── Academic Years ──────────────────────────────────────────────────────────

export const createAcademicYear = catchAsync(async (req: Request, res: Response) => {
  const academicYear = await academicService.createAcademicYear(req.schoolId!, req.body);
  res.status(201).json({ success: true, data: academicYear });
});

export const listAcademicYears = catchAsync(async (req: Request, res: Response) => {
  const academicYears = await academicService.listAcademicYears(req.schoolId!);
  res.status(200).json({ success: true, data: academicYears });
});

export const getAcademicYearById = catchAsync(async (req: Request, res: Response) => {
  const academicYear = await academicService.getAcademicYearById(
    req.schoolId!, 
    req.params.id as string
  );
  res.status(200).json({ success: true, data: academicYear });
});

export const updateAcademicYear = catchAsync(async (req: Request, res: Response) => {
  const academicYear = await academicService.updateAcademicYear(
    req.schoolId!, 
    req.params.id as string, 
    req.body
  );
  res.status(200).json({ success: true, data: academicYear });
});

export const setCurrentAcademicYear = catchAsync(async (req: Request, res: Response) => {
  const academicYear = await academicService.setCurrentAcademicYear(
    req.schoolId!, 
    req.params.id as string
  );
  res.status(200).json({ success: true, data: academicYear });
});

export const deleteAcademicYear = catchAsync(async (req: Request, res: Response) => {
  await academicService.deleteAcademicYear(req.schoolId!, req.params.id as string);
  res.status(204).send();
});

// ─── Terms ───────────────────────────────────────────────────────────────────

export const createTerm = catchAsync(async (req: Request, res: Response) => {
  const term = await academicService.createTerm(
    req.schoolId!, 
    req.params.yearId as string, 
    req.body
  );
  res.status(201).json({ success: true, data: term });
});

export const listTerms = catchAsync(async (req: Request, res: Response) => {
  const terms = await academicService.listTerms(
    req.schoolId!, 
    req.params.yearId as string
  );
  res.status(200).json({ success: true, data: terms });
});

// ─── Classrooms ───────────────────────────────────────────────────────────────

export const createClassroom = catchAsync(async (req: Request, res: Response) => {
  const classroom = await academicService.createClassroom(req.schoolId!, req.body);
  res.status(201).json({ success: true, data: classroom });
});

export const getClassrooms = catchAsync(async (req: Request, res: Response) => {
  const academicYearId = req.query.academicYearId as string | undefined;
  const classrooms = await academicService.listClassrooms(req.schoolId!, academicYearId);
  res.status(200).json({ success: true, data: classrooms });
});

export const getClassroomById = catchAsync(async (req: Request, res: Response) => {
  const classroom = await academicService.getClassroomById(
    req.schoolId!, 
    req.params.id as string
  );
  res.status(200).json({ success: true, data: classroom });
});

export const updateClassroom = catchAsync(async (req: Request, res: Response) => {
  const classroom = await academicService.updateClassroom(
    req.schoolId!, 
    req.params.id as string, 
    req.body
  );
  res.status(200).json({ success: true, data: classroom });
});

export const deleteClassroom = catchAsync(async (req: Request, res: Response) => {
  await academicService.deleteClassroom(req.schoolId!, req.params.id as string);
  res.status(204).send();
});

// ─── Subjects ─────────────────────────────────────────────────────────────────

export const createSubject = catchAsync(async (req: Request, res: Response) => {
  const subject = await academicService.createSubject(req.schoolId!, req.body);
  res.status(201).json({ success: true, data: subject });
});

export const getSubjects = catchAsync(async (req: Request, res: Response) => {
  const subjects = await academicService.listSubjects(req.schoolId!);
  res.status(200).json({ success: true, data: subjects });
});

export const getSubjectById = catchAsync(async (req: Request, res: Response) => {
  const subject = await academicService.getSubjectById(
    req.schoolId!, 
    req.params.id as string
  );
  res.status(200).json({ success: true, data: subject });
});

export const updateSubject = catchAsync(async (req: Request, res: Response) => {
  const subject = await academicService.updateSubject(
    req.schoolId!, 
    req.params.id as string, 
    req.body
  );
  res.status(200).json({ success: true, data: subject });
});

export const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  await academicService.deleteSubject(req.schoolId!, req.params.id as string);
  res.status(204).send();
});

// ─── Teacher Assignments ─────────────────────────────────────────────────────

export const assignTeacher = catchAsync(async (req: Request, res: Response) => {
  const assignment = await academicService.assignTeacher(req.schoolId!, {
    teacherId: req.body.teacherId,
    subjectId: req.body.subjectId,
    classroomId: req.params.classroomId as string,
  });
  res.status(201).json({ success: true, data: assignment });
});

export const getClassroomAssignments = catchAsync(async (req: Request, res: Response) => {
  const assignments = await academicService.getClassroomAssignments(
    req.schoolId!, 
    req.params.classroomId as string
  );
  res.status(200).json({ success: true, data: assignments });
});

export const deleteAssignment = catchAsync(async (req: Request, res: Response) => {
  await academicService.deleteTeacherAssignment(
    req.schoolId!, 
    req.params.classroomId as string, 
    req.params.assignmentId as string
  );
  res.status(204).send();
});

// ─── Timetable & Scheduling ───────────────────────────────────────────────────

export const createTimetablePeriod = catchAsync(async (req: Request, res: Response) => {
  const period = await academicService.createTimetablePeriod(req.schoolId!, req.body);
  res.status(201).json({ success: true, data: period });
});

export const getClassroomTimetable = catchAsync(async (req: Request, res: Response) => {
  const timetable = await academicService.listTimetableByClassroom(
    req.schoolId!, 
    req.params.classroomId as string
  );
  res.status(200).json({ success: true, data: timetable });
});

export const getTeacherTimetable = catchAsync(async (req: Request, res: Response) => {
  const timetable = await academicService.listTimetableByTeacher(
    req.schoolId!, 
    req.params.teacherId as string
  );
  res.status(200).json({ success: true, data: timetable });
});

export const deleteTimetablePeriod = catchAsync(async (req: Request, res: Response) => {
  await academicService.deleteTimetablePeriod(req.schoolId!, req.params.id as string);
  res.status(204).send();
});
