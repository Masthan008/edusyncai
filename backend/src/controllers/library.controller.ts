import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';

export const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await query('SELECT * FROM library_books ORDER BY title ASC');
    return res.status(200).json({ success: true, data: list.rows });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, author, isbn, category, total_copies } = req.body;
  if (!title || !author || !isbn) {
    return res.status(400).json({ success: false, message: 'Title, author, and ISBN are required.' });
  }

  try {
    const copies = total_copies || 1;
    const result = await query(
      'INSERT INTO library_books (title, author, isbn, category, total_copies, available_copies) VALUES ($1, $2, $3, $4, $5, $5) RETURNING *',
      [title, author, isbn, category || 'General', copies]
    );
    return res.status(201).json({ success: true, message: 'Book cataloged successfully.', data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Book with this ISBN already exists.' });
    }
    next(error);
  }
};

export const getIssues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await query(
      `SELECT i.*, b.title as book_title, b.isbn,
              s.first_name || ' ' || s.last_name as student_name, s.admission_number
       FROM library_issues i
       JOIN library_books b ON i.book_id = b.id
       JOIN students s ON i.student_id = s.id
       ORDER BY i.issue_date DESC`
    );
    return res.status(200).json({ success: true, data: list.rows });
  } catch (error) {
    next(error);
  }
};

export const issueBook = async (req: Request, res: Response, next: NextFunction) => {
  const { book_id, student_id, due_date } = req.body;
  if (!book_id || !student_id || !due_date) {
    return res.status(400).json({ success: false, message: 'Book ID, Student ID, and Due Date are required.' });
  }

  try {
    const bookCheck = await query('SELECT available_copies FROM library_books WHERE id = $1', [book_id]);
    if (bookCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }
    if (bookCheck.rows[0].available_copies <= 0) {
      return res.status(400).json({ success: false, message: 'No copies available for checkout.' });
    }

    // Deduct available copy
    await query('UPDATE library_books SET available_copies = available_copies - 1 WHERE id = $1', [book_id]);

    const result = await query(
      'INSERT INTO library_issues (book_id, student_id, due_date, status) VALUES ($1, $2, $3, \'Issued\') RETURNING *',
      [book_id, student_id, due_date]
    );

    return res.status(201).json({ success: true, message: 'Book issued successfully.', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { fine_amount } = req.body;

  try {
    const issueCheck = await query('SELECT * FROM library_issues WHERE id = $1', [id]);
    if (issueCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Library issue record not found.' });
    }

    const issue = issueCheck.rows[0];
    if (issue.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Book is already returned.' });
    }

    // Increment available copies
    await query('UPDATE library_books SET available_copies = available_copies + 1 WHERE id = $1', [issue.book_id]);

    const result = await query(
      'UPDATE library_issues SET status = \'Returned\', return_date = CURRENT_DATE, fine_amount = COALESCE($1, fine_amount) WHERE id = $2 RETURNING *',
      [fine_amount || 0.00, id]
    );

    return res.status(200).json({ success: true, message: 'Book returned successfully.', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
