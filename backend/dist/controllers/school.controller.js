import { query } from '../database/db.js';
export const getClasses = async (req, res, next) => {
    try {
        const list = await query('SELECT * FROM classes ORDER BY name ASC');
        return res.status(200).json({ success: true, data: list.rows });
    }
    catch (error) {
        next(error);
    }
};
export const getSections = async (req, res, next) => {
    try {
        const list = await query(`SELECT s.*, c.name as class_name 
       FROM sections s 
       JOIN classes c ON s.class_id = c.id 
       ORDER BY c.name ASC, s.name ASC`);
        return res.status(200).json({ success: true, data: list.rows });
    }
    catch (error) {
        next(error);
    }
};
export const getSubjects = async (req, res, next) => {
    try {
        const list = await query('SELECT * FROM subjects ORDER BY name ASC');
        return res.status(200).json({ success: true, data: list.rows });
    }
    catch (error) {
        next(error);
    }
};
export const getAcademicYears = async (req, res, next) => {
    try {
        const list = await query('SELECT * FROM academic_years ORDER BY name DESC');
        return res.status(200).json({ success: true, data: list.rows });
    }
    catch (error) {
        next(error);
    }
};
