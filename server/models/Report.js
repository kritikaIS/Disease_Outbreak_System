import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  report_id: {
    type: String,
    required: true,
    unique: true
  },
  patient_id: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  clinic_id: {
    type: String,
    required: true,
    ref: 'Clinic'
  },
  doctor_id: {
    type: String,
    required: true,
    ref: 'Doctor'
  },
  report_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  symptoms: [{
    symptom_id: {
      type: String,
      ref: 'Symptom'
    },
    onset_date: {
      type: Date
    },
    duration: {
      type: String,
      maxlength: 50
    }
  }]
}, {
  timestamps: true
});

// Create index for better query performance
reportSchema.index({ report_date: 1 });
reportSchema.index({ patient_id: 1 });
reportSchema.index({ clinic_id: 1 });
reportSchema.index({ doctor_id: 1 });

export default mongoose.model('Report', reportSchema);
