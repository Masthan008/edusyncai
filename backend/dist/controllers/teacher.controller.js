import bcrypt from 'bcryptjs';
import { query } from '../database/db.js';
export const getTeachers = async (req, res, next) => {
    const { departmentId, search } = req.query;
    try {
        let sql = `
      SELECT t.*, u.email, d.name as department_name, d.code as department_code
      FROM teachers t
      JOIN users u ON t.id = u.id
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE 1=1
    `;
        const params = [];
        if (departmentId) {
            params.push(departmentId);
            sql += ` AND t.department_id = $${params.length}`;
        }
        if (search) {
            params.push(`%${search}%`);
            sql += ` AND (t.first_name ILIKE $${params.length} OR t.last_name ILIKE $${params.length})`;
        }
        sql += ' ORDER BY t.first_name ASC';
        const teachersRes = await query(sql, params);
        // Fetch workloads (number of timetable classes assigned to each teacher)
        const teachers = teachersRes.rows;
        for (const teacher of teachers) {
            const workloadRes = await query('SELECT COUNT(*)::int as class_count FROM timetables WHERE teacher_id = $1', [teacher.id]);
            teacher.workload = workloadRes.rows[0]?.class_count || 0;
        }
        return res.status(200).json({
            success: true,
            data: teachers,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getTeacherById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const teacherRes = await query(`SELECT t.*, u.email, d.name as department_name, d.code as department_code
       FROM teachers t
       JOIN users u ON t.id = u.id
       LEFT JOIN departments d ON t.department_id = d.id
       WHERE t.id = $1`, [id]);
        if (teacherRes.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found.' });
        }
        const teacher = teacherRes.rows[0];
        // Fetch details like subjects taught
        const subjectsRes = await query(`SELECT DISTINCT s.id, s.name, s.code 
       FROM timetables tt 
       JOIN subjects s ON tt.subject_id = s.id 
       WHERE tt.teacher_id = $1`, [id]);
        teacher.subjects = subjectsRes.rows;
        // Fetch schedule
        const scheduleRes = await query(`SELECT tt.*, c.name as class_name, sec.name as section_name, s.name as subject_name 
       FROM timetables tt
       JOIN classes c ON tt.class_id = c.id
       JOIN sections sec ON tt.section_id = sec.id
       JOIN subjects s ON tt.subject_id = s.id
       WHERE tt.teacher_id = $1 
       ORDER BY tt.day_of_week, tt.start_time`, [id]);
        teacher.schedule = scheduleRes.rows;
        return res.status(200).json({
            success: true,
            data: teacher,
        });
    }
    catch (error) {
        next(error);
    }
};
export const createTeacher = async (req, res, next) => {
    const { first_name, last_name, email, password, phone, department_id, qualification } = req.body;
    try {
        // 1. Check duplicate email
        const userCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rowCount > 0) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }
        // 2. Fetch Teacher role
        const roleRes = await query("SELECT id FROM roles WHERE name = 'Teacher'");
        if (roleRes.rowCount === 0) {
            return res.status(500).json({ success: false, message: 'Teacher role not found.' });
        }
        const roleId = roleRes.rows[0].id;
        // 3. Create User
        const passwordHash = bcrypt.hashSync(password, 10);
        const userInsert = await query('INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id', [email, passwordHash, roleId]);
        const newUserId = userInsert.rows[0].id;
        // 4. Create Teacher Profile
        const teacherInsert = await query(`INSERT INTO teachers (id, first_name, last_name, phone, department_id, qualification)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [newUserId, first_name, last_name, phone || null, department_id || null, qualification || null]);
        return res.status(201).json({
            success: true,
            message: 'Teacher profile created successfully.',
            data: teacherInsert.rows[0],
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateTeacher = async (req, res, next) => {
    const { id } = req.params;
    const { first_name, last_name, phone, department_id, qualification, status } = req.body;
    try {
        const checkRes = await query('SELECT id FROM teachers WHERE id = $1', [id]);
        if (checkRes.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found.' });
        }
        const updateRes = await query(`UPDATE teachers 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           department_id = COALESCE($4, department_id),
           qualification = COALESCE($5, qualification),
           status = COALESCE($6, status)
       WHERE id = $7 RETURNING *`, [first_name, last_name, phone, department_id, qualification, status, id]);
        return res.status(200).json({
            success: true,
            message: 'Teacher record updated successfully.',
            data: updateRes.rows[0],
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteTeacher = async (req, res, next) => {
    const { id } = req.params;
    try {
        const checkRes = await query('SELECT id FROM teachers WHERE id = $1', [id]);
        if (checkRes.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found.' });
        }
        // Cascade delete user
        await query('DELETE FROM users WHERE id = $1', [id]);
        return res.status(200).json({
            success: true,
            message: 'Teacher record deleted successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
