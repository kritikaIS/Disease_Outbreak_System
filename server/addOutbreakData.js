import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import models
import Clinic from './models/Clinic.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Report from './models/Report.js';

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to database
await connectDB();

console.log('Adding more outbreak-triggering data...');

// Get existing data
const clinics = await Clinic.find({});
const doctors = await Doctor.find({});
const patients = await Patient.find({});

// Helper functions
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return new Date(start + Math.random() * (end - start));
}

// Create more reports with specific symptom patterns to trigger outbreaks
const additionalReports = [];

// 1. Create more fever cases in Delhi (last 2 days)
const delhiClinics = clinics.filter(c => c.region === 'Delhi');
const delhiDoctors = doctors.filter(d => delhiClinics.some(c => c.clinic_id === d.clinic_id));

for (let i = 1; i <= 15; i++) {
  const reportDate = getRandomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), new Date());
  const patient = getRandomItem(patients);
  const doctor = getRandomItem(delhiDoctors);
  const clinic = delhiClinics.find(c => c.clinic_id === doctor.clinic_id);
  
  additionalReports.push({
    report_id: `FEVER${Date.now()}${i}`,
    patient_id: patient.patient_id,
    clinic_id: clinic.clinic_id,
    doctor_id: doctor.doctor_id,
    report_date: reportDate,
    symptoms: [
      {
        symptom_id: 'SYM001', // Fever
        onset_date: new Date(reportDate.getTime() - Math.random() * 24 * 60 * 60 * 1000),
        duration: `${Math.floor(Math.random() * 3) + 1} days`
      },
      {
        symptom_id: 'SYM002', // Cough
        onset_date: new Date(reportDate.getTime() - Math.random() * 12 * 60 * 60 * 1000),
        duration: `${Math.floor(Math.random() * 5) + 1} days`
      }
    ]
  });
}

// 2. Create gastrointestinal cases in Maharashtra (last 3 days)
const maharashtraClinics = clinics.filter(c => c.region === 'Maharashtra');
const maharashtraDoctors = doctors.filter(d => maharashtraClinics.some(c => c.clinic_id === d.clinic_id));

for (let i = 1; i <= 12; i++) {
  const reportDate = getRandomDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), new Date());
  const patient = getRandomItem(patients);
  const doctor = getRandomItem(maharashtraDoctors);
  const clinic = maharashtraClinics.find(c => c.clinic_id === doctor.clinic_id);
  
  additionalReports.push({
    report_id: `GASTRO${Date.now()}${i}`,
    patient_id: patient.patient_id,
    clinic_id: clinic.clinic_id,
    doctor_id: doctor.doctor_id,
    report_date: reportDate,
    symptoms: [
      {
        symptom_id: 'SYM010', // Diarrhea
        onset_date: new Date(reportDate.getTime() - Math.random() * 6 * 60 * 60 * 1000),
        duration: `${Math.floor(Math.random() * 4) + 1} days`
      },
      {
        symptom_id: 'SYM011', // Vomiting
        onset_date: new Date(reportDate.getTime() - Math.random() * 3 * 60 * 60 * 1000),
        duration: `${Math.floor(Math.random() * 3) + 1} days`
      },
      {
        symptom_id: 'SYM004', // Nausea
        onset_date: new Date(reportDate.getTime() - Math.random() * 12 * 60 * 60 * 1000),
        duration: `${Math.floor(Math.random() * 5) + 1} days`
      }
    ]
  });
}

// 3. Create respiratory cases in Karnataka (last 4 days)
const karnatakaClinics = clinics.filter(c => c.region === 'Karnataka');
const karnatakaDoctors = doctors.filter(d => karnatakaClinics.some(c => c.clinic_id === d.clinic_id));

for (let i = 1; i <= 10; i++) {
  const reportDate = getRandomDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), new Date());
  const patient = getRandomItem(patients);
  const doctor = getRandomItem(karnatakaDoctors);
  const clinic = karnatakaClinics.find(c => c.clinic_id === doctor.clinic_id);
  
  additionalReports.push({
    report_id: `RESP${Date.now()}${i}`,
    patient_id: patient.patient_id,
    clinic_id: clinic.clinic_id,
    doctor_id: doctor.doctor_id,
    report_date: reportDate,
    symptoms: [
      {
        symptom_id: 'SYM006', // Shortness of Breath
        onset_date: new Date(reportDate.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000),
        duration: `${Math.floor(Math.random() * 6) + 1} days`
      },
      {
        symptom_id: 'SYM002', // Cough
        onset_date: new Date(reportDate.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        duration: `${Math.floor(Math.random() * 7) + 1} days`
      },
      {
        symptom_id: 'SYM008', // Sore Throat
        onset_date: new Date(reportDate.getTime() - Math.random() * 24 * 60 * 60 * 1000),
        duration: `${Math.floor(Math.random() * 5) + 1} days`
      }
    ]
  });
}

// Insert all additional reports
await Report.insertMany(additionalReports);

console.log(`✅ Added ${additionalReports.length} additional outbreak-triggering reports:`);
console.log(`   - ${15} fever cases in Delhi`);
console.log(`   - ${12} gastrointestinal cases in Maharashtra`);
console.log(`   - ${10} respiratory cases in Karnataka`);

console.log('\n🎯 These reports should trigger outbreak detection when you run the analysis!');

// Close database connection
await mongoose.connection.close();
console.log('\nDatabase connection closed.');
