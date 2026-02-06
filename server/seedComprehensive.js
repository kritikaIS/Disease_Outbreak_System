import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import models
import Clinic from './models/Clinic.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Symptom from './models/Symptom.js';
import Report from './models/Report.js';
import Outbreak from './models/Outbreak.js';

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to database
await connectDB();

// Helper function to generate random IDs
function generateId(prefix, length = 3) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to get random date within range
function getRandomDate(startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return new Date(start + Math.random() * (end - start));
}

// Helper function to get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get multiple random items from array
function getRandomItems(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Clear existing data
console.log('Clearing existing data...');
await Promise.all([
  Clinic.deleteMany({}),
  Doctor.deleteMany({}),
  Patient.deleteMany({}),
  Symptom.deleteMany({}),
  Report.deleteMany({}),
  Outbreak.deleteMany({})
]);

console.log('Creating symptoms...');
const symptoms = [
  { symptom_id: 'SYM001', name: 'Fever', description: 'Elevated body temperature above 100.4°F', severity: 'High' },
  { symptom_id: 'SYM002', name: 'Cough', description: 'Persistent coughing', severity: 'Medium' },
  { symptom_id: 'SYM003', name: 'Headache', description: 'Pain in the head or neck area', severity: 'Low' },
  { symptom_id: 'SYM004', name: 'Nausea', description: 'Feeling of sickness with inclination to vomit', severity: 'Medium' },
  { symptom_id: 'SYM005', name: 'Fatigue', description: 'Extreme tiredness and lack of energy', severity: 'Low' },
  { symptom_id: 'SYM006', name: 'Shortness of Breath', description: 'Difficulty breathing or breathlessness', severity: 'High' },
  { symptom_id: 'SYM007', name: 'Body Aches', description: 'Muscle pain and discomfort', severity: 'Medium' },
  { symptom_id: 'SYM008', name: 'Sore Throat', description: 'Pain or irritation in the throat', severity: 'Medium' },
  { symptom_id: 'SYM009', name: 'Runny Nose', description: 'Excessive nasal discharge', severity: 'Low' },
  { symptom_id: 'SYM010', name: 'Diarrhea', description: 'Frequent loose or liquid bowel movements', severity: 'High' },
  { symptom_id: 'SYM011', name: 'Vomiting', description: 'Forceful expulsion of stomach contents', severity: 'High' },
  { symptom_id: 'SYM012', name: 'Chills', description: 'Feeling of cold with shivering', severity: 'Medium' },
  { symptom_id: 'SYM013', name: 'Loss of Appetite', description: 'Reduced desire to eat', severity: 'Low' },
  { symptom_id: 'SYM014', name: 'Chest Pain', description: 'Pain or discomfort in the chest area', severity: 'High' },
  { symptom_id: 'SYM015', name: 'Dizziness', description: 'Feeling of lightheadedness or unsteadiness', severity: 'Medium' },
  { symptom_id: 'SYM016', name: 'Skin Rash', description: 'Abnormal changes in skin color or texture', severity: 'Medium' },
  { symptom_id: 'SYM017', name: 'Joint Pain', description: 'Pain in joints and surrounding tissues', severity: 'Medium' },
  { symptom_id: 'SYM018', name: 'Confusion', description: 'Mental state of being bewildered or unclear', severity: 'High' },
  { symptom_id: 'SYM019', name: 'Seizures', description: 'Sudden uncontrolled electrical activity in brain', severity: 'High' },
  { symptom_id: 'SYM020', name: 'Swollen Lymph Nodes', description: 'Enlarged lymph nodes', severity: 'Medium' }
];

await Symptom.insertMany(symptoms);
console.log(`Created ${symptoms.length} symptoms`);

console.log('Creating clinics...');
const indianStates = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 
  'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Bihar', 'Kerala',
  'Madhya Pradesh', 'Punjab', 'Haryana', 'Odisha', 'Assam'
];

const clinicTypes = ['Hospital', 'Clinic', 'Medical Center', 'Health Center', 'Polyclinic'];

const clinics = [];
for (let i = 1; i <= 50; i++) {
  const state = getRandomItem(indianStates);
  const type = getRandomItem(clinicTypes);
  clinics.push({
    clinic_id: `CLINIC${i.toString().padStart(3, '0')}`,
    name: `${type} ${state} ${i}`,
    address: `${Math.floor(Math.random() * 999) + 1} Main Street, ${state}`,
    region: state,
    type: type,
    contact_number: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    email: `clinic${i}@${state.toLowerCase().replace(' ', '')}.com`
  });
}

await Clinic.insertMany(clinics);
console.log(`Created ${clinics.length} clinics`);

console.log('Creating doctors...');
const specialties = [
  'General Medicine', 'Pediatrics', 'Cardiology', 'Neurology', 'Dermatology',
  'Orthopedics', 'Gynecology', 'Psychiatry', 'Emergency Medicine', 'Internal Medicine',
  'Infectious Diseases', 'Pulmonology', 'Gastroenterology', 'Endocrinology', 'Oncology'
];

const doctorNames = [
  'Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Amit Patel', 'Dr. Sunita Singh', 'Dr. Vikram Gupta',
  'Dr. Anjali Reddy', 'Dr. Suresh Mehta', 'Dr. Kavita Joshi', 'Dr. Ravi Verma', 'Dr. Meera Iyer',
  'Dr. Arjun Nair', 'Dr. Deepika Agarwal', 'Dr. Rohit Malhotra', 'Dr. Shruti Desai', 'Dr. Karan Shah',
  'Dr. Neha Kapoor', 'Dr. Manish Jain', 'Dr. Pooja Agarwal', 'Dr. Sameer Khan', 'Dr. Radha Krishnan'
];

const doctors = [];
for (let i = 1; i <= 100; i++) {
  const clinic = getRandomItem(clinics);
  doctors.push({
    doctor_id: `DOC${i.toString().padStart(3, '0')}`,
    name: getRandomItem(doctorNames),
    email: `doctor${i}@email.com`,
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    specialty: getRandomItem(specialties),
    clinic_id: clinic.clinic_id,
    region: clinic.region,
    phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`
  });
}

await Doctor.insertMany(doctors);
console.log(`Created ${doctors.length} doctors`);

console.log('Creating patients...');
const patientNames = [
  'Aarav Sharma', 'Priya Patel', 'Rahul Kumar', 'Sneha Singh', 'Vikram Gupta',
  'Anjali Reddy', 'Suresh Mehta', 'Kavita Joshi', 'Ravi Verma', 'Meera Iyer',
  'Arjun Nair', 'Deepika Agarwal', 'Rohit Malhotra', 'Shruti Desai', 'Karan Shah',
  'Neha Kapoor', 'Manish Jain', 'Pooja Agarwal', 'Sameer Khan', 'Radha Krishnan',
  'Amit Kumar', 'Sunita Sharma', 'Rajesh Patel', 'Kavita Singh', 'Vikram Reddy',
  'Anjali Mehta', 'Suresh Joshi', 'Ravi Verma', 'Meera Iyer', 'Arjun Nair'
];

const genders = ['Male', 'Female', 'Other'];

const patients = [];
for (let i = 1; i <= 200; i++) {
  const birthYear = 1950 + Math.floor(Math.random() * 70); // Ages 5-75
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1;
  const dob = new Date(birthYear, birthMonth - 1, birthDay);
  
  patients.push({
    patient_id: `PAT${i.toString().padStart(3, '0')}`,
    name: getRandomItem(patientNames),
    dob: dob,
    gender: getRandomItem(genders),
    address: `${Math.floor(Math.random() * 999) + 1} Street, City ${i}`,
    phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`
  });
}

await Patient.insertMany(patients);
console.log(`Created ${patients.length} patients`);

console.log('Creating reports...');
const reports = [];

// Create reports over the last 30 days
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 30);

for (let i = 1; i <= 500; i++) {
  const reportDate = getRandomDate(startDate, endDate);
  const patient = getRandomItem(patients);
  const doctor = getRandomItem(doctors);
  const clinic = clinics.find(c => c.clinic_id === doctor.clinic_id);
  
  // Select 1-4 random symptoms
  const selectedSymptoms = getRandomItems(symptoms, Math.floor(Math.random() * 4) + 1);
  
  const reportSymptoms = selectedSymptoms.map(symptom => {
    const onsetDate = new Date(reportDate);
    onsetDate.setDate(onsetDate.getDate() - Math.floor(Math.random() * 7)); // Symptoms started 0-7 days ago
    
    return {
      symptom_id: symptom.symptom_id,
      onset_date: onsetDate,
      duration: `${Math.floor(Math.random() * 14) + 1} days`
    };
  });
  
  reports.push({
    report_id: `RPT${Date.now()}${i}`,
    patient_id: patient.patient_id,
    clinic_id: clinic.clinic_id,
    doctor_id: doctor.doctor_id,
    report_date: reportDate,
    symptoms: reportSymptoms
  });
}

await Report.insertMany(reports);
console.log(`Created ${reports.length} reports`);

// Create some outbreak scenarios
console.log('Creating outbreak scenarios...');

// Scenario 1: Fever outbreak in Delhi (last 7 days)
const feverOutbreak = new Outbreak({
  outbreak_id: 'OUT001',
  start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  status: 'Active',
  description: 'Unusual increase in fever cases detected in Delhi region',
  symptoms: [
    {
      symptom_id: 'SYM001', // Fever
      cases_count: 15,
      threshold: 5,
      is_threshold_exceeded: true
    },
    {
      symptom_id: 'SYM002', // Cough
      cases_count: 12,
      threshold: 3,
      is_threshold_exceeded: true
    }
  ],
  region: 'Delhi'
});

// Scenario 2: Gastrointestinal outbreak in Maharashtra (last 10 days)
const gastroOutbreak = new Outbreak({
  outbreak_id: 'OUT002',
  start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  status: 'Investigation',
  description: 'Cluster of gastrointestinal symptoms in Maharashtra',
  symptoms: [
    {
      symptom_id: 'SYM010', // Diarrhea
      cases_count: 8,
      threshold: 2,
      is_threshold_exceeded: true
    },
    {
      symptom_id: 'SYM011', // Vomiting
      cases_count: 6,
      threshold: 2,
      is_threshold_exceeded: true
    },
    {
      symptom_id: 'SYM004', // Nausea
      cases_count: 10,
      threshold: 3,
      is_threshold_exceeded: true
    }
  ],
  region: 'Maharashtra'
});

// Scenario 3: Resolved respiratory outbreak in Karnataka
const respiratoryOutbreak = new Outbreak({
  outbreak_id: 'OUT003',
  start_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  end_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  status: 'Resolved',
  description: 'Respiratory outbreak in Karnataka - successfully contained',
  symptoms: [
    {
      symptom_id: 'SYM006', // Shortness of Breath
      cases_count: 12,
      threshold: 2,
      is_threshold_exceeded: true
    },
    {
      symptom_id: 'SYM002', // Cough
      cases_count: 18,
      threshold: 3,
      is_threshold_exceeded: true
    },
    {
      symptom_id: 'SYM008', // Sore Throat
      cases_count: 15,
      threshold: 3,
      is_threshold_exceeded: true
    }
  ],
  region: 'Karnataka'
});

await Promise.all([
  feverOutbreak.save(),
  gastroOutbreak.save(),
  respiratoryOutbreak.save()
]);

console.log('Created 3 outbreak scenarios');

// Create some additional reports to trigger outbreak detection
console.log('Creating additional outbreak-triggering reports...');
const outbreakReports = [];

// Add more fever cases in Delhi to trigger detection
for (let i = 1; i <= 20; i++) {
  const reportDate = getRandomDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), new Date());
  const patient = getRandomItem(patients);
  const delhiClinics = clinics.filter(c => c.region === 'Delhi');
  const clinic = getRandomItem(delhiClinics);
  const delhiDoctors = doctors.filter(d => d.clinic_id === clinic.clinic_id);
  
  // Skip if no doctors found for this clinic
  if (delhiDoctors.length === 0) {
    console.log(`Skipping clinic ${clinic.clinic_id} - no doctors found`);
    continue;
  }
  
  const doctor = getRandomItem(delhiDoctors);
  
  outbreakReports.push({
    report_id: `OUTRPT${Date.now()}${i}`,
    patient_id: patient.patient_id,
    clinic_id: clinic.clinic_id,
    doctor_id: doctor.doctor_id,
    report_date: reportDate,
    symptoms: [
      {
        symptom_id: 'SYM001', // Fever
        onset_date: new Date(reportDate.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        duration: `${Math.floor(Math.random() * 5) + 1} days`
      },
      {
        symptom_id: 'SYM002', // Cough
        onset_date: new Date(reportDate.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000),
        duration: `${Math.floor(Math.random() * 7) + 1} days`
      }
    ]
  });
}

await Report.insertMany(outbreakReports);
console.log(`Created ${outbreakReports.length} additional outbreak-triggering reports`);

console.log('\n🎉 Database seeding completed successfully!');
console.log('\n📊 Summary:');
console.log(`- ${symptoms.length} symptoms`);
console.log(`- ${clinics.length} clinics across ${indianStates.length} states`);
console.log(`- ${doctors.length} doctors`);
console.log(`- ${patients.length} patients`);
console.log(`- ${reports.length + outbreakReports.length} reports`);
console.log(`- 3 outbreak scenarios`);
console.log('\n🔍 The system now has rich data for testing outbreak detection!');

// Close database connection
await mongoose.connection.close();
console.log('\nDatabase connection closed.');
