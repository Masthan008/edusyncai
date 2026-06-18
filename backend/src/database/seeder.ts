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

const hash = (pass: string) => bcrypt.hashSync(pass, 10);

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
        users, roles, academic_years, sops CASCADE
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
    const roleIdMap: Record<string, string> = {};
    for (const r of roles) {
      const res = await pool.query(
        'INSERT INTO roles (name) VALUES ($1) RETURNING id',
        [r.name]
      );
      roleIdMap[r.name] = res.rows[0].id;
    }

    // Insert Academic Years
    console.log('🌱 Seeding Academic Years...');
    const ayRes = await pool.query(
      "INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES ('2025-2026', '2025-06-01', '2026-04-30', true) RETURNING id"
    );
    const ayId = ayRes.rows[0].id;

    // Create Users (Admin, Principal, Accountant, Teachers, Parents, Students)
    console.log('🌱 Seeding Users & Role Identities...');
    
    // Admin User
    const adminUser = await pool.query(
      'INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id',
      ['admin@edusync.com', hash('admin123'), roleIdMap['Admin']]
    );

    // Seed Departments
    console.log('🌱 Seeding Departments...');
    const deptSciRes = await pool.query("INSERT INTO departments (name, code) VALUES ('Science Department', 'SCI') RETURNING id");
    const deptHumRes = await pool.query("INSERT INTO departments (name, code) VALUES ('Humanities Department', 'HUM') RETURNING id");
    const sciId = deptSciRes.rows[0].id;
    const humId = deptHumRes.rows[0].id;

    // Seed Classes
    console.log('🌱 Seeding Classes...');
    const cls10Res = await pool.query("INSERT INTO classes (name, department_id) VALUES ('Grade 10', $1) RETURNING id", [sciId]);
    const cls11Res = await pool.query("INSERT INTO classes (name, department_id) VALUES ('Grade 11', $1) RETURNING id", [sciId]);
    const cls12Res = await pool.query("INSERT INTO classes (name, department_id) VALUES ('Grade 12', $1) RETURNING id", [humId]);
    const cls10Id = cls10Res.rows[0].id;
    const cls11Id = cls11Res.rows[0].id;
    const cls12Id = cls12Res.rows[0].id;

    // Seed Sections
    console.log('🌱 Seeding Sections...');
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('A', $1, 'Room 101')", [cls10Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('B', $1, 'Room 102')", [cls10Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('C', $1, 'Room 103')", [cls10Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('D', $1, 'Room 104')", [cls10Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('A', $1, 'Room 201')", [cls11Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('B', $1, 'Room 202')", [cls11Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('C', $1, 'Room 203')", [cls11Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('A', $1, 'Room 301')", [cls12Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('B', $1, 'Room 302')", [cls12Id]);

    // Seed Subjects
    console.log('🌱 Seeding Subjects...');
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Mathematics', 'MATH-101', $1, 4)", [sciId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Organic Chemistry', 'CHEM-101', $1, 3)", [sciId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Physics', 'PHYS-101', $1, 3)", [sciId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Biology', 'BIOL-101', $1, 3)", [sciId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('English Literature', 'ENGL-101', $1, 2)", [humId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Computer Science', 'COSC-101', $1, 4)", [sciId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('History', 'HIST-101', $1, 3)", [humId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Geography', 'GEOG-101', $1, 3)", [humId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Economics', 'ECON-101', $1, 3)", [humId]);

    // Seed SOPs
    console.log('🌱 Seeding Standard Operating Procedures (SOPs)...');
    const sops = [
      {
        title: 'Student Enrollment Checklist',
        category: 'Admissions',
        description: 'Standard workflow steps to process and enroll a new student candidate into the academy.',
        steps: JSON.stringify([
          { step: 1, title: 'Application Submission', description: "Parent submits the online application form and child's birth certificate/transcripts.", role: 'Parent' },
          { step: 2, title: 'Document Verification', description: 'Registrar reviews papers and assigns an entry assessment date.', role: 'Admin' },
          { step: 3, title: 'Academic Assessment', description: 'Student candidate completes the entry test or academic interview.', role: 'Student' },
          { step: 4, title: 'Board Approval', description: 'Admissions committee approves or rejects the candidate, generating the official offer letter.', role: 'Admin' },
          { step: 5, title: 'ERP Setup & Billing', description: 'Administrator registers details in the ERP and generates tuition billing records.', role: 'Admin' }
        ]),
        title_ar: 'قائمة التحقق من تسجيل الطلاب',
        description_ar: 'خطوات سير العمل الموحدة لمعالجة وتسجيل مرشح طالب جديد في الأكاديمية.',
        steps_ar: JSON.stringify([
          { step: 1, title: 'تقديم الطلب', description: 'يقدم ولي الأمر نموذج الطلب عبر الإنترنت وشهادة ميلاد الطفل/كشوف الدرجات.', role: 'Parent' },
          { step: 2, title: 'التحقق من الوثائق', description: 'يراجع مسجل البيانات الأوراق ويحدد تاريخ تقييم الدخول.', role: 'Admin' },
          { step: 3, title: 'التقييم الأكاديمي', description: 'يكمل المرشح الطالب اختبار الدخول أو المقابلة الأكاديمية.', role: 'Student' },
          { step: 4, title: 'موافقة مجلس الإدارة', description: 'توافق لجنة القبول أو ترفض المرشح، مع توليد خطاب العرض الرسمي.', role: 'Admin' },
          { step: 5, title: 'إعداد نظام تخطيط موارد المؤسسات والفوترة', description: 'يسجل المسؤول التفاصيل في نظام إدارة المؤسسة ويقوم بإنشاء سجلات فوترة الرسوم الدراسية.', role: 'Admin' }
        ]),
        created_by: adminUser.rows[0].id
      },
      {
        title: 'Exam Grading & Progression',
        category: 'Academics',
        description: 'Operational workflow for preparing exams, entering student grades, and publishing report cards.',
        steps: JSON.stringify([
          { step: 1, title: 'Setup Grading Weights', description: 'Subject teacher creates the exam schedule and structures the grading parameters.', role: 'Teacher' },
          { step: 2, title: 'Conduct Exams', description: 'Invigilators supervise assessment sessions and enforce compliance rules.', role: 'Teacher' },
          { step: 3, title: 'Grade Entries', description: 'Teachers grade papers and log marks into the ERP within 7 days of the exam.', role: 'Teacher' },
          { step: 4, title: 'HOD Review & Lock', description: 'Head of Department reviews and locks grades for all department subjects.', role: 'HOD' },
          { step: 5, title: 'Report Card Release', description: 'Registrar publishes final report cards to Student and Parent portals.', role: 'Admin' }
        ]),
        title_ar: 'درجات الاختبار والتقدم',
        description_ar: 'سير العمل التشغيلي لإعداد الامتحانات وإدخال درجات الطلاب ونشر الشهادات الدراسية.',
        steps_ar: JSON.stringify([
          { step: 1, title: 'إعداد أوزان الدرجات', description: 'يقوم معلم المادة بإنشاء جدول الامتحانات وتحديد معايير الدرجات.', role: 'Teacher' },
          { step: 2, title: 'إجراء الامتحانات', description: 'يشرف المراقبون على جلسات التقييم ويفرضون قواعد الامتثال.', role: 'Teacher' },
          { step: 3, title: 'رصد الدرجات', description: 'يقوم المعلمون بتصحيح الأوراق ورصد الدرجات في النظام خلال 7 أيام من الامتحان.', role: 'Teacher' },
          { step: 4, title: 'مراجعة وقفل رئيس القسم', description: 'يراجع رئيس القسم الدرجات ويقفلها لجميع مواد القسم.', role: 'HOD' },
          { step: 5, title: 'إصدار الشهادة', description: 'ينشر مسجل البيانات الشهادات الدراسية النهائية في بوابات الطلاب وأولياء الأمور.', role: 'Admin' }
        ]),
        created_by: adminUser.rows[0].id
      },
      {
        title: 'Tuition Billing & Reminders',
        category: 'Finance',
        description: 'Instructions for billing fees, recording payments, and sending invoice reminders.',
        steps: JSON.stringify([
          { step: 1, title: 'Fee Template Setup', description: 'Accountant schedules fee structures at the start of the academic year.', role: 'Accountant' },
          { step: 2, title: 'Invoice Dispatch', description: 'ERP system automatically issues digital invoices and bills parents.', role: 'Admin' },
          { step: 3, title: 'Payment Submission', description: 'Parents execute online payment or submit bank transfer details.', role: 'Parent' },
          { step: 4, title: 'Reconciliation & Receipt', description: 'Accountant reviews bank transfer references, verifies payment, and generates receipts.', role: 'Accountant' },
          { step: 5, title: 'Delinquency Reminders', description: 'System initiates automated payment reminders after the fee grace period.', role: 'Admin' }
        ]),
        title_ar: 'فوترة الرسوم الدراسية والتذكيرات',
        description_ar: 'تعليمات لفوترة الرسوم، وتسجيل المدفوعات، وإرسال تذكيرات الفواتير.',
        steps_ar: JSON.stringify([
          { step: 1, title: 'إعداد نموذج الرسوم', description: 'يحدد المحاسب هياكل الرسوم في بداية العام الدراسي.', role: 'Accountant' },
          { step: 2, title: 'إرسال الفواتير', description: 'يصدر النظام تلقائيًا فواتير رقمية ويحاسب أولياء الأمور.', role: 'Admin' },
          { step: 3, title: 'تقديم الدفع', description: 'يقوم أولياء الأمور بالدفع عبر الإنترنت أو تقديم تفاصيل التحويل المصرفي.', role: 'Parent' },
          { step: 4, title: 'المطابقة والإيصال', description: 'يراجع المحاسب مراجع التحويل مصرفي، ويتحقق من الدفع، وينشئ الإيصالات.', role: 'Accountant' },
          { step: 5, title: 'تذكيرات المتأخرات', description: 'يبدأ النظام تذكيرات دفع تلقائية بعد فترة السماح للرسوم.', role: 'Admin' }
        ]),
        created_by: adminUser.rows[0].id
      },
      {
        title: 'ERP Backup & Server Deployment',
        category: 'Operations',
        description: 'IT procedure for validating and compiling code, taking database backups, and deploying server builds.',
        steps: JSON.stringify([
          { step: 1, title: 'Code Integrity Test', description: 'Developers test updates and run backend/frontend compile checks.', role: 'Admin' },
          { step: 2, title: 'Database Dump', description: 'Operator runs automated pg_dump scripts for nightly database backup.', role: 'Admin' },
          { step: 3, title: 'Build Deployment', description: 'Push code to GitHub main branch to trigger CI/CD pipeline building processes.', role: 'Admin' },
          { step: 4, title: 'Smoke Testing', description: 'Systems Administrator executes automated tests to confirm login and route latency.', role: 'Admin' }
        ]),
        title_ar: 'نسخ نظام ERP احتياطيًا ونشر الخادم',
        description_ar: 'إجراء تكنولوجيا المعلومات للتحقق من الكود وتجميعه، وأخذ نسخ احتياطية لقاعدة البيانات، ونشر إصدارات الخادم.',
        steps_ar: JSON.stringify([
          { step: 1, title: 'اختبار سلامة الكود', description: 'يختبر المطورون التحديثات ويديرون فحوصات تجميع الواجهة الخلفية والأمامية.', role: 'Admin' },
          { step: 2, title: 'نسخ قاعدة البيانات', description: 'يقوم المشغل بتشغيل نصوص pg_dump التلقائية للنسخ الاحتياطي اليومي لقاعدة البيانات.', role: 'Admin' },
          { step: 3, title: 'نشر الإصدار', description: 'دفع الكود إلى فرع GitHub الرئيسي لبدء عمليات بناء خط أنابيب CI/CD.', role: 'Admin' },
          { step: 4, title: 'اختبار الدخان / الفحص الأولي', description: 'ينفذ مسؤول الأنظمة اختبارات تلقائية لتأكيد الدخول وزمن استجابة المسار.', role: 'Admin' }
        ]),
        created_by: adminUser.rows[0].id
      }
    ];

    for (const sop of sops) {
      await pool.query(
        'INSERT INTO sops (title, category, description, steps, created_by, title_ar, description_ar, steps_ar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [sop.title, sop.category, sop.description, sop.steps, sop.created_by, sop.title_ar, sop.description_ar, sop.steps_ar]
      );
    }

    console.log('🎉 PostgreSQL Database successfully seeded with baseline roles, Admin user, departments, classes, sections, subjects, and SOPs!');
  } catch (error) {
    console.error('❌ Error seeding PostgreSQL database:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
