import { Router } from 'express';
import { getStudents, getStudentById, admitStudent, updateStudent, deleteStudent } from '../controllers/student.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { studentCreateSchema, studentUpdateSchema } from '../validators/schemas.js';

export const studentRouter = Router();

studentRouter.get('/', authenticateToken, getStudents);
studentRouter.get('/:id', authenticateToken, getStudentById);
studentRouter.post('/', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD'), validate(studentCreateSchema), admitStudent);
studentRouter.put('/:id', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD', 'Teacher'), validate(studentUpdateSchema), updateStudent);
studentRouter.delete('/:id', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD'), deleteStudent);
