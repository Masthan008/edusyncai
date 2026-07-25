import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'ar';

interface LanguageState {
  language: Language;
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & Common
    app_title: 'EduSync AI',
    dashboard: 'Dashboard',
    students: 'Students Directory',
    teachers: 'Faculty Directory',
    departments: 'Departments',
    attendance: 'Attendance Register',
    exams_grades: 'Exams & GPA Calculator',
    assignments: 'Homework & Assignments',
    tuition_fees: 'Tuition Fees Ledger',
    timetables: 'Timetable Schedule',
    sops: 'SOP Guidelines',
    ai_assistant: 'AI Assistant',
    transport: 'Transport Fleet',
    hostel: 'Hostels & Rooms',
    library: 'Library LMS',
    notifications: 'Notifications',
    logout: 'Sign Out',
    role: 'Role',
    language: 'Language',
    english: 'English 🇬🇧',
    arabic: 'العربية 🇸🇦',
    welcome: 'Welcome back',
    overview: 'Operational Overview & AI Intelligence',
    search_placeholder: 'Search records by name, ID, or code...',
    actions: 'Actions',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save Changes',
    edit: 'Edit',
    delete: 'Delete',
    add_new: 'Add New',
    view_details: 'View Details',
    clear_all: 'Clear All',
    no_records: 'No records found.',
    print_voucher: 'Print Receipt Voucher',
    export_pdf: 'Export PDF Report',

    // Table Headers & Labels
    first_name: 'First Name',
    last_name: 'Last Name',
    email: 'Email Address',
    admission_no: 'Admission No.',
    class_name: 'Grade Class',
    section_name: 'Section',
    phone: 'Phone Number',
    department: 'Department',
    due_date: 'Due Date',
    amount: 'Amount',
    paid_amount: 'Paid Amount',
    balance: 'Balance Dues',
    subject: 'Subject',
    credits: 'Credits',
    grade: 'Letter Grade',
    gpa: 'GPA Points',

    // Stats
    total_students: 'Total Enrolled Students',
    active_faculty: 'Active Faculty Members',
    academic_depts: 'Academic Departments',
    attendance_rate: 'Daily Attendance Rate',
    total_revenue: 'Total Tuition Collected',
    ai_tutor_help: 'EduSync AI Academic Tutor',
    sop_guidelines: 'Institutional SOP Guidelines',
    
    // Quick Actions
    admit_student: 'Admit Student',
    add_teacher: 'Add Faculty',
    create_dept: 'Create Dept',
    schedule_exam: 'Schedule Exam',
    post_announcement: 'Post Notice',
    log_payment: 'Log Payment',

    // Role Names
    role_admin: 'System Administrator',
    role_principal: 'Principal Executive',
    role_hod: 'Head of Department',
    role_teacher: 'Faculty Teacher',
    role_student: 'Enrolled Student',
    role_parent: 'Parent / Guardian',
    role_accountant: 'Campus Accountant',

    // SOP Section
    sop_title: 'Standard Operating Procedures (SOPs)',
    sop_subtitle: 'Bilingual Institutional Operational Workflows & Policies',
    sop_step: 'Step',
    translate_ar: 'Translate to Arabic via AI',
    translated_success: 'SOP successfully translated into Arabic!',
  },
  ar: {
    // Navigation & Common
    app_title: 'إيدوسينك الذكي',
    dashboard: 'لوحة التحكم',
    students: 'دليل الطلاب',
    teachers: 'أعضاء هيئة التدريس',
    departments: 'الأقسام الأكاديمية',
    attendance: 'سجل الحضور والغياب',
    exams_grades: 'الامتحانات وحساب GPA',
    assignments: 'الواجبات والمهام',
    tuition_fees: 'دفتر الرسوم الدراسية',
    timetables: 'جدول الحصص والمحاضرات',
    sops: 'إجراءات العمل المعيارية (SOP)',
    ai_assistant: 'المساعد الذكي',
    transport: 'حافلات النقل المدرسي',
    hostel: 'السكن الطلابي والغرف',
    library: 'المكتبة المركزية LMS',
    notifications: 'الإشعارات والتنبيهات',
    logout: 'تسجيل الخروج',
    role: 'الدور الوظيفي',
    language: 'اللغة',
    english: 'English 🇬🇧',
    arabic: 'العربية 🇸🇦',
    welcome: 'مرحباً بك مجدداً',
    overview: 'النظرة العامة والذكاء الاصطناعي',
    search_placeholder: 'بحث في السجلات بالاسم أو الرقم...',
    actions: 'الإجراءات',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    submit: 'إرسال البيانات',
    cancel: 'إلغاء',
    save: 'حفظ التغييرات',
    edit: 'تعديل',
    delete: 'حذف',
    add_new: 'إضافة جديد',
    view_details: 'عرض التفاصيل',
    clear_all: 'مسح الكل',
    no_records: 'لا توجد سجلات حالياً.',
    print_voucher: 'طباعة إيصال السداد',
    export_pdf: 'تصدير تقرير PDF',

    // Table Headers & Labels
    first_name: 'الاسم الأول',
    last_name: 'الاسم الأخير',
    email: 'البريد الإلكتروني',
    admission_no: 'رقم القبول',
    class_name: 'الصف الدراسي',
    section_name: 'الشعبة / الفصل',
    phone: 'رقم الهاتف',
    department: 'القسم الأكاديمي',
    due_date: 'تاريخ الاستحقاق',
    amount: 'المبلغ',
    paid_amount: 'المبلغ المدفوع',
    balance: 'المبلغ المتبقي',
    subject: 'المادة الدراسية',
    credits: 'الساعات المعتمدة',
    grade: 'التقدير / الحرف',
    gpa: 'نقاط المعدل التراكمي',

    // Stats
    total_students: 'إجمالي الطلاب المسجلين',
    active_faculty: 'أعضاء هيئة التدريس',
    academic_depts: 'الأقسام الأكاديمية',
    attendance_rate: 'نسبة الحضور اليومي',
    total_revenue: 'إجمالي الرسوم المحصلة',
    ai_tutor_help: 'معلم الذكاء الاصطناعي الأكاديمي',
    sop_guidelines: 'سياسات وإجراءات العمل',
    
    // Quick Actions
    admit_student: 'قبول طالب جديد',
    add_teacher: 'إضافة معلم',
    create_dept: 'إنشاء قسم',
    schedule_exam: 'جدولة امتحان',
    post_announcement: 'نشر إعلان',
    log_payment: 'تسجيل دفع',

    // Role Names
    role_admin: 'مدير النظام',
    role_principal: 'المدير التنفيذي',
    role_hod: 'رئيس القسم الأكاديمي',
    role_teacher: 'معلم المادة',
    role_student: 'طالب مقيد',
    role_parent: 'ولي الأمر',
    role_accountant: 'المحاسب المالي',

    // SOP Section
    sop_title: 'إجراءات التشغيل القياسية (SOP)',
    sop_subtitle: 'سياسات ودليل العمل المؤسسي ثنائي اللغة',
    sop_step: 'الخطوة',
    translate_ar: 'ترجمة إلى العربية بالذكاء الاصطناعي',
    translated_success: 'تمت ترجمة إجراء التشغيل إلى العربية بنجاح!',
  }
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      dir: 'ltr',
      setLanguage: (lang: Language) => {
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
        set({ language: lang, dir });
      },
      toggleLanguage: () => {
        const nextLang: Language = get().language === 'en' ? 'ar' : 'en';
        const dir = nextLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = nextLang;
        set({ language: nextLang, dir });
      },
      t: (key: string) => {
        const lang = get().language;
        return translations[lang]?.[key] || translations.en[key] || key;
      }
    }),
    {
      name: 'edusync_language',
    }
  )
);
