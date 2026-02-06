import mongoose from 'mongoose';

const symptomSchema = new mongoose.Schema({
  symptom_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  }
}, {
  timestamps: true
});

// Create index for better query performance
symptomSchema.index({ severity: 1 });
symptomSchema.index({ name: 'text' });

export default mongoose.model('Symptom', symptomSchema);
