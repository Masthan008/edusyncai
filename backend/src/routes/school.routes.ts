import { Router } from 'express';
import { getClasses, getSections, getSubjects, getAcademicYears, createSubject } from '../controllers/school.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { subjectCreateSchema } from '../validators/schemas.js';

export const schoolRouter = Router();

schoolRouter.get('/classes', authenticateToken, getClasses);
schoolRouter.get('/sections', authenticateToken, getSections);
schoolRouter.get('/subjects', authenticateToken, getSubjects);
schoolRouter.post('/subjects', authenticateToken, authorizeRoles('Admin', 'Principal'), validate(subjectCreateSchema), createSubject);
schoolRouter.get('/academic-years', authenticateToken, getAcademicYears);

