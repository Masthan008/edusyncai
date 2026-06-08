import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';

export const submitAttendance = async (req: Request, res: Response, next: NextFunction) => {
  const { date, class_id, section_id, subject_id, records } = req.body;
  const teacherId = (req as any).user?.id; // authenticated user (teacher/admin)

  try {
    // 1. Create or fetch attendance session
    const checkSession = await query(
      `SELECT id FROM attendance 
       WHERE date = $1 AND class_id = $2 AND section_id = $3 
         AND (subject_id = $4 OR (subject_id IS NULL AND $4 IS NULL))`,
      [date, class_id, section_id, subject_id || null]
    );

    let attendanceId: string;

    if (checkSession.rowCount > 0) {
      attendanceId = checkSession.rows[0].id;
      // Clear old records for this session to update them
      await query('DELETE FROM attendance_records WHERE attendance_id = $1', [attendanceId]);
    } else {
      const newSession = await query(
        `INSERT INTO attendance (date, class_id, section_id, subject_id, taken_by) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [date, class_id, section_id, subject_id || null, teacherId]
      );
      attendanceId = newSession.rows[0].id;
    }

    // 2. Insert new records
    for (const rec of records) {
      await query(
        `INSERT INTO attendance_records (attendance_id, student_id, status, remarks) 
         VALUES ($1, $2, $3, $4)`,
        [attendanceId, rec.student_id, rec.status, rec.remarks || null]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully.',
      data: { attendanceId },
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceHistory = async (req: Request, res: Response, next: NextFunction) => {
  const { classId, sectionId, date, subjectId } = req.query;

  try {
    let sql = `
      SELECT ar.*, a.date, a.subject_id, s.first_name, s.last_name, s.roll_number,
             sub.name as subject_name
      FROM attendance_records ar
      JOIN attendance a ON ar.attendance_id = a.id
      JOIN students s ON ar.student_id = s.id
      LEFT JOIN subjects sub ON a.subject_id = sub.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (classId) {
      params.push(classId);
      sql += ` AND a.class_id = $${params.length}`;
    }
    if (sectionId) {
      params.push(sectionId);
      sql += ` AND a.section_id = $${params.length}`;
    }
    if (date) {
      params.push(date);
      sql += ` AND a.date = $${params.length}`;
    }
    if (subjectId) {
      params.push(subjectId);
      sql += ` AND a.subject_id = $${params.length}`;
    }

    sql += ' ORDER BY a.date DESC, s.roll_number ASC';
    const resHistory = await query(sql, params);

    return res.status(200).json({
      success: true,
      data: resHistory.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendanceSummary = async (req: Request, res: Response, next: NextFunction) => {
  const { studentId } = req.params;

  try {
    const recordsRes = await query(
      `SELECT ar.status, COUNT(*) as count 
       FROM attendance_records ar
       JOIN attendance a ON ar.attendance_id = a.id
       WHERE ar.student_id = $1
       GROUP BY ar.status`,
      [studentId]
    );

    const stats = recordsRes.rows;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    stats.forEach((row: any) => {
      if (row.status === 'Present') present = parseInt(row.count, 10);
      else if (row.status === 'Absent') absent = parseInt(row.count, 10);
      else if (row.status === 'Late') late = parseInt(row.count, 10);
      else if (row.status === 'Excused') excused = parseInt(row.count, 10);
    });

    const total = present + absent + late + excused;
    const rate = total > 0 ? ((present + late * 0.5) / total) * 100 : 100;

    // Fetch detailed subject attendance breakdown
    const subjectBreakdownRes = await query(
      `SELECT sub.id as subject_id, sub.name as subject_name, ar.status, COUNT(*) as count 
       FROM attendance_records ar
       JOIN attendance a ON ar.attendance_id = a.id
       JOIN subjects sub ON a.subject_id = sub.id
       WHERE ar.student_id = $1
       GROUP BY sub.id, sub.name, ar.status`,
      [studentId]
    );

    return res.status(200).json({
      success: true,
      data: {
        summary: { present, absent, late, excused, total, attendanceRate: Math.round(rate * 10) / 10 },
        breakdown: subjectBreakdownRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};
