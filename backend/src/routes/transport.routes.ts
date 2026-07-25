import { Router } from 'express';
import { getRoutes, createRoute, getVehicles, createVehicle } from '../controllers/transport.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

export const transportRouter = Router();

transportRouter.get('/routes', authenticateToken, getRoutes);
transportRouter.post('/routes', authenticateToken, authorizeRoles('Admin', 'Principal'), createRoute);
transportRouter.get('/vehicles', authenticateToken, getVehicles);
transportRouter.post('/vehicles', authenticateToken, authorizeRoles('Admin', 'Principal'), createVehicle);
