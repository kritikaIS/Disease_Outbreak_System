import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';

// Import models
import Clinic from '../models/Clinic.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Symptom from '../models/Symptom.js';
import Report from '../models/Report.js';
import Outbreak from '../models/Outbreak.js';

// Load environment variables
dotenv.config({ path: './config.env' });

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await Promise.all([
      Clinic.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Symptom.deleteMany({}),
      Report.deleteMany({}),
      Outbreak.deleteMany({})
    ]);

    console.log('Cleared existing data');

    // Seed Clinics (India-specific regions)
    const clinics = [
      {
        clinic_id: 'CLINIC001',
        name: 'City General Hospital',
        address: 'MG Road, Bengaluru',
        region: 'Karnataka',
        type: 'General Hospital'
      },
      {
        clinic_id: 'CLINIC002',
        name: 'Fortis Mumbai',
        address: 'Bandra West, Mumbai',
        region: 'Maharashtra',
        type: 'Medical Center'
      },
      {
        clinic_id: 'CLINIC003',
        name: 'AIIMS Delhi OPD',
        address: 'Ansari Nagar, New Delhi',
        region: 'Delhi',
        type: 'Community Clinic'
      },
      {
        clinic_id: 'CLINIC004',
        name: 'Apollo Chennai',
        address: 'Greams Road, Chennai',
        region: 'Tamil Nadu',
        type: 'Family Practice'
      }
    ];

    await Clinic.insertMany(clinics);
    console.log('Seeded clinics');

    // Seed Doctors
    const hashedPassword = await bcrypt.hash('password123', 12);
    const doctors = [
      {
        doctor_id: 'DOC001',
        name: 'Dr. Sarah Johnson',
        specialty: 'Internal Medicine',
        clinic_id: 'CLINIC001',
        email: 'sarah.johnson@hospital.com',
        password: hashedPassword
      },
      {
        doctor_id: 'DOC002',
        name: 'Dr. Michael Chen',
        specialty: 'Infectious Diseases',
        clinic_id: 'CLINIC001',
        email: 'michael.chen@hospital.com',
        password: hashedPassword
      },
      {
        doctor_id: 'DOC003',
        name: 'Dr. Emily Rodriguez',
        specialty: 'Family Medicine',
        clinic_id: 'CLINIC002',
        email: 'emily.rodriguez@medical.com',
        password: hashedPassword
      },
      {
        doctor_id: 'DOC004',
        name: 'Dr. David Kim',
        specialty: 'Emergency Medicine',
        clinic_id: 'CLINIC003',
        email: 'david.kim@clinic.com',
        password: hashedPassword
      }
    ];

    await Doctor.insertMany(doctors);
    console.log('Seeded doctors');

    // Seed Patients
    const patients = [
      {
        patient_id: 'PAT001',
        name: 'John Smith',
        dob: new Date('1985-03-15'),
        gender: 'Male',
        address: '100 First Street, Downtown',
        phone: '555-0101'
      },
      {
        patient_id: 'PAT002',
        name: 'Jane Doe',
        dob: new Date('1990-07-22'),
        gender: 'Female',
        address: '200 Second Avenue, Northside',
        phone: '555-0102'
      },
      {
        patient_id: 'PAT003',
        name: 'Robert Wilson',
        dob: new Date('1978-11-08'),
        gender: 'Male',
        address: '300 Third Road, Southwest',
        phone: '555-0103'
      },
      {
        patient_id: 'PAT004',
        name: 'Lisa Brown',
        dob: new Date('1995-01-30'),
        gender: 'Female',
        address: '400 Fourth Lane, Eastside',
        phone: '555-0104'
      },
      {
        patient_id: 'PAT005',
        name: 'Mark Davis',
        dob: new Date('1982-09-12'),
        gender: 'Male',
        address: '500 Fifth Street, Downtown',
        phone: '555-0105'
      }
    ];

    await Patient.insertMany(patients);
    console.log('Seeded patients');

    // Seed Symptoms
    const symptoms = [
      {
        symptom_id: 'SYM001',
        name: 'Fever',
        description: 'Elevated body temperature above normal range',
        severity: 'High'
      },
      {
        symptom_id: 'SYM002',
        name: 'Cough',
        description: 'Persistent coughing, dry or with phlegm',
        severity: 'Medium'
      },
      {
        symptom_id: 'SYM003',
        name: 'Headache',
        description: 'Pain or discomfort in the head or neck area',
        severity: 'Low'
      },
      {
        symptom_id: 'SYM004',
        name: 'Fatigue',
        description: 'Extreme tiredness and lack of energy',
        severity: 'Medium'
      },
      {
        symptom_id: 'SYM005',
        name: 'Nausea',
        description: 'Feeling of sickness with inclination to vomit',
        severity: 'Medium'
      },
      {
        symptom_id: 'SYM006',
        name: 'Shortness of Breath',
        description: 'Difficulty breathing or feeling breathless',
        severity: 'High'
      },
      {
        symptom_id: 'SYM007',
        name: 'Body Aches',
        description: 'Generalized muscle pain and discomfort',
        severity: 'Low'
      },
      {
        symptom_id: 'SYM008',
        name: 'Loss of Taste',
        description: 'Inability to taste food or drinks',
        severity: 'Medium'
      }
    ];

    await Symptom.insertMany(symptoms);
    console.log('Seeded symptoms');

    // Seed Reports
    const reports = [
      {
        report_id: 'REP001',
        patient_id: 'PAT001',
        clinic_id: 'CLINIC001',
        doctor_id: 'DOC001',
        report_date: new Date('2024-01-15'),
        symptoms: [
          {
            symptom_id: 'SYM001',
            onset_date: new Date('2024-01-14'),
            duration: '2 days'
          },
          {
            symptom_id: 'SYM002',
            onset_date: new Date('2024-01-13'),
            duration: '3 days'
          }
        ]
      },
      {
        report_id: 'REP002',
        patient_id: 'PAT002',
        clinic_id: 'CLINIC001',
        doctor_id: 'DOC002',
        report_date: new Date('2024-01-16'),
        symptoms: [
          {
            symptom_id: 'SYM001',
            onset_date: new Date('2024-01-15'),
            duration: '1 day'
          },
          {
            symptom_id: 'SYM006',
            onset_date: new Date('2024-01-15'),
            duration: '1 day'
          }
        ]
      },
      {
        report_id: 'REP003',
        patient_id: 'PAT003',
        clinic_id: 'CLINIC002',
        doctor_id: 'DOC003',
        report_date: new Date('2024-01-17'),
        symptoms: [
          {
            symptom_id: 'SYM002',
            onset_date: new Date('2024-01-16'),
            duration: '1 day'
          },
          {
            symptom_id: 'SYM004',
            onset_date: new Date('2024-01-15'),
            duration: '2 days'
          }
        ]
      },
      {
        report_id: 'REP004',
        patient_id: 'PAT004',
        clinic_id: 'CLINIC001',
        doctor_id: 'DOC001',
        report_date: new Date('2024-01-18'),
        symptoms: [
          {
            symptom_id: 'SYM001',
            onset_date: new Date('2024-01-17'),
            duration: '1 day'
          },
          {
            symptom_id: 'SYM008',
            onset_date: new Date('2024-01-17'),
            duration: '1 day'
          }
        ]
      },
      {
        report_id: 'REP005',
        patient_id: 'PAT005',
        clinic_id: 'CLINIC003',
        doctor_id: 'DOC004',
        report_date: new Date('2024-01-19'),
        symptoms: [
          {
            symptom_id: 'SYM002',
            onset_date: new Date('2024-01-18'),
            duration: '1 day'
          },
          {
            symptom_id: 'SYM003',
            onset_date: new Date('2024-01-18'),
            duration: '1 day'
          }
        ]
      }
    ];

    await Report.insertMany(reports);
    console.log('Seeded reports');

    // Seed Outbreaks (India-specific regions)
    const outbreaks = [
      {
        outbreak_id: 'OUT001',
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-01-25'),
        status: 'Active',
        description: 'Respiratory illness spike in Bengaluru',
        region: 'Karnataka',
        symptoms: [
          {
            symptom_id: 'SYM001',
            cases_count: 3,
            threshold: 2,
            is_threshold_exceeded: true
          },
          {
            symptom_id: 'SYM002',
            cases_count: 4,
            threshold: 3,
            is_threshold_exceeded: true
          },
          {
            symptom_id: 'SYM006',
            cases_count: 1,
            threshold: 2,
            is_threshold_exceeded: false
          }
        ]
      },
      {
        outbreak_id: 'OUT002',
        start_date: new Date('2024-01-10'),
        end_date: new Date('2024-01-20'),
        status: 'Contained',
        description: 'Gastrointestinal symptoms cluster in Mumbai',
        region: 'Maharashtra',
        symptoms: [
          {
            symptom_id: 'SYM005',
            cases_count: 2,
            threshold: 3,
            is_threshold_exceeded: false
          },
          {
            symptom_id: 'SYM004',
            cases_count: 1,
            threshold: 2,
            is_threshold_exceeded: false
          }
        ]
      }
    ];

    await Outbreak.insertMany(outbreaks);
    console.log('Seeded outbreaks');

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Email: sarah.johnson@hospital.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
