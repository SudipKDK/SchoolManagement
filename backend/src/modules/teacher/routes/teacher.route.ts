import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth/requireAuth.js';
import { requireSchool } from '../../../middleware/auth/requireSchool.js';
import { authorize } from '../../../middleware/auth/authorize.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { createTeacherSchema } from '../validators/teacher.validator.js';
import * as teacherController from '../controllers/teacher.controller.js';

const teacherRouter = Router();

// Apply auth and tenant context
teacherRouter.use(requireAuth, requireSchool);

// Create a teacher profile
teacherRouter.post(
  '/',
  authorize('teacher.create'),
  validate(createTeacherSchema),
  teacherController.createTeacher
);

// List all teachers
teacherRouter.get(
  '/',
  authorize('teacher.list'),
  teacherController.getTeachers
);

// Get specific teacher
teacherRouter.get(
  '/:id',
  authorize('teacher.read'),
  teacherController.getTeacherById
);

export default teacherRouter;
