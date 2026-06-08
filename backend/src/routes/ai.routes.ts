import { Router } from 'express';
import { getAcademicAssistantReply, getPerformanceInsights, getReportSummary } from '../controllers/ai.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

export const aiRouter = Router();

aiRouter.post('/assistant', authenticateToken, getAcademicAssistantReply);
aiRouter.get('/insights/:studentId', authenticateToken, getPerformanceInsights);
aiRouter.get('/report-summary/:studentId', authenticateToken, getReportSummary);
