import { Router } from 'express';
import { 
  getClasses, createClass, deleteClass,
  getSections, createSection, deleteSection,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getAcademicYears, getNotifications, createNotification 
} from '../controllers/school.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { subjectCreateSchema } from '../validators/schemas.js';

export const schoolRouter = Router();

schoolRouter.get('/classes', authenticateToken, getClasses);
schoolRouter.post('/classes', authenticateToken, authorizeRoles('Admin', 'Principal'), createClass);
schoolRouter.delete('/classes/:id', authenticateToken, authorizeRoles('Admin', 'Principal'), deleteClass);

schoolRouter.get('/sections', authenticateToken, getSections);
schoolRouter.post('/sections', authenticateToken, authorizeRoles('Admin', 'Principal'), createSection);
schoolRouter.delete('/sections/:id', authenticateToken, authorizeRoles('Admin', 'Principal'), deleteSection);

schoolRouter.get('/subjects', authenticateToken, getSubjects);
schoolRouter.post('/subjects', authenticateToken, authorizeRoles('Admin', 'Principal'), validate(subjectCreateSchema), createSubject);
schoolRouter.put('/subjects/:id', authenticateToken, authorizeRoles('Admin', 'Principal'), updateSubject);
schoolRouter.delete('/subjects/:id', authenticateToken, authorizeRoles('Admin', 'Principal'), deleteSubject);

schoolRouter.get('/academic-years', authenticateToken, getAcademicYears);

schoolRouter.get('/notifications', authenticateToken, getNotifications);
schoolRouter.post('/notifications', authenticateToken, authorizeRoles('Admin', 'Principal'), createNotification);


