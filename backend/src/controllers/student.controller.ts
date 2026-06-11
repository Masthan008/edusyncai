import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../database/db.js';

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  const { classId, sectionId, search } = req.query;

  try {
    let sql = `
      SELECT s.*, u.email, c.name as class_name, sec.name as section_name,
             p.first_name || ' ' || p.last_name as parent_name
      FROM students s
      JOIN users u ON s.id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN parents p ON s.parent_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (classId) {
      params.push(classId);
      sql += ` AND s.class_id = $${params.length}`;
    }
    if (sectionId) {
      params.push(sectionId);
      sql += ` AND s.section_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (s.first_name ILIKE $${params.length} OR s.last_name ILIKE $${params.length} OR s.admission_number ILIKE $${params.length})`;
    }

    sql += ' ORDER BY s.first_name ASC';
    const studentsRes = await query(sql, params);

    return res.status(200).json({
      success: true,
      data: studentsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const studentRes = await query(
      `SELECT s.*, u.email, c.name as class_name, sec.name as section_name,
              p.first_name as parent_first_name, p.last_name as parent_last_name, p.phone as parent_phone, p.email as parent_email
       FROM students s
       JOIN users u ON s.id = u.id
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN sections sec ON s.section_id = sec.id
       LEFT JOIN parents p ON s.parent_id = p.id
       WHERE s.id = $1`,
      [id]
    );

    if (studentRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    return res.status(200).json({
      success: true,
      data: studentRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const admitStudent = async (req: Request, res: Response, next: NextFunction) => {
  const {
    first_name,
    last_name,
    email,
    password,
    admission_number,
    roll_number,
    class_id,
    section_id,
    parent_email,
    dob,
    gender,
    address,
  } = req.body;

  try {
    // 1. Check if user already exists
    const userCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rowCount > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // 2. Fetch Student role id
    const roleRes = await query("SELECT id FROM roles WHERE name = 'Student'");
    if (roleRes.rowCount === 0) {
      return res.status(500).json({ success: false, message: 'Student role not found in system.' });
    }
    const studentRoleId = roleRes.rows[0].id;

    // 3. Check Parent connection if parent_email provided
    let parentId = null;
    if (parent_email) {
      const parentRes = await query(
        `SELECT p.id FROM parents p 
         JOIN users u ON p.id = u.id 
         WHERE u.email = $1`,
        [parent_email]
      );
      if (parentRes.rowCount > 0) {
        parentId = parentRes.rows[0].id;
      }
    }

    // 4. Create User
    const passwordHash = await bcrypt.hash(password, 10);
    const userInsert = await query(
      'INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id',
      [email, passwordHash, studentRoleId]
    );
    const newUserId = userInsert.rows[0].id;

    // 5. Create Student Profile
    const studentInsert = await query(
      `INSERT INTO students (
        id, first_name, last_name, admission_number, roll_number, 
        class_id, section_id, parent_id, dob, gender, address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        newUserId,
        first_name,
        last_name,
        admission_number,
        roll_number || null,
        class_id,
        section_id,
        parentId,
        dob,
        gender || null,
        address || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Student admitted and registered successfully.',
      data: studentInsert.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { first_name, last_name, roll_number, class_id, section_id, status, gender, address } = req.body;

  try {
    const checkRes = await query('SELECT id FROM students WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const updateRes = await query(
      `UPDATE students 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           roll_number = COALESCE($3, roll_number),
           class_id = COALESCE($4, class_id),
           section_id = COALESCE($5, section_id),
           status = COALESCE($6, status),
           gender = COALESCE($7, gender),
           address = COALESCE($8, address)
       WHERE id = $9 RETURNING *`,
      [first_name, last_name, roll_number, class_id, section_id, status, gender, address, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully.',
      data: updateRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const checkRes = await query('SELECT id FROM students WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Cascade delete user deletes the profile due to ON DELETE CASCADE
    await query('DELETE FROM users WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Student record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
