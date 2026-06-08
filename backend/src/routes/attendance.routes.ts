import { Router } from 'express';
import { submitAttendance, getAttendanceHistory, getStudentAttendanceSummary } from '../controllers/attendance.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { attendanceSubmitSchema } from '../validators/schemas.js';

export const attendanceRouter = Router();

attendanceRouter.post('/', authenticateToken, authorizeRoles('Admin', 'Principal', 'Teacher'), validate(attendanceSubmitSchema), submitAttendance);
attendanceRouter.get('/history', authenticateToken, getAttendanceHistory);
attendanceRouter.get('/student/:studentId', authenticateToken, getStudentAttendanceSummary);
