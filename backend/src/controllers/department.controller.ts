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
    const depts = deptsRes.rows;

    // Fetch faculty count and student count for each department dynamically
    for (const d of depts) {
      const facultyCountRes = await query(
        'SELECT COUNT(*)::int as count FROM teachers WHERE department_id = $1',
        [d.id]
      );
      d.faculty_count = facultyCountRes.rows[0]?.count || 0;

      const studentCountRes = await query(
        `SELECT COUNT(s.id)::int as count 
         FROM students s
         JOIN classes c ON s.class_id = c.id
         WHERE c.department_id = $1`,
        [d.id]
      );
      d.student_count = studentCountRes.rows[0]?.count || 0;

      // Fetch subject count
      const subjectCountRes = await query(
        'SELECT COUNT(*)::int as count FROM subjects WHERE department_id = $1',
        [d.id]
      );
      d.subjects_count = subjectCountRes.rows[0]?.count || 0;
    }

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

  try {
    const codeCheck = await query('SELECT id FROM departments WHERE code = $1', [code.toUpperCase()]);
    if (codeCheck.rowCount > 0) {
      return res.status(400).json({ success: false, message: 'Department code already exists.' });
    }

    const resDept = await query(
      'INSERT INTO departments (name, code, hod_id) VALUES ($1, $2, $3) RETURNING *',
      [name, code.toUpperCase(), hod_id || null]
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
