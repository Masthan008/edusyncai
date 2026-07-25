import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';

export const getRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await query('SELECT * FROM transport_routes ORDER BY route_name ASC');
    return res.status(200).json({ success: true, data: list.rows });
  } catch (error) {
    next(error);
  }
};

export const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  const { route_name, fare } = req.body;
  if (!route_name) {
    return res.status(400).json({ success: false, message: 'Route name is required.' });
  }

  try {
    const result = await query(
      'INSERT INTO transport_routes (route_name, fare) VALUES ($1, $2) RETURNING *',
      [route_name, fare || 0]
    );
    return res.status(201).json({ success: true, message: 'Transport route created.', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await query(
      `SELECT v.*, r.route_name, r.fare 
       FROM transport_vehicles v
       LEFT JOIN transport_routes r ON v.route_id = r.id
       ORDER BY v.vehicle_number ASC`
    );
    return res.status(200).json({ success: true, data: list.rows });
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
  const { vehicle_number, driver_name, driver_phone, route_id } = req.body;
  if (!vehicle_number || !driver_name) {
    return res.status(400).json({ success: false, message: 'Vehicle number and driver name are required.' });
  }

  try {
    const result = await query(
      'INSERT INTO transport_vehicles (vehicle_number, driver_name, driver_phone, route_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [vehicle_number, driver_name, driver_phone || null, route_id || null]
    );
    return res.status(201).json({ success: true, message: 'Transport vehicle registered.', data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Vehicle number already exists.' });
    }
    next(error);
  }
};
