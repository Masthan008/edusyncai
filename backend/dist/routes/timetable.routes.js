import { Router } from 'express';
import { createTimetableSlot, getClassTimetable, getTeacherTimetable } from '../controllers/timetable.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
export const timetableRouter = Router();
timetableRouter.post('/', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD'), createTimetableSlot);
timetableRouter.get('/class/:classId/:sectionId', authenticateToken, getClassTimetable);
timetableRouter.get('/teacher/:teacherId', authenticateToken, getTeacherTimetable);
