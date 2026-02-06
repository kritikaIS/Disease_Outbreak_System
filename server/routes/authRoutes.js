import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Doctor from '../models/Doctor.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register doctor
router.post('/register', [
  body('doctor_id').notEmpty().withMessage('Doctor ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('clinic_id').notEmpty().withMessage('Clinic ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { doctor_id, name, email, password, specialty, clinic_id, region, phone } = req.body;

    const existingDoctor = await Doctor.findOne({
      $or: [{ doctor_id }, { email }]
    });

    if (existingDoctor) {
      return res.status(400).json({
        status: 'error',
        message: 'Doctor with this ID or email already exists'
      });
    }

    
    const hashedPassword = await bcrypt.hash(password, 12);

    
    const doctor = new Doctor({
      doctor_id,
      name,
      email,
      password: hashedPassword,
      specialty,
      clinic_id,
      region,
      phone
    });

    await doctor.save();

    // Generate JWT token
    const token = jwt.sign(
      { doctor_id: doctor.doctor_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Doctor registered successfully',
      data: {
        doctor: {
          doctor_id: doctor.doctor_id,
          name: doctor.name,
          email: doctor.email,
          specialty: doctor.specialty,
          clinic_id: doctor.clinic_id,
          region: doctor.region,
          phone: doctor.phone
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed'
    });
  }
});

// Login doctor
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find doctor by email
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { doctor_id: doctor.doctor_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        doctor: {
          doctor_id: doctor.doctor_id,
          name: doctor.name,
          email: doctor.email,
          specialty: doctor.specialty,
          clinic_id: doctor.clinic_id,
          region: doctor.region,
          phone: doctor.phone
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        doctor: req.user
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile'
    });
  }
});

export default router;
