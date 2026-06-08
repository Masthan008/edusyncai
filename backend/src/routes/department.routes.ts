import { Router } from 'express';
import { getDepartments, createDepartment, assignHOD, deleteDepartment } from '../controllers/department.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { departmentCreateSchema } from '../validators/schemas.js';

export const departmentRouter = Router();

departmentRouter.get('/', authenticateToken, getDepartments);
departmentRouter.post('/', authenticateToken, authorizeRoles('Admin', 'Principal'), validate(departmentCreateSchema), createDepartment);
departmentRouter.put('/:id/hod', authenticateToken, authorizeRoles('Admin', 'Principal'), assignHOD);
departmentRouter.delete('/:id', authenticateToken, authorizeRoles('Admin', 'Principal'), deleteDepartment);
