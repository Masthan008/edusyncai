import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';

export const getInstitutionOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentsCountRes = await query("SELECT COUNT(*)::int as count FROM students WHERE status = 'Active'");
    const teachersCountRes = await query("SELECT COUNT(*)::int as count FROM teachers WHERE status = 'Active'");
    const deptCountRes = await query('SELECT COUNT(*)::int as count FROM departments');
    
    const revenueRes = await query(
      "SELECT SUM(amount_paid) as total_revenue FROM payments WHERE status = 'Paid'"
    );

    // Fetch monthly revenue breakdown for chart (e.g., past 6 months)
    const revenueTrendRes = await query(
      `SELECT TO_CHAR(payment_date, 'Mon YYYY') as month, 
              SUM(amount_paid)::numeric as amount
       FROM payments 
       WHERE status = 'Paid'
       GROUP BY TO_CHAR(payment_date, 'Mon YYYY'), DATE_TRUNC('month', payment_date)
       ORDER BY DATE_TRUNC('month', payment_date) ASC`
    );

    // Fallback/Sample chart values if payments database is empty
    const revenueTrends = revenueTrendRes.rows.length > 0 
      ? revenueTrendRes.rows.map((r: any) => ({ name: r.month, value: parseFloat(r.amount) }))
      : [
          { name: 'Jan', value: 4000 },
          { name: 'Feb', value: 3000 },
          { name: 'Mar', value: 2000 },
          { name: 'Apr', value: 2780 },
          { name: 'May', value: 1890 },
          { name: 'Jun', value: 8390 },
        ];

    // Attendance stats
    const attendanceStats = [
      { name: 'Present', value: 88 },
      { name: 'Absent', value: 6 },
      { name: 'Late', value: 4 },
      { name: 'Excused', value: 2 },
    ];

    // Recent Activities list
    const recentActivities = [
      { id: 1, type: 'admission', text: 'New student John Doe was admitted to Grade 10.', time: '2 hours ago' },
      { id: 2, type: 'payment', text: 'Parent paid $1200.00 Tuition Fee for John Doe.', time: '4 hours ago' },
      { id: 3, type: 'grade', text: 'Teacher Walter White graded Organic Chemistry exam papers.', time: '1 day ago' },
      { id: 4, type: 'timetable', text: 'Class Grade 11 schedule was updated.', time: '2 days ago' },
    ];

    return res.status(200).json({
      success: true,
      data: {
        counters: {
          students: studentsCountRes.rows[0]?.count || 0,
          teachers: teachersCountRes.rows[0]?.count || 0,
          departments: deptCountRes.rows[0]?.count || 0,
          totalRevenue: parseFloat(revenueRes.rows[0]?.total_revenue || '0.00'),
        },
        revenueTrends,
        attendanceStats,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};
