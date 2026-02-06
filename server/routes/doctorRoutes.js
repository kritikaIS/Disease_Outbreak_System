import express from 'express';
import { body, validationResult } from 'express-validator';
import Doctor from '../models/Doctor.js';
import Clinic from '../models/Clinic.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all doctors with search and filter
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, specialty, clinic_id } = req.query;
    const query = {};

    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialty) query.specialty = specialty;
    if (clinic_id) query.clinic_id = clinic_id;

    const doctors = await Doctor.find(query)
      .select('-password')
      .populate('clinic_id', 'name address region')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Doctor.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        doctors,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch doctors'
    });
  }
});

// Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ doctor_id: req.params.id })
      .select('-password')
      .populate('clinic_id', 'name address region');
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    res.json({
      status: 'success',
      data: { doctor }
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch doctor'
    });
  }
});

// Create doctor
router.post('/', authenticateToken, [
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

    const { doctor_id, name, email, password, specialty, clinic_id } = req.body;

    // Check if clinic exists
    const clinic = await Clinic.findOne({ clinic_id });
    if (!clinic) {
      return res.status(400).json({
        status: 'error',
        message: 'Clinic not found'
      });
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({
      $or: [{ doctor_id }, { email }]
    });

    if (existingDoctor) {
      return res.status(400).json({
        status: 'error',
        message: 'Doctor with this ID or email already exists'
      });
    }

    const doctor = new Doctor({
      doctor_id,
      name,
      email,
      password,
      specialty,
      clinic_id
    });

    await doctor.save();

    const doctorResponse = await Doctor.findOne({ doctor_id })
      .select('-password')
      .populate('clinic_id', 'name address region');

    res.status(201).json({
      status: 'success',
      message: 'Doctor created successfully',
      data: { doctor: doctorResponse }
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Doctor ID or email already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Failed to create doctor'
    });
  }
});

// Update doctor
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.password; // Don't allow password updates through this route

    const doctor = await Doctor.findOneAndUpdate(
      { doctor_id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('clinic_id', 'name address region');

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Doctor updated successfully',
      data: { doctor }
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update doctor'
    });
  }
});

// Delete doctor
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndDelete({ doctor_id: req.params.id });

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete doctor'
    });
  }
});

export default router;
