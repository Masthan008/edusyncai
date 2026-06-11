import { Router } from 'express';
import { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } from '../controllers/teacher.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { teacherCreateSchema, teacherUpdateSchema } from '../validators/schemas.js';

export const teacherRouter = Router();

teacherRouter.get('/', authenticateToken, getTeachers);
teacherRouter.get('/:id', authenticateToken, getTeacherById);
teacherRouter.post('/', authenticateToken, authorizeRoles('Admin', 'Principal'), validate(teacherCreateSchema), createTeacher);
teacherRouter.put('/:id', authenticateToken, authorizeRoles('Admin', 'Principal'), validate(teacherUpdateSchema), updateTeacher);
teacherRouter.delete('/:id', authenticateToken, authorizeRoles('Admin', 'Principal'), deleteTeacher);
