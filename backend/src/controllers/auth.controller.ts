import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, mockDb } from '../database/db.js';
import { config } from '../config/index.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    // Check user & join role
    const userRes = await query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [email]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    // Compare passwords
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT access & refresh tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name },
      config.jwtSecret,
      { expiresIn: '2h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      config.jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    // Fetch user profile based on role
    let profileData: any = {};
    if (user.role_name === 'Student') {
      const stdRes = await query('SELECT * FROM students WHERE id = $1', [user.id]);
      if (stdRes.rowCount > 0) profileData = stdRes.rows[0];
    } else if (user.role_name === 'Teacher' || user.role_name === 'HOD') {
      const teaRes = await query('SELECT * FROM teachers WHERE id = $1', [user.id]);
      if (teaRes.rowCount > 0) profileData = teaRes.rows[0];
    } else if (user.role_name === 'Parent') {
      const parRes = await query('SELECT * FROM parents WHERE id = $1', [user.id]);
      if (parRes.rowCount > 0) profileData = parRes.rows[0];
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role_name,
        },
        profile: profileData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  try {
    const userRes = await query(
      `SELECT u.id, u.email, u.is_active, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [userId]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const user = userRes.rows[0];
    let profileData: any = {};

    // Get specific profile details
    if (role === 'Student') {
      const stdRes = await query('SELECT * FROM students WHERE id = $1', [userId]);
      if (stdRes.rowCount > 0) {
        const student = stdRes.rows[0];
        // Fetch class and section
        const clsRes = await query('SELECT name FROM classes WHERE id = $1', [student.class_id]);
        const secRes = await query('SELECT name FROM sections WHERE id = $1', [student.section_id]);
        profileData = {
          ...student,
          class_name: clsRes.rows[0]?.name || 'N/A',
          section_name: secRes.rows[0]?.name || 'N/A',
        };
      }
    } else if (role === 'Teacher' || role === 'HOD' || role === 'Principal') {
      const teaRes = await query('SELECT * FROM teachers WHERE id = $1', [userId]);
      if (teaRes.rowCount > 0) {
        const teacher = teaRes.rows[0];
        const deptRes = await query('SELECT name FROM departments WHERE id = $1', [teacher.department_id]);
        profileData = {
          ...teacher,
          department_name: deptRes.rows[0]?.name || 'N/A',
        };
      }
    } else if (role === 'Parent') {
      const parRes = await query('SELECT * FROM parents WHERE id = $1', [userId]);
      if (parRes.rowCount > 0) {
        const parent = parRes.rows[0];
        // Fetch children
        const childrenRes = await query('SELECT id, first_name, last_name, admission_number FROM students WHERE parent_id = $1', [userId]);
        profileData = {
          ...parent,
          children: childrenRes.rows,
        };
      }
    } else if (role === 'Accountant') {
      // General accountant details
      profileData = { first_name: 'Finance', last_name: 'Department', role };
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role_name,
        },
        profile: profileData,
      },
    });
  } catch (error) {
    next(error);
  }
};
