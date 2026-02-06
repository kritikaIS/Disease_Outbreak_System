import mongoose from 'mongoose';

const publicReportSchema = new mongoose.Schema({
  report_id: {
    type: String,
    required: true,
    unique: true
  },
  symptoms_text: {
    type: String,
    required: true,
    maxlength: 500
  },
  symptom_type: {
    type: String
  },
  state: {
    type: String,
    required: true
  },
  severity: {
    type: String
  },
  patient_age: {
    type: String
  },
  additional_notes: {
    type: String
  },
  public_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicUser'
  },
  submitted_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

publicReportSchema.index({ state: 1, submitted_at: -1 });

export default mongoose.model('PublicReport', publicReportSchema);


