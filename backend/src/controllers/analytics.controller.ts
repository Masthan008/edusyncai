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

    const revenueTrends = revenueTrendRes.rows.map((r: any) => ({ name: r.month, value: parseFloat(r.amount) }));

    // Attendance stats - query actual data
    const attendanceRes = await query(
      `SELECT status, COUNT(*)::int as count 
       FROM attendance_records 
       GROUP BY status`
    );
    const totalAttendanceRecords = attendanceRes.rows.reduce((sum: number, r: any) => sum + r.count, 0);
    const attendanceStats = totalAttendanceRecords > 0 
      ? attendanceRes.rows.map((r: any) => ({
          name: r.status,
          value: Math.round((r.count / totalAttendanceRecords) * 100),
        }))
      : [];

    // Recent Activities list - query notifications
    const recentRes = await query(
      `SELECT id, title as text, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as time, type 
       FROM notifications 
       ORDER BY created_at DESC 
       LIMIT 5`
    );
    const recentActivities = recentRes.rows;

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
