# Outbreak Watch - Disease Outbreak Detection System

A comprehensive MERN stack application for real-time disease surveillance and outbreak detection. The system monitors symptoms reported from various localities and flags potential outbreaks when symptom counts exceed predefined thresholds.

## Features

### Backend (Node.js + Express + MongoDB + Mongoose)
- **Complete CRUD APIs** for all entities (Clinic, Doctor, Patient, Report, Symptom, Outbreak)
- **Authentication System** with JWT tokens for secure access
- **Search and Filter APIs** with pagination support
- **Outbreak Detection Logic** with configurable thresholds
- **Data Relationships** with proper population and validation
- **Sample Seed Data** for testing and development

### Frontend (React + JavaScript + Tailwind CSS)
- **Responsive Dashboard** with real-time statistics
- **Interactive Charts** for symptom trends and outbreak visualization
- **Regional Outbreak Map** showing disease patterns by location
- **Symptom Reporting Form** for healthcare professionals
- **Authentication Modal** with clinic and public access options
- **Modern UI Components** using shadcn/ui and Lucide icons

## Project Structure

```
outbreak-watch/
├── server/                 # Backend API
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Authentication & validation
│   ├── config/            # Database configuration
│   ├── scripts/           # Seed data script
│   └── server.js          # Main server file
├── src/                   # Frontend React app
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions
└── public/                # Static assets
```

## Database Schema

The system uses the following entities with proper relationships:

- **Clinic**: Healthcare facilities with location and type information
- **Doctor**: Healthcare professionals linked to clinics
- **Patient**: Patient records with demographic information
- **Symptom**: Symptom definitions with severity levels
- **Report**: Medical reports linking patients, doctors, clinics, and symptoms
- **Outbreak**: Outbreak tracking with threshold monitoring

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `config.env` and update the MongoDB connection string
   - Update JWT secret for production use

4. **Start MongoDB:**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/outbreak-watch`

5. **Seed the database:**
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:8080`

### Quick Start (Both Services)

From the project root, you can run:

```bash
# Start backend server
npm run server

# In another terminal, start frontend
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new doctor
- `POST /api/auth/login` - Login doctor
- `GET /api/auth/profile` - Get current user profile

### Entities
- `GET/POST /api/clinics` - Manage clinics
- `GET/POST /api/doctors` - Manage doctors
- `GET/POST /api/patients` - Manage patients
- `GET/POST /api/symptoms` - Manage symptoms
- `GET/POST /api/reports` - Manage medical reports
- `GET/POST /api/outbreaks` - Manage outbreaks

### Special Features
- `POST /api/outbreaks/:id/analyze` - Analyze outbreak data
- `GET /api/outbreaks/:id/stats` - Get outbreak statistics

## Demo Credentials

After seeding the database, you can use these credentials:

**Email:** `sarah.johnson@hospital.com`  
**Password:** `password123`

## Key Features

### Outbreak Detection
- Automatic threshold monitoring for symptom counts
- Real-time outbreak status updates
- Regional analysis and reporting

### Data Management
- Complete CRUD operations for all entities
- Search and filtering capabilities
- Pagination for large datasets
- Data validation and error handling

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and middleware
- Input validation and sanitization

### User Interface
- Responsive design for desktop and mobile
- Real-time data visualization
- Interactive charts and maps
- Modern, accessible UI components

## Development

### Adding New Features
1. Create Mongoose models in `server/models/`
2. Add API routes in `server/routes/`
3. Update frontend components in `src/components/`
4. Test with the seeded data

### Database Operations
- Use the seed script to populate test data
- Modify `server/scripts/seedData.js` for custom data
- Run `npm run seed` to reset and populate database

## Production Deployment

1. **Environment Variables:**
   - Set `NODE_ENV=production`
   - Use secure JWT secret
   - Configure production MongoDB URI

2. **Build Frontend:**
   ```bash
   npm run build
   ```

3. **Start Production Server:**
   ```bash
   npm run server:start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please create an issue in the repository or contact the development team.