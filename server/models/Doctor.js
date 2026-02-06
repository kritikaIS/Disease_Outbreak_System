import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  doctor_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  specialty: {
    type: String,
    maxlength: 100
  },
  clinic_id: {
    type: String,
    ref: 'Clinic'
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: true
  },
  region: {
    type: String,
    maxlength: 100
  },
  phone: {
    type: String,
    maxlength: 20
  }
}, {
  timestamps: true
});

// Create index for better query performance
doctorSchema.index({ clinic_id: 1 });
doctorSchema.index({ specialty: 1 });

export default mongoose.model('Doctor', doctorSchema);
