import { Router } from 'express';
import { getClasses, getSections, getSubjects, getAcademicYears } from '../controllers/school.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

export const schoolRouter = Router();

schoolRouter.get('/classes', authenticateToken, getClasses);
schoolRouter.get('/sections', authenticateToken, getSections);
schoolRouter.get('/subjects', authenticateToken, getSubjects);
schoolRouter.get('/academic-years', authenticateToken, getAcademicYears);
