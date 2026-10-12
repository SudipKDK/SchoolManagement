import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth/requireAuth.js';
import { requireSchool } from '../../../middleware/auth/requireSchool.js';
import { authorize } from '../../../middleware/auth/authorize.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { 
  createClassroomSchema, 
  createSubjectSchema,
  assignTeacherSchema
} from '../validators/academic.validator.js';
import * as academicController from '../controllers/academic.controller.js';

const academicRouter = Router();

// All academic routes require authentication and a school context
academicRouter.use(requireAuth, requireSchool);

// Classrooms
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

// Teacher Assignments to Classroom
academicRouter.post(
  '/classrooms/:classroomId/assignments',
  authorize('classroom.update'), // You need permission to update a classroom's assignments
  validate(assignTeacherSchema),
  academicController.assignTeacher
);

academicRouter.get(
  '/classrooms/:classroomId/assignments',
  authorize('classroom.read'),
  academicController.getClassroomAssignments
);

// Subjects
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

export default academicRouter;
