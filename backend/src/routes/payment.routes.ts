import { Router } from 'express';
import { getFeeStructures, createFeeStructure, updateFeeStructure, recordPayment, getStudentPayments, getAccountantSummary } from '../controllers/payment.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { paymentRecordSchema, feeStructureCreateSchema } from '../validators/schemas.js';

export const paymentRouter = Router();

paymentRouter.get('/structures', authenticateToken, getFeeStructures);
paymentRouter.post('/structures', authenticateToken, authorizeRoles('Admin', 'Accountant', 'Principal'), validate(feeStructureCreateSchema), createFeeStructure);
paymentRouter.put('/structures/:id', authenticateToken, authorizeRoles('Admin', 'Accountant', 'Principal'), updateFeeStructure);
paymentRouter.post('/record', authenticateToken, authorizeRoles('Admin', 'Accountant', 'Parent'), validate(paymentRecordSchema), recordPayment);
paymentRouter.get('/student/:studentId', authenticateToken, getStudentPayments);
paymentRouter.get('/summary', authenticateToken, authorizeRoles('Admin', 'Accountant', 'Principal'), getAccountantSummary);
