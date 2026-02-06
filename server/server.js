import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import routes
import clinicRoutes from './routes/clinicRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import symptomRoutes from './routes/symptomRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import outbreakRoutes from './routes/outbreakRoutes.js';
import authRoutes from './routes/authRoutes.js';
import publicAuthRoutes from './routes/publicAuthRoutes.js';

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add body logging middleware AFTER express.json()
app.use((req, res, next) => {
  if (req.method === 'POST' && req.url === '/api/patients') {
    console.log('Raw request body:', JSON.stringify(req.body));
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request body values:', Object.values(req.body || {}));
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicAuthRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/outbreaks', outbreakRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Outbreak Watch API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
