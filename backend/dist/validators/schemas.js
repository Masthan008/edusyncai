import { z } from 'zod';
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
        class_id: z.string().uuid('Invalid class UUID'),
        section_id: z.string().uuid('Invalid section UUID'),
        parent_email: z.string().email('Invalid parent email').optional().or(z.literal('')),
        dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
        gender: z.string().optional(),
        address: z.string().optional(),
    }),
});
export const teacherCreateSchema = z.object({
    body: z.object({
        first_name: z.string().min(1, 'First name is required'),
        last_name: z.string().min(1, 'Last name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        phone: z.string().optional(),
        department_id: z.string().uuid('Invalid department UUID').optional(),
        qualification: z.string().optional(),
    }),
});
export const departmentCreateSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Department name is required'),
        code: z.string().min(1, 'Department code is required'),
        hod_id: z.string().uuid('Invalid teacher UUID for HOD').nullable().optional(),
    }),
});
export const attendanceSubmitSchema = z.object({
    body: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
        class_id: z.string().uuid('Invalid class UUID'),
        section_id: z.string().uuid('Invalid section UUID'),
        subject_id: z.string().uuid('Invalid subject UUID').optional().nullable(),
        records: z.array(z.object({
            student_id: z.string().uuid('Invalid student UUID'),
            status: z.enum(['Present', 'Absent', 'Late', 'Excused']),
            remarks: z.string().max(255).optional().nullable(),
        })),
    }),
});
export const examCreateSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Exam name is required'),
        class_id: z.string().uuid('Invalid class UUID'),
        academic_year_id: z.string().uuid('Invalid academic year UUID'),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
    }),
});
export const gradesRecordSchema = z.object({
    body: z.object({
        exam_id: z.string().uuid('Invalid exam UUID'),
        student_id: z.string().uuid('Invalid student UUID'),
        subject_id: z.string().uuid('Invalid subject UUID'),
        marks_obtained: z.number().min(0, 'Marks must be positive'),
        max_marks: z.number().min(1, 'Max marks must be at least 1'),
        remarks: z.string().optional().nullable(),
    }),
});
export const assignmentCreateSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        subject_id: z.string().uuid('Invalid subject UUID'),
        class_id: z.string().uuid('Invalid class UUID'),
        section_id: z.string().uuid('Invalid section UUID'),
        due_date: z.string(), // ISO String or similar
        max_marks: z.number().min(1, 'Max marks must be positive'),
    }),
});
export const assignmentSubmitSchema = z.object({
    body: z.object({
        assignment_id: z.string().uuid('Invalid assignment UUID'),
        file_url: z.string().url('Invalid submission file URL').optional().or(z.literal('')),
        student_notes: z.string().optional(),
    }),
});
export const paymentRecordSchema = z.object({
    body: z.object({
        student_id: z.string().uuid('Invalid student UUID'),
        fee_structure_id: z.string().uuid('Invalid fee structure UUID'),
        amount_paid: z.number().positive('Amount must be positive'),
        payment_method: z.string().min(1, 'Payment method is required'),
        transaction_reference: z.string().optional(),
    }),
});
