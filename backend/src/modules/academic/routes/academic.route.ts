import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth/requireAuth.js';
import { requireSchool } from '../../../middleware/auth/requireSchool.js';
import { authorize } from '../../../middleware/auth/authorize.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { 
  createAcademicYearSchema,
  updateAcademicYearSchema,
  academicYearIdParamSchema,
  createTermSchema,
  createClassroomSchema, 
  updateClassroomSchema,
  classroomIdParamSchema,
  createSubjectSchema,
  updateSubjectSchema,
  subjectIdParamSchema,
  assignTeacherSchema,
  assignmentIdParamSchema,
  createTimetablePeriodSchema,
  timetableIdParamSchema,
} from '../validators/academic.validator.js';
import * as academicController from '../controllers/academic.controller.js';

const academicRouter = Router();

// All academic routes require authentication and a tenant school context
academicRouter.use(requireAuth, requireSchool);

// ─── Academic Years ──────────────────────────────────────────────────────────

academicRouter.post(
  '/years',
  authorize('academicYear.create'),
  validate(createAcademicYearSchema),
  academicController.createAcademicYear
);

academicRouter.get(
  '/years',
  authorize('academicYear.list'),
  academicController.listAcademicYears
);

academicRouter.get(
  '/years/:id',
  authorize('academicYear.read'),
  validate(academicYearIdParamSchema),
  academicController.getAcademicYearById
);

academicRouter.patch(
  '/years/:id',
  authorize('academicYear.update'),
  validate(updateAcademicYearSchema),
  academicController.updateAcademicYear
);

academicRouter.patch(
  '/years/:id/set-current',
  authorize('academicYear.update'),
  validate(academicYearIdParamSchema),
  academicController.setCurrentAcademicYear
);

academicRouter.delete(
  '/years/:id',
  authorize('academicYear.delete'),
  validate(academicYearIdParamSchema),
  academicController.deleteAcademicYear
);

// ─── Terms ───────────────────────────────────────────────────────────────────

academicRouter.post(
  '/years/:yearId/terms',
  authorize('academicYear.update'),
  validate(createTermSchema),
  academicController.createTerm
);

academicRouter.get(
  '/years/:yearId/terms',
  authorize('academicYear.read'),
  academicController.listTerms
);

// ─── Classrooms ───────────────────────────────────────────────────────────────

academicRouter.post(
  '/classrooms',
  authorize('classroom.create'),
  validate(createClassroomSchema),
  academicController.createClassroom
);

academicRouter.get(
  '/classrooms',
  authorize('classroom.list'),
  academicController.getClassrooms
);

academicRouter.get(
  '/classrooms/:id',
  authorize('classroom.read'),
  validate(classroomIdParamSchema),
  academicController.getClassroomById
);

academicRouter.patch(
  '/classrooms/:id',
  authorize('classroom.update'),
  validate(updateClassroomSchema),
  academicController.updateClassroom
);

academicRouter.delete(
  '/classrooms/:id',
  authorize('classroom.delete'),
  validate(classroomIdParamSchema),
  academicController.deleteClassroom
);

// ─── Teacher Assignments to Classroom ────────────────────────────────────────

academicRouter.post(
  '/classrooms/:classroomId/assignments',
  authorize('classroom.update'),
  validate(assignTeacherSchema),
  academicController.assignTeacher
);

academicRouter.get(
  '/classrooms/:classroomId/assignments',
  authorize('classroom.read'),
  academicController.getClassroomAssignments
);

academicRouter.delete(
  '/classrooms/:classroomId/assignments/:assignmentId',
  authorize('classroom.update'),
  validate(assignmentIdParamSchema),
  academicController.deleteAssignment
);

// ─── Subjects ─────────────────────────────────────────────────────────────────

academicRouter.post(
  '/subjects',
  authorize('subject.create'),
  validate(createSubjectSchema),
  academicController.createSubject
);

academicRouter.get(
  '/subjects',
  authorize('subject.list'),
  academicController.getSubjects
);

academicRouter.get(
  '/subjects/:id',
  authorize('subject.read'),
  validate(subjectIdParamSchema),
  academicController.getSubjectById
);

academicRouter.patch(
  '/subjects/:id',
  authorize('subject.update'),
  validate(updateSubjectSchema),
  academicController.updateSubject
);

academicRouter.delete(
  '/subjects/:id',
  authorize('subject.delete'),
  validate(subjectIdParamSchema),
  academicController.deleteSubject
);

// ─── Timetable & Scheduling ───────────────────────────────────────────────────

academicRouter.post(
  '/timetable',
  authorize('timetable.create'),
  validate(createTimetablePeriodSchema),
  academicController.createTimetablePeriod
);

academicRouter.get(
  '/timetable/classroom/:classroomId',
  authorize('timetable.read'),
  academicController.getClassroomTimetable
);

academicRouter.get(
  '/timetable/teacher/:teacherId',
  authorize('timetable.read'),
  academicController.getTeacherTimetable
);

academicRouter.delete(
  '/timetable/:id',
  authorize('timetable.delete'),
  validate(timetableIdParamSchema),
  academicController.deleteTimetablePeriod
);

export default academicRouter;
