import { Router } from 'express';
import { createTimetableSlot, getClassTimetable, getTeacherTimetable, updateTimetableSlot } from '../controllers/timetable.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

export const timetableRouter = Router();

timetableRouter.post('/', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD'), createTimetableSlot);
timetableRouter.put('/:id', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD'), updateTimetableSlot);
timetableRouter.get('/class/:classId/:sectionId', authenticateToken, getClassTimetable);
timetableRouter.get('/teacher/:teacherId', authenticateToken, getTeacherTimetable);
