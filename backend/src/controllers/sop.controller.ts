import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const getSops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM sops WHERE 1=1';
    const params: any[] = [];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    sql += ' ORDER BY title ASC';
    const result = await query(sql, params);

    const sops = result.rows.map((row: any) => ({
      ...row,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
    }));

    return res.status(200).json({ success: true, data: sops });
  } catch (error) {
    next(error);
  }
};

export const getSopById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM sops WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'SOP not found.' });
    }
    const row = result.rows[0];
    const sop = {
      ...row,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
    };
    return res.status(200).json({ success: true, data: sop });
  } catch (error) {
    next(error);
  }
};

export const createSop = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, category, description, steps } = req.body;
  const createdBy = req.user?.id || null;

  try {
    const stepsJson = typeof steps === 'string' ? steps : JSON.stringify(steps);
    const result = await query(
      `INSERT INTO sops (title, category, description, steps, created_by) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [title, category, description || null, stepsJson, createdBy]
    );

    const row = result.rows[0];
    const createdSop = {
      ...row,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
    };

    return res.status(201).json({ success: true, data: createdSop });
  } catch (error) {
    next(error);
  }
};

export const updateSop = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, category, description, steps } = req.body;

  try {
    const checkRes = await query('SELECT id FROM sops WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'SOP not found.' });
    }

    const stepsJson = steps ? (typeof steps === 'string' ? steps : JSON.stringify(steps)) : undefined;

    const result = await query(
      `UPDATE sops 
       SET title = COALESCE($1, title), 
           category = COALESCE($2, category), 
           description = COALESCE($3, description), 
           steps = COALESCE($4, steps),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [title, category, description, stepsJson, id]
    );

    const row = result.rows[0];
    const updatedSop = {
      ...row,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
    };

    return res.status(200).json({ success: true, message: 'SOP updated successfully.', data: updatedSop });
  } catch (error) {
    next(error);
  }
};

export const deleteSop = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const checkRes = await query('SELECT id FROM sops WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'SOP not found.' });
    }

    await query('DELETE FROM sops WHERE id = $1', [id]);
    return res.status(200).json({ success: true, message: 'SOP deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
