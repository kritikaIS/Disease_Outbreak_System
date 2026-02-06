import express from 'express';
import { body, validationResult } from 'express-validator';
import Patient from '../models/Patient.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all patients with search and filter
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, gender, age_min, age_max } = req.query;
    const query = {};

    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    if (gender) query.gender = gender;

    // Age filter
    if (age_min || age_max) {
      const now = new Date();
      query.dob = {};
      
      if (age_max) {
        const minDate = new Date(now.getFullYear() - age_max - 1, now.getMonth(), now.getDate());
        query.dob.$gte = minDate;
      }
      
      if (age_min) {
        const maxDate = new Date(now.getFullYear() - age_min, now.getMonth(), now.getDate());
        query.dob.$lte = maxDate;
      }
    }

    const patients = await Patient.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Patient.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        patients,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch patients'
    });
  }
});

// Get single patient
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ patient_id: req.params.id });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    res.json({
      status: 'success',
      data: { patient }
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch patient'
    });
  }
});

// Test route without authentication
router.post('/test', (req, res) => {
  console.log('=== TEST ROUTE HIT ===');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  res.json({ message: 'Test route working', body: req.body });
});

// Create patient (temporarily without auth for testing)
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('dob').isDate().withMessage('Valid date of birth is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required')
], async (req, res) => {
  try {
    console.log("=== PATIENT ROUTE HIT ===");
    console.log("Request method:", req.method);
    console.log("Request URL:", req.url);
    console.log("Request headers:", req.headers);
    console.log("Content-Type header:", req.headers['content-type']);
    console.log("Authorization header:", req.headers['authorization']);
    console.log("Request body type:", typeof req.body);
    console.log("Request body:", req.body);
    console.log("Request body keys:", req.body ? Object.keys(req.body) : 'No body');
    console.log("Request body values:", req.body ? Object.values(req.body) : 'No body');
    
    // Check if body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("ERROR: Request body is empty!");
      return res.status(400).json({
        status: 'error',
        message: 'Request body is empty',
        debug: {
          headers: req.headers,
          body: req.body
        }
      });
    }
    
    // Check specific fields
    console.log("Name field:", req.body.name);
    console.log("DOB field:", req.body.dob);
    console.log("Gender field:", req.body.gender);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Generate patient_id if not provided
    const patientData = {
      ...req.body,
      patient_id: req.body.patient_id || `PAT${Date.now()}${Math.floor(Math.random() * 1000)}`
    };

    // Ensure dob is a proper Date object
    if (patientData.dob) {
      patientData.dob = new Date(patientData.dob);
    }

    console.log("Processed patient data:", patientData); // Debug log

    const patient = new Patient(patientData);
    await patient.save();

    res.status(201).json({
      status: 'success',
      message: 'Patient created successfully',
      data: { patient }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Patient ID already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Failed to create patient'
    });
  }
});

// Update patient
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { patient_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Patient updated successfully',
      data: { patient }
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update patient'
    });
  }
});

// Delete patient
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ patient_id: req.params.id });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete patient'
    });
  }
});

export default router;
