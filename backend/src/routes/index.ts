import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { studentRouter } from './student.routes.js';
import { teacherRouter } from './teacher.routes.js';
import { departmentRouter } from './department.routes.js';
import { attendanceRouter } from './attendance.routes.js';
import { examRouter } from './exam.routes.js';
import { assignmentRouter } from './assignment.routes.js';
import { paymentRouter } from './payment.routes.js';
import { timetableRouter } from './timetable.routes.js';
import { analyticsRouter } from './analytics.routes.js';
import { aiRouter } from './ai.routes.js';
import { schoolRouter } from './school.routes.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/students', studentRouter);
router.use('/teachers', teacherRouter);
router.use('/departments', departmentRouter);
router.use('/attendance', attendanceRouter);
router.use('/exams', examRouter);
router.use('/assignments', assignmentRouter);
router.use('/payments', paymentRouter);
router.use('/timetables', timetableRouter);
router.use('/analytics', analyticsRouter);
router.use('/ai', aiRouter);
router.use('/school', schoolRouter);
