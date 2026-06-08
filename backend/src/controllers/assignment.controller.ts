import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';

export const createAssignment = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, subject_id, class_id, section_id, due_date, max_marks } = req.body;
  const teacherId = (req as any).user?.id;

  try {
    const assignRes = await query(
      `INSERT INTO assignments (title, description, subject_id, class_id, section_id, teacher_id, due_date, max_marks) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description || null, subject_id, class_id, section_id, teacherId, due_date, max_marks]
    );

    return res.status(201).json({
      success: true,
      message: 'Assignment created and published successfully.',
      data: assignRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignments = async (req: Request, res: Response, next: NextFunction) => {
  const { classId, sectionId, subjectId } = req.query;

  try {
    let sql = `
      SELECT a.*, s.name as subject_name, s.code as subject_code,
             t.first_name || ' ' || t.last_name as teacher_name,
             c.name as class_name
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      JOIN teachers t ON a.teacher_id = t.id
      JOIN classes c ON a.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (classId) {
      params.push(classId);
      sql += ` AND a.class_id = $${params.length}`;
    }
    if (sectionId) {
      params.push(sectionId);
      sql += ` AND a.section_id = $${params.length}`;
    }
    if (subjectId) {
      params.push(subjectId);
      sql += ` AND a.subject_id = $${params.length}`;
    }

    sql += ' ORDER BY a.created_at DESC';
    const assignmentsRes = await query(sql, params);

    return res.status(200).json({
      success: true,
      data: assignmentsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (req: Request, res: Response, next: NextFunction) => {
  const { assignment_id, file_url, student_notes } = req.body;
  const studentId = (req as any).user?.id;

  try {
    // Check if assignment exists and due date hasn't passed
    const assignCheck = await query('SELECT due_date FROM assignments WHERE id = $1', [assignment_id]);
    if (assignCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    const dueDate = new Date(assignCheck.rows[0].due_date);
    const status = new Date() > dueDate ? 'Late' : 'Submitted';

    // Upsert submission
    const checkSub = await query(
      'SELECT id FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignment_id, studentId]
    );

    let subRes;
    if (checkSub.rowCount > 0) {
      subRes = await query(
        `UPDATE assignment_submissions 
         SET submission_date = CURRENT_TIMESTAMP, file_url = $1, student_notes = $2, status = $3
         WHERE assignment_id = $4 AND student_id = $5 RETURNING *`,
        [file_url || null, student_notes || null, status, assignment_id, studentId]
      );
    } else {
      subRes = await query(
        `INSERT INTO assignment_submissions (assignment_id, student_id, file_url, student_notes, status) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [assignment_id, studentId, file_url || null, student_notes || null, status]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully.',
      data: subRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params; // Submission ID
  const { marks_obtained, teacher_remarks } = req.body;
  const teacherId = (req as any).user?.id;

  try {
    const subCheck = await query('SELECT id FROM assignment_submissions WHERE id = $1', [id]);
    if (subCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const gradeRes = await query(
      `UPDATE assignment_submissions 
       SET status = 'Graded', marks_obtained = $1, teacher_remarks = $2, graded_by = $3
       WHERE id = $4 RETURNING *`,
      [marks_obtained, teacher_remarks || null, teacherId, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Submission graded and feedback recorded.',
      data: gradeRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  const { assignmentId } = req.query;

  try {
    let sql = `
      SELECT sub.*, st.first_name || ' ' || st.last_name as student_name, st.roll_number,
             a.title as assignment_title, a.max_marks
      FROM assignment_submissions sub
      JOIN students st ON sub.student_id = st.id
      JOIN assignments a ON sub.assignment_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (assignmentId) {
      params.push(assignmentId);
      sql += ` AND sub.assignment_id = $${params.length}`;
    }

    const subsRes = await query(sql, params);

    return res.status(200).json({
      success: true,
      data: subsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};
