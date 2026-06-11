import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';

export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deptSql = `
      SELECT d.*, t.first_name || ' ' || t.last_name as hod_name, t.phone as hod_phone
      FROM departments d
      LEFT JOIN teachers t ON d.hod_id = t.id
      ORDER BY d.name ASC
    `;
    const deptsRes = await query(deptSql);

    // Fetch aggregated counts for all departments at once
    const aggRes = await query(`
      SELECT
        d.id,
        COALESCE(tc.cnt, 0)::int as faculty_count,
        COALESCE(sc.cnt, 0)::int as student_count,
        COALESCE(sbc.cnt, 0)::int as subjects_count
      FROM departments d
      LEFT JOIN (SELECT department_id, COUNT(*)::int as cnt FROM teachers GROUP BY department_id) tc ON tc.department_id = d.id
      LEFT JOIN (SELECT c.department_id, COUNT(s.id)::int as cnt FROM students s JOIN classes c ON s.class_id = c.id GROUP BY c.department_id) sc ON sc.department_id = d.id
      LEFT JOIN (SELECT department_id, COUNT(*)::int as cnt FROM subjects GROUP BY department_id) sbc ON sbc.department_id = d.id
    `);
    const aggMap = new Map(aggRes.rows.map((r: any) => [r.id, r]));

    const depts = deptsRes.rows.map((d: any) => ({
      ...d,
      faculty_count: aggMap.get(d.id)?.faculty_count || 0,
      student_count: aggMap.get(d.id)?.student_count || 0,
      subjects_count: aggMap.get(d.id)?.subjects_count || 0,
    }));

    return res.status(200).json({
      success: true,
      data: depts,
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  const { name, code, hod_id } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, message: 'Department code is required.' });
  }

  try {
    const codeUpper = code.toUpperCase();
    const codeCheck = await query('SELECT id FROM departments WHERE code = $1', [codeUpper]);
    if (codeCheck.rowCount > 0) {
      return res.status(400).json({ success: false, message: 'Department code already exists.' });
    }

    const resDept = await query(
      'INSERT INTO departments (name, code, hod_id) VALUES ($1, $2, $3) RETURNING *',
      [name, codeUpper, hod_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: resDept.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const assignHOD = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { hod_id } = req.body;

  try {
    const deptCheck = await query('SELECT id FROM departments WHERE id = $1', [id]);
    if (deptCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // Update
    const resDept = await query(
      'UPDATE departments SET hod_id = $1 WHERE id = $2 RETURNING *',
      [hod_id, id]
    );

    // If teacher role is currently HOD or Teacher, make sure to update their department alignment
    if (hod_id) {
      await query('UPDATE teachers SET department_id = $1 WHERE id = $2', [id, hod_id]);
    }

    return res.status(200).json({
      success: true,
      message: 'HOD assigned successfully.',
      data: resDept.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const checkRes = await query('SELECT id FROM departments WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    await query('DELETE FROM departments WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
