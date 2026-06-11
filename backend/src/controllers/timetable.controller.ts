import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';

export const createTimetableSlot = async (req: Request, res: Response, next: NextFunction) => {
  const { class_id, section_id, subject_id, teacher_id, day_of_week, start_time, end_time, room } = req.body;

  try {
    // 1. Clash Check: Teacher clash
    const teacherClash = await query(
      `SELECT id FROM timetables 
       WHERE teacher_id = $1 AND day_of_week = $2 AND 
             (($3::time, $4::time) OVERLAPS (start_time, end_time))`,
      [teacher_id, day_of_week, start_time, end_time]
    );

    if (teacherClash.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Clash detected: This teacher is already scheduled for another class during this time.',
      });
    }

    // 2. Clash Check: Room clash
    const roomClash = await query(
      `SELECT id FROM timetables 
       WHERE room = $1 AND day_of_week = $2 AND 
             (($3::time, $4::time) OVERLAPS (start_time, end_time))`,
      [room, day_of_week, start_time, end_time]
    );

    if (roomClash.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Clash detected: Room '${room}' is already booked during this time.`,
      });
    }

    // 3. Insert Slot
    const slotRes = await query(
      `INSERT INTO timetables (class_id, section_id, subject_id, teacher_id, day_of_week, start_time, end_time, room) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [class_id, section_id, subject_id, teacher_id, day_of_week, start_time, end_time, room]
    );

    return res.status(201).json({
      success: true,
      message: 'Timetable slot created successfully.',
      data: slotRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getClassTimetable = async (req: Request, res: Response, next: NextFunction) => {
  const { classId, sectionId } = req.params;

  try {
    const listRes = await query(
      `SELECT tt.*, s.name as subject_name, s.code as subject_code,
             t.first_name || ' ' || t.last_name as teacher_name
       FROM timetables tt
       JOIN subjects s ON tt.subject_id = s.id
       JOIN teachers t ON tt.teacher_id = t.id
       WHERE tt.class_id = $1 AND tt.section_id = $2
       ORDER BY tt.day_of_week, tt.start_time`,
      [classId, sectionId]
    );

    return res.status(200).json({
      success: true,
      data: listRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherTimetable = async (req: Request, res: Response, next: NextFunction) => {
  const { teacherId } = req.params;

  try {
    const listRes = await query(
      `SELECT tt.*, s.name as subject_name, s.code as subject_code,
             c.name as class_name, sec.name as section_name
       FROM timetables tt
       JOIN subjects s ON tt.subject_id = s.id
       JOIN classes c ON tt.class_id = c.id
       JOIN sections sec ON tt.section_id = sec.id
       WHERE tt.teacher_id = $1
       ORDER BY tt.day_of_week, tt.start_time`,
      [teacherId]
    );

    return res.status(200).json({
      success: true,
      data: listRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTimetableSlot = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { class_id, section_id, subject_id, teacher_id, day_of_week, start_time, end_time, room } = req.body;

  try {
    const checkRes = await query('SELECT id FROM timetables WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Timetable slot not found.' });
    }

    if (teacher_id && start_time && end_time) {
      const teacherClash = await query(
        `SELECT id FROM timetables 
         WHERE teacher_id = $1 AND day_of_week = $2 AND id != $3 AND
               (($4::time, $5::time) OVERLAPS (start_time, end_time))`,
        [teacher_id, day_of_week || checkRes.rows[0].day_of_week, id, start_time, end_time]
      );
      if (teacherClash.rowCount > 0) {
        return res.status(400).json({ success: false, message: 'Clash detected for this teacher.' });
      }
    }

    const result = await query(
      `UPDATE timetables 
       SET class_id = COALESCE($1, class_id), section_id = COALESCE($2, section_id),
           subject_id = COALESCE($3, subject_id), teacher_id = COALESCE($4, teacher_id),
           day_of_week = COALESCE($5, day_of_week), start_time = COALESCE($6, start_time),
           end_time = COALESCE($7, end_time), room = COALESCE($8, room)
       WHERE id = $9 RETURNING *`,
      [class_id, section_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, id]
    );

    return res.status(200).json({ success: true, message: 'Timetable slot updated.', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
