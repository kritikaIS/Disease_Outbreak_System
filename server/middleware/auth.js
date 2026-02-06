import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';

export const authenticateToken = async (req, res, next) => {
  try {
    console.log("Auth middleware - Authorization header:", req.headers['authorization']); // Debug log
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log("Auth middleware - Extracted token:", token ? "present" : "missing"); // Debug log

    if (!token) {
      console.log("Auth middleware - No token found"); // Debug log
      return res.status(401).json({
        status: 'error',
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findOne({ doctor_id: decoded.doctor_id }).select('-password');
    
    if (!doctor) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    req.user = doctor;
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};
