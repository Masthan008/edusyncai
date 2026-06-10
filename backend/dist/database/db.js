import pg from 'pg';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
const { Pool } = pg;
// Connection Pool
export const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.dbSsl ? { rejectUnauthorized: false } : false,
});
let isPostgresConnected = false;
let useMock = false;
// Attempt initial database connection to check availability
pool.connect((err, client, release) => {
    if (err) {
        console.warn('⚠️ PostgreSQL connection failed. Falling back to IN-MEMORY Mock Database.');
        console.warn(`Error detail: ${err.message}`);
        useMock = true;
    }
    else {
        console.log('✅ Connected to PostgreSQL Database successfully.');
        isPostgresConnected = true;
        release();
    }
});
// Helper for passwords
const hash = (pass) => bcrypt.hashSync(pass, 10);
// In-Memory Data Store (Fallback)
export const mockDb = {
    roles: [
        { id: 'role-admin-1111', name: 'Admin' },
        { id: 'role-principal-2222', name: 'Principal' },
        { id: 'role-hod-3333', name: 'HOD' },
        { id: 'role-teacher-4444', name: 'Teacher' },
        { id: 'role-student-5555', name: 'Student' },
        { id: 'role-parent-6666', name: 'Parent' },
        { id: 'role-accountant-7777', name: 'Accountant' },
    ],
    users: [
        { id: 'user-admin-1', email: 'admin@edusync.com', password_hash: hash('admin123'), role_id: 'role-admin-1111', is_active: true },
        { id: 'user-principal-1', email: 'principal@edusync.com', password_hash: hash('principal123'), role_id: 'role-principal-2222', is_active: true },
        { id: 'user-hod-1', email: 'hod@edusync.com', password_hash: hash('hod123'), role_id: 'role-hod-3333', is_active: true },
        { id: 'user-teacher-1', email: 'teacher@edusync.com', password_hash: hash('teacher123'), role_id: 'role-teacher-4444', is_active: true },
        { id: 'user-teacher-2', email: 'teacher2@edusync.com', password_hash: hash('teacher123'), role_id: 'role-teacher-4444', is_active: true },
        { id: 'user-student-1', email: 'student@edusync.com', password_hash: hash('student123'), role_id: 'role-student-5555', is_active: true },
        { id: 'user-student-2', email: 'student2@edusync.com', password_hash: hash('student123'), role_id: 'role-student-5555', is_active: true },
        { id: 'user-parent-1', email: 'parent@edusync.com', password_hash: hash('parent123'), role_id: 'role-parent-6666', is_active: true },
        { id: 'user-accountant-1', email: 'accountant@edusync.com', password_hash: hash('accountant123'), role_id: 'role-accountant-7777', is_active: true },
    ],
    academic_years: [
        { id: 'ay-1', name: '2025-2026', start_date: '2025-06-01', end_date: '2026-04-30', is_current: true },
    ],
    departments: [
        { id: 'dept-cs', name: 'Computer Science', code: 'CS', hod_id: 'user-teacher-1' },
        { id: 'dept-sci', name: 'Natural Science', code: 'SCI', hod_id: 'user-teacher-2' },
        { id: 'dept-math', name: 'Mathematics', code: 'MATH', hod_id: null },
    ],
    teachers: [
        { id: 'user-teacher-1', first_name: 'Sarah', last_name: 'Connor', phone: '+1234567890', department_id: 'dept-cs', qualification: 'Ph.D. in Computer Science', joining_date: '2023-08-15', status: 'Active' },
        { id: 'user-teacher-2', first_name: 'Walter', last_name: 'White', phone: '+1987654321', department_id: 'dept-sci', qualification: 'M.Sc. in Chemistry', joining_date: '2024-01-10', status: 'Active' },
    ],
    parents: [
        { id: 'user-parent-1', first_name: 'John', last_name: 'Doe Senior', phone: '+1122334455', occupation: 'Software Engineer', address: '123 Main St, Seattle' },
    ],
    classes: [
        { id: 'class-10', name: 'Grade 10', department_id: 'dept-sci' },
        { id: 'class-11', name: 'Grade 11', department_id: 'dept-cs' },
    ],
    sections: [
        { id: 'sect-10a', name: 'A', class_id: 'class-10', room_number: 'Room 301', advisor_id: 'user-teacher-2' },
        { id: 'sect-11a', name: 'A', class_id: 'class-11', room_number: 'Lab 1', advisor_id: 'user-teacher-1' },
    ],
    students: [
        { id: 'user-student-1', first_name: 'John', last_name: 'Doe', admission_number: 'ADM-2025-001', roll_number: '10', class_id: 'class-10', section_id: 'sect-10a', parent_id: 'user-parent-1', dob: '2010-05-15', gender: 'Male', address: '123 Main St, Seattle', admission_date: '2025-06-01', status: 'Active' },
        { id: 'user-student-2', first_name: 'Jane', last_name: 'Smith', admission_number: 'ADM-2025-002', roll_number: '11', class_id: 'class-11', section_id: 'sect-11a', parent_id: null, dob: '2009-11-20', gender: 'Female', address: '456 Oak Ave, Boston', admission_date: '2025-06-01', status: 'Active' },
    ],
    subjects: [
        { id: 'subj-cs1', name: 'Introduction to Computer Science', code: 'CS101', department_id: 'dept-cs', credits: 4 },
        { id: 'subj-chem', name: 'Organic Chemistry', code: 'CHEM101', department_id: 'dept-sci', credits: 3 },
    ],
    attendance: [
        { id: 'att-1', date: '2026-06-08', class_id: 'class-10', section_id: 'sect-10a', subject_id: 'subj-chem', taken_by: 'user-teacher-2' },
    ],
    attendance_records: [
        { id: 'attr-1', attendance_id: 'att-1', student_id: 'user-student-1', status: 'Present', remarks: 'On time' },
    ],
    exams: [
        { id: 'exam-1', name: 'Midterm Exam', class_id: 'class-10', academic_year_id: 'ay-1', start_date: '2026-10-10', end_date: '2026-10-15' },
    ],
    grades: [
        { id: 'grade-1', exam_id: 'exam-1', student_id: 'user-student-1', subject_id: 'subj-chem', marks_obtained: 88.5, max_marks: 100, grade_point: 3.7, letter_grade: 'A', remarks: 'Excellent performance' },
    ],
    assignments: [
        { id: 'assign-1', title: 'Chemical Reactions Report', description: 'Write a 2-page report on organic chemical reactions.', subject_id: 'subj-chem', class_id: 'class-10', section_id: 'sect-10a', teacher_id: 'user-teacher-2', due_date: '2026-06-15T23:59:59Z', max_marks: 50.0 },
    ],
    assignment_submissions: [
        { id: 'sub-1', assignment_id: 'assign-1', student_id: 'user-student-1', submission_date: '2026-06-07T14:30:00Z', file_url: '/uploads/reactions_report.pdf', status: 'Submitted', marks_obtained: null, teacher_remarks: null, graded_by: null },
    ],
    fee_structures: [
        { id: 'fee-1', name: 'Tuition Fee - Grade 10', class_id: 'class-10', amount: 1200.0, due_date: '2026-07-01', academic_year_id: 'ay-1' },
        { id: 'fee-2', name: 'Tuition Fee - Grade 11', class_id: 'class-11', amount: 1400.0, due_date: '2026-07-01', academic_year_id: 'ay-1' },
    ],
    payments: [
        { id: 'pay-1', student_id: 'user-student-1', fee_structure_id: 'fee-1', amount_paid: 1200.0, payment_date: '2026-06-05T09:00:00Z', payment_method: 'Card', transaction_reference: 'TXN-982348', status: 'Paid' },
    ],
    timetables: [
        { id: 'tt-1', class_id: 'class-10', section_id: 'sect-10a', subject_id: 'subj-chem', teacher_id: 'user-teacher-2', day_of_week: 1, start_time: '09:00:00', end_time: '10:00:00', room: 'Room 301' },
        { id: 'tt-2', class_id: 'class-10', section_id: 'sect-10a', subject_id: 'subj-cs1', teacher_id: 'user-teacher-1', day_of_week: 1, start_time: '10:15:00', end_time: '11:15:00', room: 'Lab 1' },
    ],
    notifications: [
        { id: 'notif-1', user_id: null, title: 'Welcome to EduSync AI', message: 'The new ERP system is officially online.', type: 'success', is_read: false, created_at: new Date().toISOString() },
    ],
};
// Generic query router for mock database (simulating PostgreSQL query responses)
export const query = async (text, params = []) => {
    if (!useMock) {
        try {
            const res = await pool.query(text, params);
            return { rows: res.rows, rowCount: res.rowCount || 0 };
        }
        catch (err) {
            console.error('SQL Execution Error, falling back to mock routing:', err.message);
            // Fall through to mock DB if SQL server goes down
        }
    }
    // Normalize query space for simple regex matching
    const q = text.replace(/\s+/g, ' ').trim();
    // 1. Auth: Find user with email and join role name
    if (q.includes('FROM users') && (q.includes('email =') || q.includes('u.email ='))) {
        const email = params[0];
        const user = mockDb.users.find((u) => u.email === email);
        if (!user)
            return { rows: [], rowCount: 0 };
        const role = mockDb.roles.find((r) => r.id === user.role_id);
        return {
            rows: [{ ...user, role_name: role ? role.name : 'Student' }],
            rowCount: 1,
        };
    }
    // 2. Auth: Get roles list
    if (q.startsWith('SELECT') && q.includes('FROM roles')) {
        return { rows: mockDb.roles, rowCount: mockDb.roles.length };
    }
    // 3. User Detail by ID
    if (q.includes('FROM users') && (q.includes('id =') || q.includes('u.id ='))) {
        const id = params[0];
        const user = mockDb.users.find((u) => u.id === id);
        if (!user)
            return { rows: [], rowCount: 0 };
        const role = mockDb.roles.find((r) => r.id === user.role_id);
        return {
            rows: [{ ...user, role_name: role ? role.name : 'Student' }],
            rowCount: 1,
        };
    }
    // 4. Students list or details
    if (q.includes('FROM students')) {
        if (q.includes('WHERE id =')) {
            const id = params[0];
            const s = mockDb.students.find((std) => std.id === id);
            if (!s)
                return { rows: [], rowCount: 0 };
            const user = mockDb.users.find((u) => u.id === s.id) || {};
            const cls = mockDb.classes.find((c) => c.id === s.class_id);
            const sect = mockDb.sections.find((sec) => sec.id === s.section_id);
            const parent = mockDb.parents.find((p) => p.id === s.parent_id);
            return {
                rows: [{
                        ...s,
                        email: user.email,
                        class_name: cls ? cls.name : 'N/A',
                        section_name: sect ? sect.name : 'N/A',
                        parent_name: parent ? `${parent.first_name} ${parent.last_name}` : 'N/A',
                        parent_phone: parent ? parent.phone : 'N/A',
                    }],
                rowCount: 1,
            };
        }
        // Return all students populated with class name and section details
        const populated = mockDb.students.map((s) => {
            const user = mockDb.users.find((u) => u.id === s.id) || {};
            const cls = mockDb.classes.find((c) => c.id === s.class_id);
            const sect = mockDb.sections.find((sec) => sec.id === s.section_id);
            const parent = mockDb.parents.find((p) => p.id === s.parent_id);
            return {
                ...s,
                email: user.email,
                class_name: cls ? cls.name : 'N/A',
                section_name: sect ? sect.name : 'N/A',
                parent_name: parent ? `${parent.first_name} ${parent.last_name}` : 'N/A',
                parent_phone: parent ? parent.phone : 'N/A',
            };
        });
        return { rows: populated, rowCount: populated.length };
    }
    // 5. Insert user / student / teacher / parent
    if (q.startsWith('INSERT INTO users')) {
        const [id, email, password_hash, role_id] = params;
        const newUser = { id: id || `user-${Date.now()}`, email, password_hash, role_id, is_active: true };
        mockDb.users.push(newUser);
        return { rows: [newUser], rowCount: 1 };
    }
    if (q.startsWith('INSERT INTO students')) {
        const [id, first_name, last_name, admission_number, roll_number, class_id, section_id, parent_id, dob, gender, address] = params;
        const newStudent = { id, first_name, last_name, admission_number, roll_number, class_id, section_id, parent_id, dob, gender, address, admission_date: new Date().toISOString().split('T')[0], status: 'Active' };
        mockDb.students.push(newStudent);
        return { rows: [newStudent], rowCount: 1 };
    }
    // 6. Teachers list / workload / assignment
    if (q.includes('FROM teachers')) {
        if (q.includes('WHERE id =')) {
            const id = params[0];
            const t = mockDb.teachers.find((tc) => tc.id === id);
            if (!t)
                return { rows: [], rowCount: 0 };
            const d = mockDb.departments.find((dep) => dep.id === t.department_id);
            return { rows: [{ ...t, department_name: d ? d.name : 'Unassigned' }], rowCount: 1 };
        }
        const populated = mockDb.teachers.map((t) => {
            const user = mockDb.users.find((u) => u.id === t.id) || {};
            const d = mockDb.departments.find((dep) => dep.id === t.department_id);
            return {
                ...t,
                email: user.email,
                department_name: d ? d.name : 'Unassigned',
            };
        });
        return { rows: populated, rowCount: populated.length };
    }
    if (q.startsWith('INSERT INTO teachers')) {
        const [id, first_name, last_name, phone, department_id, qualification] = params;
        const newTeacher = { id, first_name, last_name, phone, department_id, qualification, joining_date: new Date().toISOString().split('T')[0], status: 'Active' };
        mockDb.teachers.push(newTeacher);
        return { rows: [newTeacher], rowCount: 1 };
    }
    // 7. Departments
    if (q.includes('FROM departments')) {
        const depts = mockDb.departments.map((d) => {
            const hod = mockDb.teachers.find((t) => t.id === d.hod_id);
            const studentCount = mockDb.students.filter((s) => {
                const c = mockDb.classes.find((cls) => cls.id === s.class_id);
                return c && c.department_id === d.id;
            }).length;
            const facultyCount = mockDb.teachers.filter((t) => t.department_id === d.id).length;
            return {
                ...d,
                hod_name: hod ? `${hod.first_name} ${hod.last_name}` : 'Unassigned',
                student_count: studentCount,
                faculty_count: facultyCount,
            };
        });
        return { rows: depts, rowCount: depts.length };
    }
    if (q.startsWith('INSERT INTO departments')) {
        const [name, code, hod_id] = params;
        const newDept = { id: `dept-${Date.now()}`, name, code, hod_id };
        mockDb.departments.push(newDept);
        return { rows: [newDept], rowCount: 1 };
    }
    // 8. Classes & Sections
    if (q.includes('FROM classes')) {
        return { rows: mockDb.classes, rowCount: mockDb.classes.length };
    }
    if (q.includes('FROM sections')) {
        const populated = mockDb.sections.map((s) => {
            const cls = mockDb.classes.find((c) => c.id === s.class_id);
            const advisor = mockDb.teachers.find((t) => t.id === s.advisor_id);
            return {
                ...s,
                class_name: cls ? cls.name : 'N/A',
                advisor_name: advisor ? `${advisor.first_name} ${advisor.last_name}` : 'Unassigned',
            };
        });
        return { rows: populated, rowCount: populated.length };
    }
    // 9. Subjects
    if (q.includes('FROM subjects')) {
        const populated = mockDb.subjects.map((s) => {
            const d = mockDb.departments.find((dept) => dept.id === s.department_id);
            return {
                ...s,
                department_name: d ? d.name : 'N/A',
            };
        });
        return { rows: populated, rowCount: populated.length };
    }
    // 10. Attendance & Attendance records
    if (q.includes('FROM attendance_records') || q.includes('FROM attendance')) {
        if (q.includes('attendance_records JOIN') || q.includes('JOIN attendance_records')) {
            const list = mockDb.attendance_records.map((r) => {
                const att = mockDb.attendance.find((a) => a.id === r.attendance_id) || {};
                const student = mockDb.students.find((s) => s.id === r.student_id) || {};
                const subject = mockDb.subjects.find((s) => s.id === att.subject_id);
                const cls = mockDb.classes.find((c) => c.id === att.class_id);
                const sec = mockDb.sections.find((s) => s.id === att.section_id);
                return {
                    ...r,
                    date: att.date,
                    subject_name: subject ? subject.name : 'Daily Attendance',
                    class_name: cls ? cls.name : '',
                    section_name: sec ? sec.name : '',
                    student_name: `${student.first_name} ${student.last_name}`,
                    roll_number: student.roll_number,
                };
            });
            return { rows: list, rowCount: list.length };
        }
        return { rows: mockDb.attendance, rowCount: mockDb.attendance.length };
    }
    // 11. Timetables
    if (q.includes('FROM timetables')) {
        const list = mockDb.timetables.map((t) => {
            const sub = mockDb.subjects.find((s) => s.id === t.subject_id);
            const teacher = mockDb.teachers.find((tc) => tc.id === t.teacher_id);
            const cls = mockDb.classes.find((c) => c.id === t.class_id);
            const sec = mockDb.sections.find((s) => s.id === t.section_id);
            return {
                ...t,
                subject_name: sub ? sub.name : 'N/A',
                teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unassigned',
                class_name: cls ? cls.name : 'N/A',
                section_name: sec ? sec.name : 'N/A',
            };
        });
        return { rows: list, rowCount: list.length };
    }
    // 12. Exams & Grades
    if (q.includes('FROM exams')) {
        return { rows: mockDb.exams, rowCount: mockDb.exams.length };
    }
    if (q.includes('FROM grades')) {
        const list = mockDb.grades.map((g) => {
            const student = mockDb.students.find((s) => s.id === g.student_id) || {};
            const subject = mockDb.subjects.find((s) => s.id === g.subject_id) || {};
            const exam = mockDb.exams.find((e) => e.id === g.exam_id) || {};
            return {
                ...g,
                student_name: `${student.first_name} ${student.last_name}`,
                subject_name: subject.name,
                exam_name: exam.name,
            };
        });
        return { rows: list, rowCount: list.length };
    }
    // 13. Assignments & submissions
    if (q.includes('FROM assignments')) {
        const list = mockDb.assignments.map((a) => {
            const sub = mockDb.subjects.find((s) => s.id === a.subject_id);
            const teacher = mockDb.teachers.find((t) => t.id === a.teacher_id);
            const cls = mockDb.classes.find((c) => c.id === a.class_id);
            return {
                ...a,
                subject_name: sub ? sub.name : 'N/A',
                teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'N/A',
                class_name: cls ? cls.name : 'N/A',
            };
        });
        return { rows: list, rowCount: list.length };
    }
    if (q.includes('FROM assignment_submissions')) {
        const list = mockDb.assignment_submissions.map((s) => {
            const student = mockDb.students.find((st) => st.id === s.student_id) || {};
            const assign = mockDb.assignments.find((a) => a.id === s.assignment_id) || {};
            return {
                ...s,
                student_name: `${student.first_name} ${student.last_name}`,
                assignment_title: assign.title,
                max_marks: assign.max_marks,
            };
        });
        return { rows: list, rowCount: list.length };
    }
    // 14. Fee structures & Payments
    if (q.includes('FROM fee_structures')) {
        const list = mockDb.fee_structures.map((f) => {
            const cls = mockDb.classes.find((c) => c.id === f.class_id);
            return {
                ...f,
                class_name: cls ? cls.name : 'All Classes',
            };
        });
        return { rows: list, rowCount: list.length };
    }
    if (q.includes('FROM payments')) {
        const list = mockDb.payments.map((p) => {
            const student = mockDb.students.find((s) => s.id === p.student_id) || {};
            const fee = mockDb.fee_structures.find((f) => f.id === p.fee_structure_id) || {};
            return {
                ...p,
                student_name: `${student.first_name} ${student.last_name}`,
                fee_name: fee.name,
            };
        });
        return { rows: list, rowCount: list.length };
    }
    // 15. Notifications
    if (q.includes('FROM notifications')) {
        return { rows: mockDb.notifications, rowCount: mockDb.notifications.length };
    }
    // Default fallback for any unhandled queries (empty array to avoid crashing)
    return { rows: [], rowCount: 0 };
};
