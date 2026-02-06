import express from 'express';
import { body, validationResult } from 'express-validator';
import Clinic from '../models/Clinic.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all clinics with search and filter
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, region, type } = req.query;
    const query = {};

    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    if (region) query.region = region;
    if (type) query.type = type;

    const clinics = await Clinic.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Clinic.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        clinics,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get clinics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch clinics'
    });
  }
});

// Get single clinic
router.get('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ clinic_id: req.params.id });
    
    if (!clinic) {
      return res.status(404).json({
        status: 'error',
        message: 'Clinic not found'
      });
    }

    res.json({
      status: 'success',
      data: { clinic }
    });
  } catch (error) {
    console.error('Get clinic error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch clinic'
    });
  }
});

// Create clinic
router.post('/', authenticateToken, [
  body('clinic_id').notEmpty().withMessage('Clinic ID is required'),
  body('name').notEmpty().withMessage('Name is required')
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

    const clinic = new Clinic(req.body);
    await clinic.save();

    res.status(201).json({
      status: 'success',
      message: 'Clinic created successfully',
      data: { clinic }
    });
  } catch (error) {
    console.error('Create clinic error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Clinic ID already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Failed to create clinic'
    });
  }
});

// Update clinic
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const clinic = await Clinic.findOneAndUpdate(
      { clinic_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!clinic) {
      return res.status(404).json({
        status: 'error',
        message: 'Clinic not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Clinic updated successfully',
      data: { clinic }
    });
  } catch (error) {
    console.error('Update clinic error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update clinic'
    });
  }
});

// Delete clinic
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const clinic = await Clinic.findOneAndDelete({ clinic_id: req.params.id });

    if (!clinic) {
      return res.status(404).json({
        status: 'error',
        message: 'Clinic not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Clinic deleted successfully'
    });
  } catch (error) {
    console.error('Delete clinic error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete clinic'
    });
  }
});

export default router;
