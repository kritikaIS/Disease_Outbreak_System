import express from 'express';
import { body, validationResult } from 'express-validator';
import Outbreak from '../models/Outbreak.js';
import { 
  analyzeOutbreaks, 
  getOutbreakStats, 
  getRecentOutbreaks 
} from '../services/outbreakDetection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get outbreak analysis
router.get('/analyze', authenticateToken, async (req, res) => {
  try {
    const { region, days = 7, endDate } = req.query;
    
    const options = {
      region: region || null,
      days: parseInt(days),
      endDate: endDate ? new Date(endDate) : new Date()
    };
    
    console.log('Starting outbreak analysis with options:', options);
    
    const analysis = await analyzeOutbreaks(options);
    
    res.json({
      status: 'success',
      data: analysis
    });
  } catch (error) {
    console.error('Outbreak analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze outbreaks',
      error: error.message
    });
  }
});

// Get outbreak statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { region } = req.query;
    
    const stats = await getOutbreakStats(region);
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Outbreak stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get outbreak statistics',
      error: error.message
    });
  }
});

// Get recent outbreaks
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, region } = req.query;
    
    const outbreaks = await getRecentOutbreaks(parseInt(limit), region);
    
    res.json({
      status: 'success',
      data: { outbreaks }
    });
  } catch (error) {
    console.error('Recent outbreaks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get recent outbreaks',
      error: error.message
    });
  }
});

// Get all outbreaks with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      region,
      start_date,
      end_date 
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (region) query.region = region;
    
    if (start_date || end_date) {
      query.start_date = {};
      if (start_date) query.start_date.$gte = new Date(start_date);
      if (end_date) query.start_date.$lte = new Date(end_date);
    }
    
    const outbreaks = await Outbreak.find(query)
      .sort({ start_date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Outbreak.countDocuments(query);
    
    // Populate symptom details
    const populatedOutbreaks = await Promise.all(
      outbreaks.map(async (outbreak) => {
        const Symptom = (await import('../models/Symptom.js')).default;
        const symptomDetails = await Symptom.find({
          symptom_id: { $in: outbreak.symptoms.map(s => s.symptom_id) }
        });
        
        const populatedSymptoms = outbreak.symptoms.map(symptom => {
          const detail = symptomDetails.find(s => s.symptom_id === symptom.symptom_id);
          return {
            ...symptom.toObject(),
            name: detail ? detail.name : 'Unknown',
            severity: detail ? detail.severity : 'Medium'
          };
        });
        
        return {
          ...outbreak.toObject(),
          symptoms: populatedSymptoms
        };
      })
    );
    
    res.json({
      status: 'success',
      data: {
        outbreaks: populatedOutbreaks,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get outbreaks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get outbreaks',
      error: error.message
    });
  }
});

// Get single outbreak
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const outbreak = await Outbreak.findOne({ outbreak_id: req.params.id });
    
    if (!outbreak) {
      return res.status(404).json({
        status: 'error',
        message: 'Outbreak not found'
      });
    }
    
    // Populate symptom details
    const Symptom = (await import('../models/Symptom.js')).default;
    const symptomDetails = await Symptom.find({
      symptom_id: { $in: outbreak.symptoms.map(s => s.symptom_id) }
    });
    
    const populatedSymptoms = outbreak.symptoms.map(symptom => {
      const detail = symptomDetails.find(s => s.symptom_id === symptom.symptom_id);
      return {
        ...symptom.toObject(),
        name: detail ? detail.name : 'Unknown',
        severity: detail ? detail.severity : 'Medium'
      };
    });
    
    const populatedOutbreak = {
      ...outbreak.toObject(),
      symptoms: populatedSymptoms
    };
    
    res.json({
      status: 'success',
      data: { outbreak: populatedOutbreak }
    });
  } catch (error) {
    console.error('Get outbreak error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get outbreak',
      error: error.message
    });
  }
});

// Update outbreak status
router.put('/:id/status', authenticateToken, [
  body('status').isIn(['Active', 'Contained', 'Resolved', 'Investigation'])
    .withMessage('Invalid status')
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
    
    const { status, description } = req.body;
    
    const outbreak = await Outbreak.findOneAndUpdate(
      { outbreak_id: req.params.id },
      { 
        status,
        description: description || outbreak.description,
        ...(status === 'Resolved' && { end_date: new Date() })
      },
      { new: true }
    );
    
    if (!outbreak) {
      return res.status(404).json({
        status: 'error',
        message: 'Outbreak not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Outbreak status updated successfully',
      data: { outbreak }
    });
  } catch (error) {
    console.error('Update outbreak status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update outbreak status',
      error: error.message
    });
  }
});

// Create manual outbreak
router.post('/', authenticateToken, [
  body('description').notEmpty().withMessage('Description is required'),
  body('region').notEmpty().withMessage('Region is required'),
  body('symptoms').isArray().withMessage('Symptoms must be an array')
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
    
    const { description, region, symptoms, status = 'Investigation' } = req.body;
    
    const outbreakId = `OUT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const outbreak = new Outbreak({
      outbreak_id: outbreakId,
      start_date: new Date(),
      status,
      description,
      symptoms: symptoms || [],
      region
    });
    
    await outbreak.save();
    
    res.status(201).json({
      status: 'success',
      message: 'Outbreak created successfully',
      data: { outbreak }
    });
  } catch (error) {
    console.error('Create outbreak error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create outbreak',
      error: error.message
    });
  }
});

// Public routes (no authentication required)
router.get('/public/stats', async (req, res) => {
  try {
    const stats = await getOutbreakStats();
    
    // Get additional public stats
    const Report = (await import('../models/Report.js')).default;
    const totalReports = await Report.countDocuments();
    const recentReportsCount = await Report.countDocuments({
      report_date: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    });
    
    res.json({
      status: 'success',
      data: {
        ...stats,
        totalReports,
        recentReportsCount,
        lastUpdate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Public outbreak stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get outbreak statistics',
      error: error.message
    });
  }
});

router.get('/public/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const outbreaks = await getRecentOutbreaks(parseInt(limit));
    
    res.json({
      status: 'success',
      data: { outbreaks }
    });
  } catch (error) {
    console.error('Public recent outbreaks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get recent outbreaks',
      error: error.message
    });
  }
});

export default router;