import { Router } from 'express';
import { createAssignment, getAssignments, submitAssignment, gradeSubmission, getSubmissions } from '../controllers/assignment.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { assignmentCreateSchema, assignmentSubmitSchema, gradeSubmissionSchema } from '../validators/schemas.js';

export const assignmentRouter = Router();

assignmentRouter.get('/', authenticateToken, getAssignments);
assignmentRouter.post('/', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD', 'Teacher'), validate(assignmentCreateSchema), createAssignment);
assignmentRouter.post('/submit', authenticateToken, authorizeRoles('Student'), validate(assignmentSubmitSchema), submitAssignment);
assignmentRouter.put('/grade/:id', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD', 'Teacher'), validate(gradeSubmissionSchema), gradeSubmission);
assignmentRouter.get('/submissions', authenticateToken, getSubmissions);
