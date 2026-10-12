import { Router } from 'express';
import { authRouter } from '../modules/auth/routes/auth.route.js';
import { schoolRouter } from '../modules/school/routes/school.route.js';
import { studentRouter } from '../modules/student/routes/student.route.js';
import { memberRouter } from '../modules/member/routes/member.route.js';
import academicRouter from '../modules/academic/routes/academic.route.js';
import teacherRouter from '../modules/teacher/routes/teacher.route.js';

const apiRouter = Router();

// Mount the Auth module routes under /auth
apiRouter.use('/auth', authRouter);

// Mount the School module routes under /schools
apiRouter.use('/schools', schoolRouter);

// Mount the Student module routes under /students
apiRouter.use('/students', studentRouter);

// Mount the Member module routes under /members
apiRouter.use('/members', memberRouter);

// Mount the Academic module routes under /academic
apiRouter.use('/academic', academicRouter);

// Mount the Teacher module routes under /teachers
apiRouter.use('/teachers', teacherRouter);

export default apiRouter;

