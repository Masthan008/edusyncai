import { Router } from 'express';
import { getInstitutionOverview } from '../controllers/analytics.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

export const analyticsRouter = Router();

analyticsRouter.get('/overview', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD', 'Accountant'), getInstitutionOverview);
