import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { config } from '../config/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Pool } = pg;
const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});
const hash = (pass) => bcrypt.hashSync(pass, 10);
async function main() {
    console.log('🚀 Starting Database Seeding on PostgreSQL...');
    try {
        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log('📄 Executing DDL Schema...');
        await pool.query(schemaSql);
        console.log('✅ Schema tables successfully created.');
        // Clear existing data (optional / safe truncate in order)
        console.log('🗑️ Cleaning up existing tables...');
        await pool.query(`
      TRUNCATE TABLE 
        notifications, timetables, payments, fee_structures, 
        assignment_submissions, assignments, grades, exams, 
        attendance_records, attendance, subjects, students, 
        sections, classes, parents, departments, teachers, 
        users, roles, academic_years CASCADE
    `);
        // Insert Roles
        console.log('🌱 Seeding Roles...');
        const roles = [
            { name: 'Admin' },
            { name: 'Principal' },
            { name: 'HOD' },
            { name: 'Teacher' },
            { name: 'Student' },
            { name: 'Parent' },
            { name: 'Accountant' }
        ];
        const roleIdMap = {};
        for (const r of roles) {
            const res = await pool.query('INSERT INTO roles (name) VALUES ($1) RETURNING id', [r.name]);
            roleIdMap[r.name] = res.rows[0].id;
        }
        // Insert Academic Years
        console.log('🌱 Seeding Academic Years...');
        const ayRes = await pool.query("INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES ('2025-2026', '2025-06-01', '2026-04-30', true) RETURNING id");
        const ayId = ayRes.rows[0].id;
        // Create Users (Admin, Principal, Accountant, Teachers, Parents, Students)
        console.log('🌱 Seeding Users & Role Identities...');
        // Admin User
        const adminUser = await pool.query('INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id', ['admin@edusync.com', hash('admin123'), roleIdMap['Admin']]);
        // Principal User
        await pool.query('INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3)', ['principal@edusync.com', hash('principal123'), roleIdMap['Principal']]);
        // Accountant User
        const accountantUser = await pool.query('INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id', ['accountant@edusync.com', hash('accountant123'), roleIdMap['Accountant']]);
        // HOD / CS Teacher
        const hodUser = await pool.query('INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id', ['hod@edusync.com', hash('hod123'), roleIdMap['HOD']]);
        // Regular Teacher
        const teacherUser = await pool.query('INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id', ['teacher@edusync.com', hash('teacher123'), roleIdMap['Teacher']]);
        // Student 1 User
        const student1User = await pool.query('INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id', ['student@edusync.com', hash('student123'), roleIdMap['Student']]);
        // Student 2 User
        const student2User = await pool.query('INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id', ['student2@edusync.com', hash('student123'), roleIdMap['Student']]);
        // Parent User
        const parentUser = await pool.query('INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id', ['parent@edusync.com', hash('parent123'), roleIdMap['Parent']]);
        // Departments
        console.log('🌱 Seeding Departments...');
        const csDept = await pool.query("INSERT INTO departments (name, code) VALUES ('Computer Science', 'CS') RETURNING id");
        const csDeptId = csDept.rows[0].id;
        const sciDept = await pool.query("INSERT INTO departments (name, code) VALUES ('Natural Science', 'SCI') RETURNING id");
        const sciDeptId = sciDept.rows[0].id;
        // Faculty Allocation & Profiles
        console.log('🌱 Seeding Teacher Profiles...');
        await pool.query("INSERT INTO teachers (id, first_name, last_name, phone, department_id, qualification) VALUES ($1, 'Sarah', 'Connor', '+1234567890', $2, 'Ph.D. in Computer Science')", [hodUser.rows[0].id, csDeptId]);
        await pool.query("UPDATE departments SET hod_id = $1 WHERE id = $2", [hodUser.rows[0].id, csDeptId]);
        await pool.query("INSERT INTO teachers (id, first_name, last_name, phone, department_id, qualification) VALUES ($1, 'Walter', 'White', '+1987654321', $2, 'M.Sc. in Chemistry')", [teacherUser.rows[0].id, sciDeptId]);
        // Parent Profiles
        console.log('🌱 Seeding Parent Profiles...');
        await pool.query("INSERT INTO parents (id, first_name, last_name, phone, occupation, address) VALUES ($1, 'John', 'Doe Senior', '+1122334455', 'Software Engineer', '123 Main St, Seattle')", [parentUser.rows[0].id]);
        // Classes & Sections
        console.log('🌱 Seeding Classes & Sections...');
        const class10 = await pool.query("INSERT INTO classes (name, department_id) VALUES ('Grade 10', $1) RETURNING id", [sciDeptId]);
        const class10Id = class10.rows[0].id;
        const class11 = await pool.query("INSERT INTO classes (name, department_id) VALUES ('Grade 11', $1) RETURNING id", [csDeptId]);
        const class11Id = class11.rows[0].id;
        const sect10A = await pool.query("INSERT INTO sections (name, class_id, room_number, advisor_id) VALUES ('A', $1, 'Room 301', $2) RETURNING id", [class10Id, teacherUser.rows[0].id]);
        const sect10AId = sect10A.rows[0].id;
        const sect11A = await pool.query("INSERT INTO sections (name, class_id, room_number, advisor_id) VALUES ('A', $1, 'Lab 1', $2) RETURNING id", [class11Id, hodUser.rows[0].id]);
        const sect11AId = sect11A.rows[0].id;
        // Student Profiles
        console.log('🌱 Seeding Student Profiles...');
        await pool.query("INSERT INTO students (id, first_name, last_name, admission_number, roll_number, class_id, section_id, parent_id, dob, gender, address) VALUES ($1, 'John', 'Doe', 'ADM-2025-001', '10', $2, $3, $4, '2010-05-15', 'Male', '123 Main St, Seattle')", [student1User.rows[0].id, class10Id, sect10AId, parentUser.rows[0].id]);
        await pool.query("INSERT INTO students (id, first_name, last_name, admission_number, roll_number, class_id, section_id, parent_id, dob, gender, address) VALUES ($1, 'Jane', 'Smith', 'ADM-2025-002', '11', $2, $3, null, '2009-11-20', 'Female', '456 Oak Ave, Boston')", [student2User.rows[0].id, class11Id, sect11AId]);
        // Subjects
        console.log('🌱 Seeding Subjects...');
        const csSubj = await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Introduction to Computer Science', 'CS101', $1, 4) RETURNING id", [csDeptId]);
        const csSubjId = csSubj.rows[0].id;
        const chemSubj = await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Organic Chemistry', 'CHEM101', $1, 3) RETURNING id", [sciDeptId]);
        const chemSubjId = chemSubj.rows[0].id;
        // Attendance
        console.log('🌱 Seeding Attendance & Attendance Records...');
        const attRes = await pool.query("INSERT INTO attendance (date, class_id, section_id, subject_id, taken_by) VALUES ('2026-06-08', $1, $2, $3, $4) RETURNING id", [class10Id, sect10AId, chemSubjId, teacherUser.rows[0].id]);
        const attId = attRes.rows[0].id;
        await pool.query("INSERT INTO attendance_records (attendance_id, student_id, status, remarks) VALUES ($1, $2, 'Present', 'On time')", [attId, student1User.rows[0].id]);
        // Exams & Grades
        console.log('🌱 Seeding Exam & Grades Records...');
        const examRes = await pool.query("INSERT INTO exams (name, class_id, academic_year_id, start_date, end_date) VALUES ('Midterm Exam', $1, $2, '2026-10-10', '2026-10-15') RETURNING id", [class10Id, ayId]);
        const examId = examRes.rows[0].id;
        await pool.query("INSERT INTO grades (exam_id, student_id, subject_id, marks_obtained, max_marks, grade_point, letter_grade, remarks) VALUES ($1, $2, $3, 88.50, 100.00, 3.70, 'A', 'Excellent performance')", [examId, student1User.rows[0].id, chemSubjId]);
        // Assignments
        console.log('🌱 Seeding Assignments & Submissions...');
        const assignRes = await pool.query("INSERT INTO assignments (title, description, subject_id, class_id, section_id, teacher_id, due_date, max_marks) VALUES ('Chemical Reactions Report', 'Write a 2-page report on organic chemical reactions.', $1, $2, $3, $4, '2026-06-15 23:59:59+00', 50.00) RETURNING id", [chemSubjId, class10Id, sect10AId, teacherUser.rows[0].id]);
        const assignId = assignRes.rows[0].id;
        await pool.query("INSERT INTO assignment_submissions (assignment_id, student_id, submission_date, file_url, status) VALUES ($1, $2, '2026-06-07 14:30:00+00', '/uploads/reactions_report.pdf', 'Submitted')", [assignId, student1User.rows[0].id]);
        // Fee Structures & Payments
        console.log('🌱 Seeding Fee Structures & Payments...');
        const fee1Res = await pool.query("INSERT INTO fee_structures (name, class_id, amount, due_date, academic_year_id) VALUES ('Tuition Fee - Grade 10', $1, 1200.00, '2026-07-01', $2) RETURNING id", [class10Id, ayId]);
        const fee1Id = fee1Res.rows[0].id;
        await pool.query("INSERT INTO fee_structures (name, class_id, amount, due_date, academic_year_id) VALUES ('Tuition Fee - Grade 11', $1, 1400.00, '2026-07-01', $2)", [class11Id, ayId]);
        await pool.query("INSERT INTO payments (student_id, fee_structure_id, amount_paid, payment_date, payment_method, transaction_reference, status) VALUES ($1, $2, 1200.00, '2026-06-05 09:00:00+00', 'Card', 'TXN-982348', 'Paid')", [student1User.rows[0].id, fee1Id]);
        // Timetables
        console.log('🌱 Seeding Timetables Scheduling...');
        await pool.query("INSERT INTO timetables (class_id, section_id, subject_id, teacher_id, day_of_week, start_time, end_time, room) VALUES ($1, $2, $3, $4, 1, '09:00:00', '10:00:00', 'Room 301')", [class10Id, sect10AId, chemSubjId, teacherUser.rows[0].id]);
        await pool.query("INSERT INTO timetables (class_id, section_id, subject_id, teacher_id, day_of_week, start_time, end_time, room) VALUES ($1, $2, $3, $4, 1, '10:15:00', '11:15:00', 'Lab 1')", [class10Id, sect10AId, csSubjId, hodUser.rows[0].id]);
        // Notifications
        console.log('🌱 Seeding Broadcast Notifications...');
        await pool.query("INSERT INTO notifications (user_id, title, message, type) VALUES (null, 'Welcome to EduSync AI', 'The new ERP system is officially online.', 'success')");
        console.log('🎉 PostgreSQL Database successfully seeded!');
    }
    catch (error) {
        console.error('❌ Error seeding PostgreSQL database:', error);
    }
    finally {
        await pool.end();
        process.exit(0);
    }
}
main();
