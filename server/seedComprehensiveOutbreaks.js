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

// Helper function to add days to date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
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

console.log('Creating comprehensive symptoms...');
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
  { symptom_id: 'SYM020', name: 'Swollen Lymph Nodes', description: 'Enlarged lymph nodes', severity: 'Medium' },
  { symptom_id: 'SYM021', name: 'Eye Irritation', description: 'Redness, itching, or burning in eyes', severity: 'Low' },
  { symptom_id: 'SYM022', name: 'Muscle Weakness', description: 'Reduced muscle strength', severity: 'Medium' },
  { symptom_id: 'SYM023', name: 'Memory Loss', description: 'Difficulty remembering recent events', severity: 'High' },
  { symptom_id: 'SYM024', name: 'Sleep Disturbance', description: 'Difficulty falling or staying asleep', severity: 'Low' },
  { symptom_id: 'SYM025', name: 'Weight Loss', description: 'Unintentional reduction in body weight', severity: 'Medium' }
];

await Symptom.insertMany(symptoms);
console.log(`Created ${symptoms.length} symptoms`);

console.log('Creating clinics across regions...');
const regions = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 
  'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Bihar', 'Kerala',
  'Madhya Pradesh', 'Punjab', 'Haryana', 'Odisha', 'Assam',
  'Andhra Pradesh', 'Telangana', 'Jharkhand', 'Chhattisgarh', 'Himachal Pradesh'
];

const clinicTypes = ['Hospital', 'Clinic', 'Medical Center', 'Health Center', 'Polyclinic', 'Primary Care Center'];

const clinics = [];
let clinicCounter = 1;

// Create more clinics in outbreak-prone regions
const outbreakRegions = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal'];
const normalRegions = regions.filter(r => !outbreakRegions.includes(r));

// Create extra clinics in outbreak regions
outbreakRegions.forEach(region => {
  for (let i = 0; i < 8; i++) { // 8 clinics per outbreak region
    const type = getRandomItem(clinicTypes);
    clinics.push({
      clinic_id: `CLINIC${clinicCounter.toString().padStart(3, '0')}`,
      name: `${type} ${region} ${i + 1}`,
      address: `${Math.floor(Math.random() * 999) + 1} Main Street, ${region}`,
      region: region,
      type: type,
      contact_number: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: `clinic${clinicCounter}@${region.toLowerCase().replace(' ', '')}.com`
    });
    clinicCounter++;
  }
});

// Create normal clinics in other regions
normalRegions.forEach(region => {
  for (let i = 0; i < 3; i++) { // 3 clinics per normal region
    const type = getRandomItem(clinicTypes);
    clinics.push({
      clinic_id: `CLINIC${clinicCounter.toString().padStart(3, '0')}`,
      name: `${type} ${region} ${i + 1}`,
      address: `${Math.floor(Math.random() * 999) + 1} Main Street, ${region}`,
      region: region,
      type: type,
      contact_number: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: `clinic${clinicCounter}@${region.toLowerCase().replace(' ', '')}.com`
    });
    clinicCounter++;
  }
});

await Clinic.insertMany(clinics);
console.log(`Created ${clinics.length} clinics across ${regions.length} regions`);

console.log('Creating doctors...');
const specialties = [
  'General Medicine', 'Pediatrics', 'Cardiology', 'Neurology', 'Dermatology',
  'Orthopedics', 'Gynecology', 'Psychiatry', 'Emergency Medicine', 'Internal Medicine',
  'Infectious Diseases', 'Pulmonology', 'Gastroenterology', 'Endocrinology', 'Oncology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Microbiology', 'Public Health'
];

const doctorNames = [
  'Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Amit Patel', 'Dr. Sunita Singh', 'Dr. Vikram Gupta',
  'Dr. Anjali Reddy', 'Dr. Suresh Mehta', 'Dr. Kavita Joshi', 'Dr. Ravi Verma', 'Dr. Meera Iyer',
  'Dr. Arjun Nair', 'Dr. Deepika Agarwal', 'Dr. Rohit Malhotra', 'Dr. Shruti Desai', 'Dr. Karan Shah',
  'Dr. Neha Kapoor', 'Dr. Manish Jain', 'Dr. Pooja Agarwal', 'Dr. Sameer Khan', 'Dr. Radha Krishnan',
  'Dr. Sanjay Kumar', 'Dr. Rekha Singh', 'Dr. Ajay Verma', 'Dr. Sushma Patel', 'Dr. Rakesh Sharma',
  'Dr. Geeta Reddy', 'Dr. Mohan Das', 'Dr. Lakshmi Iyer', 'Dr. Venkatesh Rao', 'Dr. Indira Devi'
];

const doctors = [];
for (let i = 1; i <= 200; i++) {
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
  'Anjali Mehta', 'Suresh Joshi', 'Ravi Verma', 'Meera Iyer', 'Arjun Nair',
  'Deepak Singh', 'Ritu Agarwal', 'Suresh Kumar', 'Pooja Sharma', 'Rajesh Verma',
  'Kavita Reddy', 'Amit Patel', 'Sunita Kumar', 'Rakesh Singh', 'Priya Verma',
  'Suresh Agarwal', 'Anjali Kumar', 'Rajesh Sharma', 'Kavita Patel', 'Amit Singh',
  'Sunita Reddy', 'Rakesh Kumar', 'Priya Sharma', 'Suresh Verma', 'Anjali Patel'
];

const genders = ['Male', 'Female', 'Other'];

const patients = [];
for (let i = 1; i <= 500; i++) {
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

console.log('Creating comprehensive reports over the last 30 days...');

// Define outbreak scenarios with specific patterns
const outbreakScenarios = [
  {
    region: 'Delhi',
    startDay: 5, // Start on day 5
    duration: 15, // Last 15 days
    symptoms: ['SYM001', 'SYM002', 'SYM006'], // Fever, Cough, Shortness of Breath
    intensity: 'high', // High case count
    description: 'Respiratory outbreak in Delhi'
  },
  {
    region: 'Maharashtra',
    startDay: 8,
    duration: 12,
    symptoms: ['SYM010', 'SYM011', 'SYM004'], // Diarrhea, Vomiting, Nausea
    intensity: 'high',
    description: 'Gastrointestinal outbreak in Maharashtra'
  },
  {
    region: 'Karnataka',
    startDay: 12,
    duration: 10,
    symptoms: ['SYM001', 'SYM007', 'SYM012'], // Fever, Body Aches, Chills
    intensity: 'medium',
    description: 'Flu-like outbreak in Karnataka'
  },
  {
    region: 'Tamil Nadu',
    startDay: 18,
    duration: 8,
    symptoms: ['SYM016', 'SYM017', 'SYM015'], // Skin Rash, Joint Pain, Dizziness
    intensity: 'medium',
    description: 'Allergic reaction outbreak in Tamil Nadu'
  },
  {
    region: 'West Bengal',
    startDay: 22,
    duration: 6,
    symptoms: ['SYM018', 'SYM023', 'SYM019'], // Confusion, Memory Loss, Seizures
    intensity: 'low',
    description: 'Neurological symptoms cluster in West Bengal'
  }
];

const reports = [];
const startDate = new Date();
startDate.setDate(startDate.getDate() - 30); // 30 days ago

// Create normal baseline reports (spread throughout the month)
for (let day = 0; day < 30; day++) {
  const currentDate = addDays(startDate, day);
  
  // Create 15-25 normal reports per day
  const normalReportsPerDay = 15 + Math.floor(Math.random() * 11);
  
  for (let i = 0; i < normalReportsPerDay; i++) {
    const reportTime = new Date(currentDate);
    reportTime.setHours(8 + Math.floor(Math.random() * 12)); // 8 AM to 8 PM
    reportTime.setMinutes(Math.floor(Math.random() * 60));
    
    const patient = getRandomItem(patients);
    const doctor = getRandomItem(doctors);
    const clinic = clinics.find(c => c.clinic_id === doctor.clinic_id);
    
    // Random 1-3 symptoms
    const selectedSymptoms = getRandomItems(symptoms, Math.floor(Math.random() * 3) + 1);
    
    const reportSymptoms = selectedSymptoms.map(symptom => {
      const onsetDate = new Date(reportTime);
      onsetDate.setDate(onsetDate.getDate() - Math.floor(Math.random() * 5)); // Symptoms started 0-5 days ago
      
      return {
        symptom_id: symptom.symptom_id,
        onset_date: onsetDate,
        duration: `${Math.floor(Math.random() * 7) + 1} days`
      };
    });
    
    reports.push({
      report_id: `RPT${Date.now()}${day}${i}${Math.random().toString(36).substr(2, 4)}`,
      patient_id: patient.patient_id,
      clinic_id: clinic.clinic_id,
      doctor_id: doctor.doctor_id,
      report_date: reportTime,
      symptoms: reportSymptoms
    });
  }
}

// Create outbreak reports based on scenarios
outbreakScenarios.forEach(scenario => {
  const scenarioStartDate = addDays(startDate, scenario.startDay);
  
  for (let day = 0; day < scenario.duration; day++) {
    const currentDate = addDays(scenarioStartDate, day);
    
    // Get clinics and doctors in the outbreak region
    const regionClinics = clinics.filter(c => c.region === scenario.region);
    const regionDoctors = doctors.filter(d => regionClinics.some(c => c.clinic_id === d.clinic_id));
    
    if (regionClinics.length === 0 || regionDoctors.length === 0) continue;
    
    // Determine case count based on intensity and day (peak in middle)
    let casesPerDay;
    const dayInOutbreak = day;
    const peakDay = Math.floor(scenario.duration / 2);
    
    if (scenario.intensity === 'high') {
      casesPerDay = 8 + Math.floor(Math.random() * 8); // 8-15 cases
    } else if (scenario.intensity === 'medium') {
      casesPerDay = 5 + Math.floor(Math.random() * 6); // 5-10 cases
    } else {
      casesPerDay = 3 + Math.floor(Math.random() * 4); // 3-6 cases
    }
    
    // Peak effect - more cases around the middle of the outbreak
    const distanceFromPeak = Math.abs(dayInOutbreak - peakDay);
    if (distanceFromPeak <= 2) {
      casesPerDay = Math.floor(casesPerDay * 1.5);
    }
    
    for (let i = 0; i < casesPerDay; i++) {
      const reportTime = new Date(currentDate);
      reportTime.setHours(8 + Math.floor(Math.random() * 12));
      reportTime.setMinutes(Math.floor(Math.random() * 60));
      
      const patient = getRandomItem(patients);
      const doctor = getRandomItem(regionDoctors);
      const clinic = regionClinics.find(c => c.clinic_id === doctor.clinic_id);
      
      // Use outbreak-specific symptoms
      const outbreakSymptoms = symptoms.filter(s => scenario.symptoms.includes(s.symptom_id));
      const selectedSymptoms = getRandomItems(outbreakSymptoms, Math.floor(Math.random() * outbreakSymptoms.length) + 1);
      
      const reportSymptoms = selectedSymptoms.map(symptom => {
        const onsetDate = new Date(reportTime);
        onsetDate.setDate(onsetDate.getDate() - Math.floor(Math.random() * 3)); // Symptoms started 0-3 days ago
        
        return {
          symptom_id: symptom.symptom_id,
          onset_date: onsetDate,
          duration: `${Math.floor(Math.random() * 5) + 1} days`
        };
      });
      
      reports.push({
        report_id: `OUT${scenario.region}${day}${i}${Math.random().toString(36).substr(2, 4)}`,
        patient_id: patient.patient_id,
        clinic_id: clinic.clinic_id,
        doctor_id: doctor.doctor_id,
        report_date: reportTime,
        symptoms: reportSymptoms
      });
    }
  }
});

// Create some cluster reports (multiple symptoms affecting multiple patients in same area)
for (let day = 10; day < 25; day++) {
  const currentDate = addDays(startDate, day);
  
  // Create 2-3 clusters per day
  const clustersPerDay = 2 + Math.floor(Math.random() * 2);
  
  for (let cluster = 0; cluster < clustersPerDay; cluster++) {
    const region = getRandomItem(outbreakRegions);
    const regionClinics = clinics.filter(c => c.region === region);
    const regionDoctors = doctors.filter(d => regionClinics.some(c => c.clinic_id === d.clinic_id));
    
    if (regionClinics.length === 0 || regionDoctors.length === 0) continue;
    
    const clusterSize = 3 + Math.floor(Math.random() * 4); // 3-6 patients per cluster
    const clusterSymptoms = getRandomItems(symptoms, 3 + Math.floor(Math.random() * 3)); // 3-5 symptoms
    
    for (let i = 0; i < clusterSize; i++) {
      const reportTime = new Date(currentDate);
      reportTime.setHours(9 + Math.floor(Math.random() * 8)); // 9 AM to 5 PM
      reportTime.setMinutes(Math.floor(Math.random() * 60));
      
      const patient = getRandomItem(patients);
      const doctor = getRandomItem(regionDoctors);
      const clinic = regionClinics.find(c => c.clinic_id === doctor.clinic_id);
      
      const reportSymptoms = clusterSymptoms.map(symptom => {
        const onsetDate = new Date(reportTime);
        onsetDate.setDate(onsetDate.getDate() - Math.floor(Math.random() * 2)); // Symptoms started 0-2 days ago
        
        return {
          symptom_id: symptom.symptom_id,
          onset_date: onsetDate,
          duration: `${Math.floor(Math.random() * 4) + 1} days`
        };
      });
      
      reports.push({
        report_id: `CLUSTER${day}${cluster}${i}${Math.random().toString(36).substr(2, 4)}`,
        patient_id: patient.patient_id,
        clinic_id: clinic.clinic_id,
        doctor_id: doctor.doctor_id,
        report_date: reportTime,
        symptoms: reportSymptoms
      });
    }
  }
}

await Report.insertMany(reports);
console.log(`Created ${reports.length} reports over 30 days`);

// Create some historical outbreaks based on the data patterns
console.log('Creating historical outbreak records...');

const historicalOutbreaks = [
  {
    outbreak_id: 'OUT001',
    start_date: addDays(startDate, 5),
    end_date: addDays(startDate, 20),
    status: 'Resolved',
    description: 'Respiratory outbreak in Delhi - Successfully contained',
    symptoms: [
      { symptom_id: 'SYM001', cases_count: 45, threshold: 5, is_threshold_exceeded: true },
      { symptom_id: 'SYM002', cases_count: 38, threshold: 3, is_threshold_exceeded: true },
      { symptom_id: 'SYM006', cases_count: 12, threshold: 2, is_threshold_exceeded: true }
    ],
    region: 'Delhi'
  },
  {
    outbreak_id: 'OUT002',
    start_date: addDays(startDate, 8),
    end_date: addDays(startDate, 20),
    status: 'Contained',
    description: 'Gastrointestinal outbreak in Maharashtra - Under control',
    symptoms: [
      { symptom_id: 'SYM010', cases_count: 32, threshold: 2, is_threshold_exceeded: true },
      { symptom_id: 'SYM011', cases_count: 28, threshold: 2, is_threshold_exceeded: true },
      { symptom_id: 'SYM004', cases_count: 35, threshold: 3, is_threshold_exceeded: true }
    ],
    region: 'Maharashtra'
  },
  {
    outbreak_id: 'OUT003',
    start_date: addDays(startDate, 12),
    status: 'Active',
    description: 'Flu-like outbreak in Karnataka - Ongoing investigation',
    symptoms: [
      { symptom_id: 'SYM001', cases_count: 25, threshold: 5, is_threshold_exceeded: true },
      { symptom_id: 'SYM007', cases_count: 18, threshold: 3, is_threshold_exceeded: true },
      { symptom_id: 'SYM012', cases_count: 15, threshold: 3, is_threshold_exceeded: true }
    ],
    region: 'Karnataka'
  },
  {
    outbreak_id: 'OUT004',
    start_date: addDays(startDate, 18),
    status: 'Investigation',
    description: 'Allergic reaction cluster in Tamil Nadu - Under investigation',
    symptoms: [
      { symptom_id: 'SYM016', cases_count: 8, threshold: 3, is_threshold_exceeded: true },
      { symptom_id: 'SYM017', cases_count: 6, threshold: 3, is_threshold_exceeded: true },
      { symptom_id: 'SYM015', cases_count: 7, threshold: 3, is_threshold_exceeded: true }
    ],
    region: 'Tamil Nadu'
  },
  {
    outbreak_id: 'OUT005',
    start_date: addDays(startDate, 22),
    status: 'Investigation',
    description: 'Neurological symptoms cluster in West Bengal - Early investigation',
    symptoms: [
      { symptom_id: 'SYM018', cases_count: 4, threshold: 2, is_threshold_exceeded: true },
      { symptom_id: 'SYM023', cases_count: 3, threshold: 2, is_threshold_exceeded: true },
      { symptom_id: 'SYM019', cases_count: 2, threshold: 2, is_threshold_exceeded: false }
    ],
    region: 'West Bengal'
  }
];

await Outbreak.insertMany(historicalOutbreaks);
console.log(`Created ${historicalOutbreaks.length} historical outbreak records`);

console.log('\n🎉 Comprehensive database seeding completed successfully!');
console.log('\n📊 Summary:');
console.log(`- ${symptoms.length} symptoms`);
console.log(`- ${clinics.length} clinics across ${regions.length} regions`);
console.log(`- ${doctors.length} doctors`);
console.log(`- ${patients.length} patients`);
console.log(`- ${reports.length} reports over 30 days`);
console.log(`- ${historicalOutbreaks.length} outbreak records`);

console.log('\n🎯 Outbreak Scenarios Created:');
outbreakScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.description}`);
  console.log(`   - Region: ${scenario.region}`);
  console.log(`   - Duration: ${scenario.duration} days`);
  console.log(`   - Intensity: ${scenario.intensity}`);
  console.log(`   - Symptoms: ${scenario.symptoms.join(', ')}`);
});

console.log('\n🔍 The system now has realistic outbreak patterns that should trigger detection!');
console.log('   - Delhi: Respiratory outbreak (Days 5-20)');
console.log('   - Maharashtra: Gastrointestinal outbreak (Days 8-20)');
console.log('   - Karnataka: Flu-like outbreak (Days 12-22)');
console.log('   - Tamil Nadu: Allergic reaction cluster (Days 18-26)');
console.log('   - West Bengal: Neurological cluster (Days 22-28)');

// Close database connection
await mongoose.connection.close();
console.log('\nDatabase connection closed.');
