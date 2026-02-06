import express from 'express';
import { body, validationResult } from 'express-validator';
import Symptom from '../models/Symptom.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all symptoms with search and filter
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, severity } = req.query;
    const query = {};

    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (severity) query.severity = severity;

    const symptoms = await Symptom.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Symptom.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        symptoms,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get symptoms error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch symptoms'
    });
  }
});

// Get single symptom
router.get('/:id', async (req, res) => {
  try {
    const symptom = await Symptom.findOne({ symptom_id: req.params.id });
    
    if (!symptom) {
      return res.status(404).json({
        status: 'error',
        message: 'Symptom not found'
      });
    }

    res.json({
      status: 'success',
      data: { symptom }
    });
  } catch (error) {
    console.error('Get symptom error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch symptom'
    });
  }
});

// Create symptom
router.post('/', authenticateToken, [
  body('symptom_id').notEmpty().withMessage('Symptom ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('severity').isIn(['Low', 'Medium', 'High']).withMessage('Valid severity is required')
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

    const symptom = new Symptom(req.body);
    await symptom.save();

    res.status(201).json({
      status: 'success',
      message: 'Symptom created successfully',
      data: { symptom }
    });
  } catch (error) {
    console.error('Create symptom error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Symptom ID already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Failed to create symptom'
    });
  }
});

// Update symptom
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const symptom = await Symptom.findOneAndUpdate(
      { symptom_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!symptom) {
      return res.status(404).json({
        status: 'error',
        message: 'Symptom not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Symptom updated successfully',
      data: { symptom }
    });
  } catch (error) {
    console.error('Update symptom error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update symptom'
    });
  }
});

// Delete symptom
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const symptom = await Symptom.findOneAndDelete({ symptom_id: req.params.id });

    if (!symptom) {
      return res.status(404).json({
        status: 'error',
        message: 'Symptom not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Symptom deleted successfully'
    });
  } catch (error) {
    console.error('Delete symptom error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete symptom'
    });
  }
});

export default router;
