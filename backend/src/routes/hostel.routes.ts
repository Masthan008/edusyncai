import { Router } from 'express';
import { getHostels, createHostel, getRooms, createRoom } from '../controllers/hostel.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

export const hostelRouter = Router();

hostelRouter.get('/', authenticateToken, getHostels);
hostelRouter.post('/', authenticateToken, authorizeRoles('Admin', 'Principal'), createHostel);
hostelRouter.get('/rooms', authenticateToken, getRooms);
hostelRouter.post('/rooms', authenticateToken, authorizeRoles('Admin', 'Principal'), createRoom);
