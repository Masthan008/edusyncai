import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';

export const getFeeStructures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feeRes = await query(
      `SELECT f.*, c.name as class_name, ay.name as academic_year_name
       FROM fee_structures f
       LEFT JOIN classes c ON f.class_id = c.id
       JOIN academic_years ay ON f.academic_year_id = ay.id
       ORDER BY f.due_date DESC`
    );
    return res.status(200).json({
      success: true,
      data: feeRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createFeeStructure = async (req: Request, res: Response, next: NextFunction) => {
  const { name, class_id, amount, due_date, academic_year_id } = req.body;

  try {
    const resFee = await query(
      `INSERT INTO fee_structures (name, class_id, amount, due_date, academic_year_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, class_id || null, amount, due_date, academic_year_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Fee structure created successfully.',
      data: resFee.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req: Request, res: Response, next: NextFunction) => {
  const { student_id, fee_structure_id, amount_paid, payment_method, transaction_reference } = req.body;
  const reference = transaction_reference || `TXN-${Date.now()}`;

  try {
    const checkFee = await query('SELECT amount FROM fee_structures WHERE id = $1', [fee_structure_id]);
    if (checkFee.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Fee structure not found.' });
    }

    const payRes = await query(
      `INSERT INTO payments (student_id, fee_structure_id, amount_paid, payment_method, transaction_reference, status) 
       VALUES ($1, $2, $3, $4, $5, 'Paid') RETURNING *`,
      [student_id, fee_structure_id, amount_paid, payment_method, reference]
    );

    return res.status(201).json({
      success: true,
      message: 'Payment logged and transaction completed.',
      data: payRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentPayments = async (req: Request, res: Response, next: NextFunction) => {
  const { studentId } = req.params;

  try {
    // Get all fee structures applicable to this student's class
    const studentClassRes = await query('SELECT class_id FROM students WHERE id = $1', [studentId]);
    if (studentClassRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const classId = studentClassRes.rows[0].class_id;

    // Fetch fee structures for the class + paid status mapping
    const duesRes = await query(
      `SELECT fs.*, 
              COALESCE((SELECT SUM(p.amount_paid) FROM payments p WHERE p.fee_structure_id = fs.id AND p.student_id = $1), 0) as paid_amount
       FROM fee_structures fs
       WHERE fs.class_id = $2 OR fs.class_id IS NULL`,
      [studentId, classId]
    );

    const invoices = duesRes.rows.map((row: any) => {
      const amount = parseFloat(row.amount);
      const paid = parseFloat(row.paid_amount);
      const balance = amount - paid;
      return {
        id: row.id,
        name: row.name,
        amount,
        paid,
        balance,
        due_date: row.due_date,
        status: balance <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid',
      };
    });

    // Fetch individual payment receipts
    const paymentsRes = await query(
      `SELECT p.*, fs.name as fee_name, fs.amount as total_fee_amount
       FROM payments p
       JOIN fee_structures fs ON p.fee_structure_id = fs.id
       WHERE p.student_id = $1
       ORDER BY p.payment_date DESC`,
      [studentId]
    );

    return res.status(200).json({
      success: true,
      data: {
        invoices,
        history: paymentsRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAccountantSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const revenueRes = await query(
      "SELECT SUM(amount_paid) as total_revenue FROM payments WHERE status = 'Paid'"
    );
    const paymentsCountRes = await query('SELECT COUNT(*) as tx_count FROM payments');

    // Fetch recent transaction history
    const recentRes = await query(
      `SELECT p.*, s.first_name || ' ' || s.last_name as student_name,
              fs.name as fee_name
       FROM payments p
       JOIN students s ON p.student_id = s.id
       JOIN fee_structures fs ON p.fee_structure_id = fs.id
       ORDER BY p.payment_date DESC
       LIMIT 10`
    );

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: parseFloat(revenueRes.rows[0]?.total_revenue || '0.00'),
        transactionCount: parseInt(paymentsCountRes.rows[0]?.tx_count || '0', 10),
        recentTransactions: recentRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};
