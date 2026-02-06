import mongoose from 'mongoose';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

const clinicSchema = new mongoose.Schema({
  clinic_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  address: {
    type: String,
    maxlength: 255
  },
  region: {
    type: String,
    maxlength: 100,
    enum: INDIAN_STATES
  },
  type: {
    type: String,
    maxlength: 50
  }
}, {
  timestamps: true
});

// Create index for better query performance
clinicSchema.index({ region: 1 });
clinicSchema.index({ type: 1 });

export default mongoose.model('Clinic', clinicSchema);
