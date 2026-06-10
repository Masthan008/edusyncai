import { Router } from 'express';
import { login, getProfile } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { loginSchema } from '../validators/schemas.js';
export const authRouter = Router();
authRouter.post('/login', validate(loginSchema), login);
authRouter.get('/profile', authenticateToken, getProfile);
