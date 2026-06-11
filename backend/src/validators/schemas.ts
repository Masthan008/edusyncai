import { z } from 'zod';

const idString = z.string().min(1, 'ID is required');

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const studentCreateSchema = z.object({
  body: z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    admission_number: z.string().min(1, 'Admission number is required'),
    roll_number: z.string().optional(),
    class_id: idString,
    section_id: idString,
    parent_email: z.string().email('Invalid parent email').optional().or(z.literal('')),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
    gender: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const studentUpdateSchema = z.object({
  body: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    roll_number: z.string().optional().nullable(),
    class_id: idString.optional(),
    section_id: idString.optional(),
    status: z.string().optional(),
    gender: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
  }),
});

export const teacherCreateSchema = z.object({
  body: z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().max(10, 'Phone must be 10 digits').regex(/^\d{10}$/, 'Phone must be 10 digits').optional(),
    department_id: idString.optional(),
    qualification: z.string().optional(),
  }),
});

export const teacherUpdateSchema = z.object({
  body: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional().nullable(),
    department_id: idString.optional().nullable(),
    qualification: z.string().optional().nullable(),
    status: z.string().optional(),
  }),
});

export const departmentCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Department name is required'),
    code: z.string().min(1, 'Department code is required'),
    hod_id: idString.nullable().optional(),
  }),
});

export const attendanceSubmitSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    class_id: idString,
    section_id: idString,
    subject_id: idString.optional().nullable(),
    records: z.array(
      z.object({
        student_id: idString,
        status: z.enum(['Present', 'Absent', 'Late', 'Excused']),
        remarks: z.string().max(255).optional().nullable(),
      })
    ),
  }),
});

export const examCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Exam name is required'),
    class_id: idString,
    academic_year_id: idString,
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  }),
});

export const gradesRecordSchema = z.object({
  body: z.object({
    exam_id: idString,
    student_id: idString,
    subject_id: idString,
    marks_obtained: z.number().min(0, 'Marks must be positive'),
    max_marks: z.number().min(1, 'Max marks must be at least 1'),
    remarks: z.string().optional().nullable(),
  }),
});

export const assignmentCreateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    subject_id: idString,
    class_id: idString,
    section_id: idString,
    due_date: z.string(),
    max_marks: z.number().min(1, 'Max marks must be positive'),
  }),
});

export const assignmentSubmitSchema = z.object({
  body: z.object({
    assignment_id: idString,
    file_url: z.string().url('Invalid submission file URL').optional().or(z.literal('')),
    student_notes: z.string().optional(),
  }),
});

export const gradeSubmissionSchema = z.object({
  body: z.object({
    marks_obtained: z.number().min(0, 'Marks must be positive'),
    teacher_remarks: z.string().optional().nullable(),
  }),
});

export const paymentRecordSchema = z.object({
  body: z.object({
    student_id: idString,
    fee_structure_id: idString,
    amount_paid: z.number().positive('Amount must be positive'),
    payment_method: z.string().min(1, 'Payment method is required'),
    transaction_reference: z.string().optional(),
    account_number: z.string().optional(),
    cheque_number: z.string().optional(),
  }),
});

export const feeStructureCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Fee name is required'),
    class_id: idString.optional().nullable(),
    amount: z.number().positive('Amount must be positive'),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'),
    academic_year_id: idString,
  }),
});

export const subjectCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Subject name is required'),
    code: z.string().min(1, 'Subject code is required'),
    department_id: idString,
    credits: z.number().min(1).optional().default(3),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['Admin', 'Teacher', 'Student', 'Parent', 'Accountant']),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    phone: z.string().optional().or(z.literal('')),
  }),
});
