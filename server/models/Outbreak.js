import mongoose from 'mongoose';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

const outbreakSchema = new mongoose.Schema({
  outbreak_id: {
    type: String,
    required: true,
    unique: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Contained', 'Resolved', 'Investigation'],
    default: 'Investigation'
  },
  description: {
    type: String
  },
  symptoms: [{
    symptom_id: {
      type: String,
      ref: 'Symptom'
    },
    cases_count: {
      type: Number,
      default: 0
    },
    threshold: {
      type: Number,
      required: true
    },
    is_threshold_exceeded: {
      type: Boolean,
      default: false
    }
  }],
  region: {
    type: String,
    required: true,
    enum: INDIAN_STATES
  }
}, {
  timestamps: true
});

// Create index for better query performance
outbreakSchema.index({ status: 1 });
outbreakSchema.index({ start_date: 1 });
outbreakSchema.index({ region: 1 });

// Method to check if threshold is exceeded
outbreakSchema.methods.checkThresholds = function() {
  this.symptoms.forEach(symptom => {
    symptom.is_threshold_exceeded = symptom.cases_count > symptom.threshold;
  });
  return this;
};

export default mongoose.model('Outbreak', outbreakSchema);
