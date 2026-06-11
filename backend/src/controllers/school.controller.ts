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

