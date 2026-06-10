import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required.' });
    }
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired access token.' });
    }
};
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Authentication required.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden. Access restricted to roles: [${roles.join(', ')}]`,
            });
        }
        next();
    };
};
