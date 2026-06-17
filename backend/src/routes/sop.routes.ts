import { Router } from 'express';
import { getSops, getSopById, createSop, updateSop, deleteSop } from '../controllers/sop.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { sopCreateSchema, sopUpdateSchema } from '../validators/schemas.js';

export const sopRouter = Router();

sopRouter.get('/', authenticateToken, getSops);
sopRouter.get('/:id', authenticateToken, getSopById);
sopRouter.post('/', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD'), validate(sopCreateSchema), createSop);
sopRouter.put('/:id', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD'), validate(sopUpdateSchema), updateSop);
sopRouter.delete('/:id', authenticateToken, authorizeRoles('Admin', 'Principal', 'HOD'), deleteSop);
