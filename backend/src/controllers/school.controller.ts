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

