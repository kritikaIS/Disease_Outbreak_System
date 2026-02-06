import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  patient_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    maxlength: 10
  },
  address: {
    type: String,
    maxlength: 255
  },
  phone: {
    type: String,
    maxlength: 20
  }
}, {
  timestamps: true
});

// Create index for better query performance
patientSchema.index({ dob: 1 });
patientSchema.index({ gender: 1 });

export default mongoose.model('Patient', patientSchema);
