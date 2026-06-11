import { Router } from 'express';
import { login, getProfile, register } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { loginSchema, registerSchema } from '../validators/schemas.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/register', validate(registerSchema), register);
authRouter.get('/profile', authenticateToken, getProfile);

