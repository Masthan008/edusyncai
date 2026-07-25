import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';

export const getClasses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await query('SELECT * FROM classes ORDER BY name ASC');
    return res.status(200).json({ success: true, data: list.rows });
  } catch (error) {
    next(error);
  }
};

export const getSections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await query(
      `SELECT s.*, c.name as class_name 
       FROM sections s 
       JOIN classes c ON s.class_id = c.id 
       ORDER BY c.name ASC, s.name ASC`
    );
    return res.status(200).json({ success: true, data: list.rows });
  } catch (error) {
    next(error);
  }
};

export const getSubjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await query('SELECT * FROM subjects ORDER BY name ASC');
    return res.status(200).json({ success: true, data: list.rows });
  } catch (error) {
    next(error);
  }
};

export const getAcademicYears = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await query('SELECT * FROM academic_years ORDER BY name DESC');
    return res.status(200).json({ success: true, data: list.rows });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, department_id, credits } = req.body;
    const result = await query(
      `INSERT INTO subjects (name, code, department_id, credits) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, code, department_id, credits || 3]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Subject code must be unique.' });
    }
    next(error);
  }
};

export const updateSubject = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, code, department_id, credits } = req.body;

  try {
    const checkRes = await query('SELECT id FROM subjects WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    const result = await query(
      `UPDATE subjects 
       SET name = COALESCE($1, name), code = COALESCE($2, code), 
           department_id = COALESCE($3, department_id), credits = COALESCE($4, credits)
       WHERE id = $5 RETURNING *`,
      [name, code, department_id, credits, id]
    );

    return res.status(200).json({ success: true, message: 'Subject updated successfully.', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
export const createClass = async (req: Request, res: Response, next: NextFunction) => {
  const { name, department_id } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Class name is required.' });
  }

  try {
    const result = await query(
      'INSERT INTO classes (name, department_id) VALUES ($1, $2) RETURNING *',
      [name, department_id || null]
    );
    return res.status(201).json({ success: true, message: 'Class created successfully.', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const checkRes = await query('SELECT id FROM classes WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    await query('DELETE FROM classes WHERE id = $1', [id]);
    return res.status(200).json({ success: true, message: 'Class deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const createSection = async (req: Request, res: Response, next: NextFunction) => {
  const { name, class_id, room_number, advisor_id } = req.body;

  if (!name || !class_id) {
    return res.status(400).json({ success: false, message: 'Section name and class_id are required.' });
  }

  try {
    const result = await query(
      'INSERT INTO sections (name, class_id, room_number, advisor_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, class_id, room_number || null, advisor_id || null]
    );
    return res.status(201).json({ success: true, message: 'Section created successfully.', data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Section with this name already exists in the selected class.' });
    }
    next(error);
  }
};

export const deleteSection = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const checkRes = await query('SELECT id FROM sections WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }

    await query('DELETE FROM sections WHERE id = $1', [id]);
    return res.status(200).json({ success: true, message: 'Section deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const checkRes = await query('SELECT id FROM subjects WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await query('DELETE FROM subjects WHERE id = $1', [id]);
    return res.status(200).json({ success: true, message: 'Subject deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await query(
      `SELECT id, title, message, type, is_read, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as time 
       FROM notifications 
       ORDER BY created_at DESC 
       LIMIT 10`
    );
    return res.status(200).json({ success: true, data: list.rows });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  const { title, message, type, user_id } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }

  try {
    const result = await query(
      `INSERT INTO notifications (title, message, type, user_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, message, type || 'info', user_id || null]
    );
    return res.status(201).json({ success: true, message: 'Announcement notification posted.', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

