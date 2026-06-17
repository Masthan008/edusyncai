import pg from 'pg';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

const { Pool } = pg;

// Connection Pool
export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

let isPostgresConnected = false;
let useMock = false;

// Attempt initial database connection to check availability
pool.connect((err, client, release) => {
  if (err) {
    console.warn('⚠️ PostgreSQL connection failed. Falling back to IN-MEMORY Mock Database.');
    console.warn(`Error detail: ${err.message}`);
    useMock = true;
  } else {
    console.log('✅ Connected to PostgreSQL Database successfully.');
    isPostgresConnected = true;
    release();
  }
});

// Helper for passwords
const hash = (pass: string) => bcrypt.hashSync(pass, 10);

// In-Memory Data Store (Fallback)
export const mockDb: any = {
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
  ],
  academic_years: [
    { id: 'ay-1', name: '2025-2026', start_date: '2025-06-01', end_date: '2026-04-30', is_current: true },
  ],
  departments: [
    { id: 'dept-sci', name: 'Science Department', code: 'SCI', hod_id: null },
    { id: 'dept-hum', name: 'Humanities Department', code: 'HUM', hod_id: null },
  ],
  teachers: [],
  parents: [],
  classes: [
    { id: 'class-10', name: 'Grade 10', department_id: 'dept-sci' },
    { id: 'class-11', name: 'Grade 11', department_id: 'dept-sci' },
  ],
  sections: [
    { id: 'sec-10a', name: 'A', class_id: 'class-10', room_number: 'Room 101', advisor_id: null },
    { id: 'sec-10b', name: 'B', class_id: 'class-10', room_number: 'Room 102', advisor_id: null },
    { id: 'sec-11a', name: 'A', class_id: 'class-11', room_number: 'Room 201', advisor_id: null },
  ],
  students: [],
  subjects: [
    { id: 'sub-math', name: 'Mathematics', code: 'MATH-101', department_id: 'dept-sci', credits: 4 },
    { id: 'sub-chem', name: 'Organic Chemistry', code: 'CHEM-101', department_id: 'dept-sci', credits: 3 },
    { id: 'sub-phys', name: 'Physics', code: 'PHYS-101', department_id: 'dept-sci', credits: 3 },
    { id: 'sub-biol', name: 'Biology', code: 'BIOL-101', department_id: 'dept-sci', credits: 3 },
    { id: 'sub-engl', name: 'English Literature', code: 'ENGL-101', department_id: 'dept-hum', credits: 2 },
    { id: 'sub-cosc', name: 'Computer Science', code: 'COSC-101', department_id: 'dept-sci', credits: 4 },
  ],
  attendance: [],
  attendance_records: [],
  exams: [],
  grades: [],
  assignments: [],
  assignment_submissions: [],
  fee_structures: [],
  payments: [],
  timetables: [],
  notifications: [],
  sops: [
    {
      id: 'sop-enrollment',
      title: 'Student Enrollment Checklist',
      category: 'Admissions',
      description: 'Standard workflow steps to process and enroll a new student candidate into the academy.',
      steps: [
        { step: 1, title: 'Application Submission', description: "Parent submits the online application form and child's birth certificate/transcripts.", role: 'Parent' },
        { step: 2, title: 'Document Verification', description: 'Registrar reviews papers and assigns an entry assessment date.', role: 'Admin' },
        { step: 3, title: 'Academic Assessment', description: 'Student candidate completes the entry test or academic interview.', role: 'Student' },
        { step: 4, title: 'Board Approval', description: 'Admissions committee approves or rejects the candidate, generating the official offer letter.', role: 'Admin' },
        { step: 5, title: 'ERP Setup & Billing', description: 'Administrator registers details in the ERP and generates tuition billing records.', role: 'Admin' }
      ],
      created_by: 'user-admin-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sop-grading',
      title: 'Exam Grading & Progression',
      category: 'Academics',
      description: 'Operational workflow for preparing exams, entering student grades, and publishing report cards.',
      steps: [
        { step: 1, title: 'Setup Grading Weights', description: 'Subject teacher creates the exam schedule and structures the grading parameters.', role: 'Teacher' },
        { step: 2, title: 'Conduct Exams', description: 'Invigilators supervise assessment sessions and enforce compliance rules.', role: 'Teacher' },
        { step: 3, title: 'Grade Entries', description: 'Teachers grade papers and log marks into the ERP within 7 days of the exam.', role: 'Teacher' },
        { step: 4, title: 'HOD Review & Lock', description: 'Head of Department reviews and locks grades for all department subjects.', role: 'HOD' },
        { step: 5, title: 'Report Card Release', description: 'Registrar publishes final report cards to Student and Parent portals.', role: 'Admin' }
      ],
      created_by: 'user-admin-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sop-billing',
      title: 'Tuition Billing & Reminders',
      category: 'Finance',
      description: 'Instructions for billing fees, recording payments, and sending invoice reminders.',
      steps: [
        { step: 1, title: 'Fee Template Setup', description: 'Accountant schedules fee structures at the start of the academic year.', role: 'Accountant' },
        { step: 2, title: 'Invoice Dispatch', description: 'ERP system automatically issues digital invoices and bills parents.', role: 'Admin' },
        { step: 3, title: 'Payment Submission', description: 'Parents execute online payment or submit bank transfer details.', role: 'Parent' },
        { step: 4, title: 'Reconciliation & Receipt', description: 'Accountant reviews bank transfer references, verifies payment, and generates receipts.', role: 'Accountant' },
        { step: 5, title: 'Delinquency Reminders', description: 'System initiates automated payment reminders after the fee grace period.', role: 'Admin' }
      ],
      created_by: 'user-admin-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sop-deployment',
      title: 'ERP Backup & Server Deployment',
      category: 'Operations',
      description: 'IT procedure for validating and compiling code, taking database backups, and deploying server builds.',
      steps: [
        { step: 1, title: 'Code Integrity Test', description: 'Developers test updates and run backend/frontend compile checks.', role: 'Admin' },
        { step: 2, title: 'Database Dump', description: 'Operator runs automated pg_dump scripts for nightly database backup.', role: 'Admin' },
        { step: 3, title: 'Build Deployment', description: 'Push code to GitHub main branch to trigger CI/CD pipeline building processes.', role: 'Admin' },
        { step: 4, title: 'Smoke Testing', description: 'Systems Administrator executes automated tests to confirm login and route latency.', role: 'Admin' }
      ],
      created_by: 'user-admin-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Generic query router for mock database (simulating PostgreSQL query responses)
export const query = async (text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> => {
  if (!useMock) {
    try {
      const res = await pool.query(text, params);
      return { rows: res.rows, rowCount: res.rowCount || 0 };
    } catch (err: any) {
      console.error('SQL Execution Error, falling back to mock routing:', err.message);
      // Fall through to mock DB if SQL server goes down
    }
  }

  // Normalize query space for simple regex matching
  const q = text.replace(/\s+/g, ' ').trim();

  // 1. Auth: Find user with email and join role name
  if (q.includes('FROM users') && q.includes('WHERE email =')) {
    const email = params[0];
    const user = mockDb.users.find((u: any) => u.email === email);
    if (!user) return { rows: [], rowCount: 0 };
    const role = mockDb.roles.find((r: any) => r.id === user.role_id);
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
  if (q.includes('FROM users') && q.includes('WHERE id =')) {
    const id = params[0];
    const user = mockDb.users.find((u: any) => u.id === id);
    if (!user) return { rows: [], rowCount: 0 };
    const role = mockDb.roles.find((r: any) => r.id === user.role_id);
    return {
      rows: [{ ...user, role_name: role ? role.name : 'Student' }],
      rowCount: 1,
    };
  }

  // 4. Students list or details
  if (q.includes('FROM students')) {
    if (q.includes('WHERE id =')) {
      const id = params[0];
      const s = mockDb.students.find((std: any) => std.id === id);
      if (!s) return { rows: [], rowCount: 0 };
      const user = mockDb.users.find((u: any) => u.id === s.id) || {};
      const cls = mockDb.classes.find((c: any) => c.id === s.class_id);
      const sect = mockDb.sections.find((sec: any) => sec.id === s.section_id);
      const parent = mockDb.parents.find((p: any) => p.id === s.parent_id);
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
    const populated = mockDb.students.map((s: any) => {
      const user = mockDb.users.find((u: any) => u.id === s.id) || {};
      const cls = mockDb.classes.find((c: any) => c.id === s.class_id);
      const sect = mockDb.sections.find((sec: any) => sec.id === s.section_id);
      const parent = mockDb.parents.find((p: any) => p.id === s.parent_id);
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
    let id, first_name, last_name, admission_number, roll_number, class_id, section_id, parent_id, dob, gender, address;
    if (params.length === 5) {
      [id, first_name, last_name, admission_number, dob] = params;
    } else {
      [id, first_name, last_name, admission_number, roll_number, class_id, section_id, parent_id, dob, gender, address] = params;
    }
    const newStudent = { 
      id, first_name, last_name, admission_number, 
      roll_number: roll_number || null, 
      class_id: class_id || null, 
      section_id: section_id || null, 
      parent_id: parent_id || null, 
      dob: dob || '2000-01-01', 
      gender: gender || null, 
      address: address || null, 
      admission_date: new Date().toISOString().split('T')[0], 
      status: 'Active' 
    };
    mockDb.students.push(newStudent);
    return { rows: [newStudent], rowCount: 1 };
  }

  // 6. Teachers list / workload / assignment
  if (q.includes('FROM teachers')) {
    if (q.includes('WHERE id =')) {
      const id = params[0];
      const t = mockDb.teachers.find((tc: any) => tc.id === id);
      if (!t) return { rows: [], rowCount: 0 };
      const d = mockDb.departments.find((dep: any) => dep.id === t.department_id);
      return { rows: [{ ...t, department_name: d ? d.name : 'Unassigned' }], rowCount: 1 };
    }
    const populated = mockDb.teachers.map((t: any) => {
      const user = mockDb.users.find((u: any) => u.id === t.id) || {};
      const d = mockDb.departments.find((dep: any) => dep.id === t.department_id);
      return {
        ...t,
        email: user.email,
        department_name: d ? d.name : 'Unassigned',
      };
    });
    return { rows: populated, rowCount: populated.length };
  }

  if (q.startsWith('INSERT INTO teachers')) {
    let id, first_name, last_name, phone, department_id, qualification;
    if (params.length === 4) {
      [id, first_name, last_name, phone] = params;
    } else {
      [id, first_name, last_name, phone, department_id, qualification] = params;
    }
    const newTeacher = { 
      id, first_name, last_name, 
      phone: phone || null, 
      department_id: department_id || null, 
      qualification: qualification || null, 
      joining_date: new Date().toISOString().split('T')[0], 
      status: 'Active' 
    };
    mockDb.teachers.push(newTeacher);
    return { rows: [newTeacher], rowCount: 1 };
  }

  if (q.startsWith('INSERT INTO parents')) {
    const [id, first_name, last_name, phone] = params;
    const newParent = { id, first_name, last_name, phone, occupation: null, address: null };
    mockDb.parents.push(newParent);
    return { rows: [newParent], rowCount: 1 };
  }

  // 7. Departments
  if (q.includes('FROM departments')) {
    const depts = mockDb.departments.map((d: any) => {
      const hod = mockDb.teachers.find((t: any) => t.id === d.hod_id);
      const studentCount = mockDb.students.filter((s: any) => {
        const c = mockDb.classes.find((cls: any) => cls.id === s.class_id);
        return c && c.department_id === d.id;
      }).length;
      const facultyCount = mockDb.teachers.filter((t: any) => t.department_id === d.id).length;
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
    const populated = mockDb.sections.map((s: any) => {
      const cls = mockDb.classes.find((c: any) => c.id === s.class_id);
      const advisor = mockDb.teachers.find((t: any) => t.id === s.advisor_id);
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
    const populated = mockDb.subjects.map((s: any) => {
      const d = mockDb.departments.find((dept: any) => dept.id === s.department_id);
      return {
        ...s,
        department_name: d ? d.name : 'N/A',
      };
    });
    return { rows: populated, rowCount: populated.length };
  }

  if (q.startsWith('INSERT INTO subjects')) {
    const [name, code, department_id, credits] = params;
    const existing = mockDb.subjects.find((s: any) => s.code === code);
    if (existing) {
      const err = new Error('Subject code must be unique.') as any;
      err.code = '23505';
      throw err;
    }
    const newSubject = { 
      id: `sub-${Date.now()}`, 
      name, 
      code, 
      department_id, 
      credits: credits || 3 
    };
    mockDb.subjects.push(newSubject);
    return { rows: [newSubject], rowCount: 1 };
  }


  // 10. Attendance & Attendance records
  if (q.includes('FROM attendance_records') || q.includes('FROM attendance')) {
    if (q.includes('attendance_records JOIN') || q.includes('JOIN attendance_records')) {
      const list = mockDb.attendance_records.map((r: any) => {
        const att = mockDb.attendance.find((a: any) => a.id === r.attendance_id) || {};
        const student = mockDb.students.find((s: any) => s.id === r.student_id) || {};
        const subject = mockDb.subjects.find((s: any) => s.id === att.subject_id);
        const cls = mockDb.classes.find((c: any) => c.id === att.class_id);
        const sec = mockDb.sections.find((s: any) => s.id === att.section_id);
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
    const list = mockDb.timetables.map((t: any) => {
      const sub = mockDb.subjects.find((s: any) => s.id === t.subject_id);
      const teacher = mockDb.teachers.find((tc: any) => tc.id === t.teacher_id);
      const cls = mockDb.classes.find((c: any) => c.id === t.class_id);
      const sec = mockDb.sections.find((s: any) => s.id === t.section_id);
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
    const list = mockDb.grades.map((g: any) => {
      const student = mockDb.students.find((s: any) => s.id === g.student_id) || {};
      const subject = mockDb.subjects.find((s: any) => s.id === g.subject_id) || {};
      const exam = mockDb.exams.find((e: any) => e.id === g.exam_id) || {};
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
    const list = mockDb.assignments.map((a: any) => {
      const sub = mockDb.subjects.find((s: any) => s.id === a.subject_id);
      const teacher = mockDb.teachers.find((t: any) => t.id === a.teacher_id);
      const cls = mockDb.classes.find((c: any) => c.id === a.class_id);
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
    const list = mockDb.assignment_submissions.map((s: any) => {
      const student = mockDb.students.find((st: any) => st.id === s.student_id) || {};
      const assign = mockDb.assignments.find((a: any) => a.id === s.assignment_id) || {};
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
    const list = mockDb.fee_structures.map((f: any) => {
      const cls = mockDb.classes.find((c: any) => c.id === f.class_id);
      return {
        ...f,
        class_name: cls ? cls.name : 'All Classes',
      };
    });
    return { rows: list, rowCount: list.length };
  }

  if (q.includes('FROM payments')) {
    const list = mockDb.payments.map((p: any) => {
      const student = mockDb.students.find((s: any) => s.id === p.student_id) || {};
      const fee = mockDb.fee_structures.find((f: any) => f.id === p.fee_structure_id) || {};
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

  // 16. SOPs (Standard Operating Procedures)
  if (q.includes('FROM sops')) {
    if (q.includes('WHERE id =')) {
      const id = params[0];
      const sop = mockDb.sops.find((s: any) => s.id === id);
      return { rows: sop ? [sop] : [], rowCount: sop ? 1 : 0 };
    }
    return { rows: mockDb.sops, rowCount: mockDb.sops.length };
  }

  if (q.startsWith('INSERT INTO sops')) {
    const [title, category, description, steps, created_by] = params;
    const newSop = {
      id: `sop-${Date.now()}`,
      title,
      category,
      description: description || null,
      steps: typeof steps === 'string' ? JSON.parse(steps) : steps,
      created_by: created_by || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockDb.sops.push(newSop);
    return { rows: [newSop], rowCount: 1 };
  }

  if (q.startsWith('UPDATE sops')) {
    const id = params[params.length - 1];
    const index = mockDb.sops.findIndex((s: any) => s.id === id);
    if (index === -1) {
      return { rows: [], rowCount: 0 };
    }
    const [title, category, description, steps] = params;
    mockDb.sops[index] = {
      ...mockDb.sops[index],
      title: title !== undefined ? title : mockDb.sops[index].title,
      category: category !== undefined ? category : mockDb.sops[index].category,
      description: description !== undefined ? description : mockDb.sops[index].description,
      steps: steps !== undefined ? (typeof steps === 'string' ? JSON.parse(steps) : steps) : mockDb.sops[index].steps,
      updated_at: new Date().toISOString()
    };
    return { rows: [mockDb.sops[index]], rowCount: 1 };
  }

  if (q.startsWith('DELETE FROM sops')) {
    const id = params[0];
    const index = mockDb.sops.findIndex((s: any) => s.id === id);
    if (index !== -1) {
      mockDb.sops.splice(index, 1);
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Default fallback for any unhandled queries (empty array to avoid crashing)
  return { rows: [], rowCount: 0 };
};
