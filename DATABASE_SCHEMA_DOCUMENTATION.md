# Disease Outbreak Monitoring System - Database Schema

## Overview
This document contains the complete database schema for the Disease Outbreak Monitoring System. The system uses MongoDB with Mongoose ODM for data modeling and includes comprehensive indexing for optimal performance.

## Schema Files

### 1. Doctor Model (`server/models/Doctor.js`)

```javascript
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
```

**Fields:**
- `doctor_id`: Unique identifier for the doctor
- `name`: Doctor's full name (required, max 100 chars)
- `specialty`: Medical specialty (max 100 chars)
- `clinic_id`: Reference to clinic (foreign key)
- `email`: Unique email address
- `password`: Hashed password (required)
- `region`: Geographic region
- `phone`: Contact phone number

**Indexes:**
- `clinic_id`: For efficient clinic-based queries
- `specialty`: For specialty-based filtering

---

### 2. Clinic Model (`server/models/Clinic.js`)

```javascript
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
```

**Fields:**
- `clinic_id`: Unique identifier for the clinic
- `name`: Clinic name (required, max 100 chars)
- `address`: Physical address (max 255 chars)
- `region`: Indian state (enum validation)
- `type`: Type of healthcare facility

**Indexes:**
- `region`: For geographic queries
- `type`: For facility type filtering

---

### 3. Patient Model (`server/models/Patient.js`)

```javascript
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
```

**Fields:**
- `patient_id`: Unique identifier for the patient
- `name`: Patient's full name (required, max 100 chars)
- `dob`: Date of birth (required)
- `gender`: Gender (enum: Male, Female, Other)
- `address`: Patient's address (max 255 chars)
- `phone`: Contact phone number

**Indexes:**
- `dob`: For age-based queries
- `gender`: For demographic analysis

---

### 4. Symptom Model (`server/models/Symptom.js`)

```javascript
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
```

**Fields:**
- `symptom_id`: Unique identifier for the symptom
- `name`: Symptom name (required, max 100 chars)
- `description`: Detailed description
- `severity`: Severity level (enum: Low, Medium, High)

**Indexes:**
- `severity`: For severity-based filtering
- `name`: Text index for search functionality

---

### 5. Report Model (`server/models/Report.js`)

```javascript
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
```

**Fields:**
- `report_id`: Unique identifier for the report
- `patient_id`: Reference to patient (foreign key)
- `clinic_id`: Reference to clinic (foreign key)
- `doctor_id`: Reference to doctor (foreign key)
- `report_date`: Date of report creation
- `symptoms`: Array of symptom objects with onset date and duration

**Indexes:**
- `report_date`: For temporal queries
- `patient_id`: For patient-specific reports
- `clinic_id`: For clinic-based analysis
- `doctor_id`: For doctor-specific reports

---

### 6. Outbreak Model (`server/models/Outbreak.js`)

```javascript
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
```

**Fields:**
- `outbreak_id`: Unique identifier for the outbreak
- `start_date`: Outbreak start date (required)
- `end_date`: Outbreak end date (optional)
- `status`: Outbreak status (enum: Active, Contained, Resolved, Investigation)
- `description`: Outbreak description
- `symptoms`: Array of symptom statistics with thresholds
- `region`: Geographic region (Indian state)

**Indexes:**
- `status`: For status-based filtering
- `start_date`: For temporal analysis
- `region`: For geographic queries

**Methods:**
- `checkThresholds()`: Updates threshold exceeded flags

---

### 7. Public User Model (`server/models/PublicUser.js`)

```javascript
import mongoose from 'mongoose';

const publicUserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String 
  }
}, { 
  timestamps: true 
});

publicUserSchema.index({ email: 1 });

export default mongoose.model('PublicUser', publicUserSchema);
```

**Fields:**
- `email`: User email (required, unique)
- `password`: Hashed password (required)
- `name`: User's name

**Indexes:**
- `email`: For efficient email-based queries

---

### 8. Public Report Model (`server/models/PublicReport.js`)

```javascript
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
```

**Fields:**
- `report_id`: Unique identifier for the report
- `symptoms_text`: Text description of symptoms (required, max 500 chars)
- `symptom_type`: Category of symptoms
- `state`: Geographic state (required)
- `severity`: Severity level
- `patient_age`: Age of patient
- `additional_notes`: Additional information
- `public_user_id`: Reference to public user
- `submitted_at`: Submission timestamp

**Indexes:**
- `state, submitted_at`: Compound index for geographic and temporal queries

---

## Database Relationships

### Entity Relationships:
1. **Doctor** → **Clinic** (Many-to-One)
2. **Doctor** → **Report** (One-to-Many)
3. **Patient** → **Report** (One-to-Many)
4. **Clinic** → **Report** (One-to-Many)
5. **Report** → **Symptom** (Many-to-Many)
6. **Outbreak** → **Symptom** (Many-to-Many)
7. **PublicUser** → **PublicReport** (One-to-Many)

### Key Relationships:
- Doctors belong to clinics
- Reports link patients, doctors, and clinics
- Reports contain multiple symptoms
- Outbreaks track symptom statistics
- Public users can submit public reports

## Indexing Strategy

### Primary Indexes:
- All collections have `_id` as primary key
- Unique fields have unique indexes

### Performance Indexes:
- **Geographic**: `region`, `state` for location-based queries
- **Temporal**: `report_date`, `start_date`, `submitted_at` for time-based analysis
- **Foreign Keys**: `clinic_id`, `doctor_id`, `patient_id` for relationship queries
- **Search**: Text indexes on `name` fields for full-text search
- **Filtering**: `status`, `severity`, `gender` for categorical filtering

### Compound Indexes:
- `{ state: 1, submitted_at: -1 }` for geographic and temporal queries
- `{ region: 1, status: 1 }` for regional outbreak analysis

## Data Validation

### Required Fields:
- All ID fields are required and unique
- Critical fields like `name`, `email`, `password` are required
- Date fields have proper validation

### Enum Constraints:
- `gender`: Male, Female, Other
- `severity`: Low, Medium, High
- `status`: Active, Contained, Resolved, Investigation
- `region`: Indian states list

### Length Constraints:
- String fields have appropriate maxlength constraints
- Text fields have reasonable size limits

## Performance Considerations

### Query Optimization:
- Indexes are designed for common query patterns
- Compound indexes support multi-field queries
- Text indexes enable full-text search

### Data Integrity:
- Unique constraints prevent duplicate data
- Foreign key references maintain relationships
- Enum validation ensures data consistency

### Scalability:
- Schema design supports horizontal scaling
- Indexes are optimized for large datasets
- Embedded documents reduce query complexity

This schema provides a robust foundation for the Disease Outbreak Monitoring System with comprehensive data modeling, efficient indexing, and strong data integrity constraints.
