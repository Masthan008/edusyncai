import { Router } from 'express';
import { getBooks, createBook, getIssues, issueBook, returnBook } from '../controllers/library.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

export const libraryRouter = Router();

libraryRouter.get('/books', authenticateToken, getBooks);
libraryRouter.post('/books', authenticateToken, authorizeRoles('Admin', 'Principal', 'Teacher'), createBook);
libraryRouter.get('/issues', authenticateToken, getIssues);
libraryRouter.post('/issue', authenticateToken, authorizeRoles('Admin', 'Principal', 'Teacher'), issueBook);
libraryRouter.put('/return/:id', authenticateToken, authorizeRoles('Admin', 'Principal', 'Teacher'), returnBook);
