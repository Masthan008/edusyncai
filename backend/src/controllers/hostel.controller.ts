import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';

export const getHostels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await query('SELECT * FROM hostels ORDER BY name ASC');
    return res.status(200).json({ success: true, data: list.rows });
  } catch (error) {
    next(error);
  }
};

export const createHostel = async (req: Request, res: Response, next: NextFunction) => {
  const { name, type, address } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Hostel name is required.' });
  }

  try {
    const result = await query(
      'INSERT INTO hostels (name, type, address) VALUES ($1, $2, $3) RETURNING *',
      [name, type || 'Co-Ed', address || null]
    );
    return res.status(201).json({ success: true, message: 'Hostel building added.', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await query(
      `SELECT r.*, h.name as hostel_name, h.type as hostel_type
       FROM hostel_rooms r
       JOIN hostels h ON r.hostel_id = h.id
       ORDER BY h.name ASC, r.room_number ASC`
    );
    return res.status(200).json({ success: true, data: list.rows });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  const { hostel_id, room_number, capacity, rent_amount } = req.body;
  if (!hostel_id || !room_number) {
    return res.status(400).json({ success: false, message: 'Hostel ID and Room Number are required.' });
  }

  try {
    const result = await query(
      'INSERT INTO hostel_rooms (hostel_id, room_number, capacity, rent_amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [hostel_id, room_number, capacity || 2, rent_amount || 0]
    );
    return res.status(201).json({ success: true, message: 'Hostel room configured.', data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Room number already exists in this hostel.' });
    }
    next(error);
  }
};
