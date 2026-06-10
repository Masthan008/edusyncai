import { query } from '../database/db.js';
// Helper for letter grade and grade point conversion
const calculateLetterGrade = (marks, max) => {
    const pct = (marks / max) * 100;
    if (pct >= 90)
        return { letter: 'A+', point: 4.0 };
    if (pct >= 80)
        return { letter: 'A', point: 3.7 };
    if (pct >= 70)
        return { letter: 'B', point: 3.3 };
    if (pct >= 60)
        return { letter: 'C', point: 2.7 };
    if (pct >= 50)
        return { letter: 'D', point: 2.0 };
    return { letter: 'F', point: 0.0 };
};
export const createExam = async (req, res, next) => {
    const { name, class_id, academic_year_id, start_date, end_date } = req.body;
    try {
        const examRes = await query(`INSERT INTO exams (name, class_id, academic_year_id, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [name, class_id, academic_year_id, start_date, end_date]);
        return res.status(201).json({
            success: true,
            message: 'Exam schedule created successfully.',
            data: examRes.rows[0],
        });
    }
    catch (error) {
        next(error);
    }
};
export const getExams = async (req, res, next) => {
    const { classId } = req.query;
    try {
        let sql = `
      SELECT e.*, c.name as class_name, ay.name as academic_year_name
      FROM exams e
      JOIN classes c ON e.class_id = c.id
      JOIN academic_years ay ON e.academic_year_id = ay.id
      WHERE 1=1
    `;
        const params = [];
        if (classId) {
            params.push(classId);
            sql += ` AND e.class_id = $${params.length}`;
        }
        sql += ' ORDER BY e.start_date DESC';
        const examsRes = await query(sql, params);
        return res.status(200).json({
            success: true,
            data: examsRes.rows,
        });
    }
    catch (error) {
        next(error);
    }
};
export const recordGrade = async (req, res, next) => {
    const { exam_id, student_id, subject_id, marks_obtained, max_marks, remarks } = req.body;
    try {
        const { letter, point } = calculateLetterGrade(marks_obtained, max_marks);
        // Upsert logic for grades
        const checkGrade = await query('SELECT id FROM grades WHERE exam_id = $1 AND student_id = $2 AND subject_id = $3', [exam_id, student_id, subject_id]);
        let gradeRes;
        if (checkGrade.rowCount > 0) {
            gradeRes = await query(`UPDATE grades 
         SET marks_obtained = $1, max_marks = $2, grade_point = $3, letter_grade = $4, remarks = $5 
         WHERE exam_id = $6 AND student_id = $7 AND subject_id = $8 RETURNING *`, [marks_obtained, max_marks, point, letter, remarks || null, exam_id, student_id, subject_id]);
        }
        else {
            gradeRes = await query(`INSERT INTO grades (exam_id, student_id, subject_id, marks_obtained, max_marks, grade_point, letter_grade, remarks) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [exam_id, student_id, subject_id, marks_obtained, max_marks, point, letter, remarks || null]);
        }
        return res.status(200).json({
            success: true,
            message: 'Marks entered and GPA points calculated.',
            data: gradeRes.rows[0],
        });
    }
    catch (error) {
        next(error);
    }
};
export const getReportCard = async (req, res, next) => {
    const { studentId } = req.params;
    const { examId } = req.query;
    try {
        let sql = `
      SELECT g.*, sub.name as subject_name, sub.code as subject_code, sub.credits,
             e.name as exam_name, s.first_name, s.last_name, s.admission_number, s.roll_number
      FROM grades g
      JOIN subjects sub ON g.subject_id = sub.id
      JOIN exams e ON g.exam_id = e.id
      JOIN students s ON g.student_id = s.id
      WHERE g.student_id = $1
    `;
        const params = [studentId];
        if (examId) {
            params.push(examId);
            sql += ` AND g.exam_id = $${params.length}`;
        }
        const gradesRes = await query(sql, params);
        const grades = gradesRes.rows;
        if (grades.length === 0) {
            return res.status(404).json({ success: false, message: 'No grade records found for this student.' });
        }
        // Calculate GPA
        let totalCredits = 0;
        let weightedPoints = 0;
        grades.forEach((g) => {
            const credits = g.credits || 3;
            totalCredits += credits;
            weightedPoints += parseFloat(g.grade_point) * credits;
        });
        const gpa = totalCredits > 0 ? weightedPoints / totalCredits : 0.0;
        return res.status(200).json({
            success: true,
            data: {
                student: {
                    id: studentId,
                    name: `${grades[0].first_name} ${grades[0].last_name}`,
                    admission_number: grades[0].admission_number,
                    roll_number: grades[0].roll_number,
                },
                grades,
                summary: {
                    totalSubjects: grades.length,
                    totalCredits,
                    gpa: Math.round(gpa * 100) / 100,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
