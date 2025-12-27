# 🏥 Diavise - Diabetes Symptom Collector & Suggestion System

A comprehensive AI-powered diabetes management system featuring risk assessment, personalized health recommendations, and real-time chat assistance.

## 📋 Features

- **🔍 AI Risk Assessment**: XGBoost + LLM hybrid model for diabetes risk prediction
- **📊 Comprehensive Analytics Dashboard**: Real-time health metrics visualization
- **🍎 Personalized Diet Plans**: AI-generated regional diet recommendations with PDF reports
- **💪 Exercise Plans**: Tailored workout routines based on health profile
- **💊 Lifestyle Tips**: Customized health suggestions and medication guidance
- **🤖 RAG-Powered Chat Assistant**: Medical Q&A using ChromaDB and LM Studio
- **📧 Email Reports**: Automated PDF reports sent to user email
- **🔐 Data Security**: AES-256-GCM encryption for sensitive health data
- **📱 Cross-Platform**: Web (React) and Mobile (React Native/Expo) applications

## 🏗️ Project Structure

```
├── backend/          # Node.js/Express REST API server
├── frontend/         # React web application with Vite
├── mobile-app/       # React Native mobile app with Expo
└── README.md         # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ (v22.18.0 recommended)
- **MongoDB**: v5.0+ (running on localhost:27017)
- **LM Studio**: Running Diabetica-7B model on localhost:1234
- **ChromaDB**: Running on localhost:8000
- **Python**: 3.9+ (for ML model)

### Installation

#### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file with the following:
# MONGODB_URI=mongodb://localhost:27017/diabetes_system
# JWT_SECRET=your_jwt_secret_key_here_min_32_chars
# ENCRYPTION_KEY=your_encryption_key_32_chars_hex
# PORT=5000
# LM_STUDIO_BASE_URL=http://127.0.0.1:1234
# LM_STUDIO_MODEL=waltonfuture-diabetica-7b
# CHROMA_DB_HOST=http://127.0.0.1:8000
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=465
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password

# Seed the database (optional, for initial data)
node seed.js

# Start the server
node server.js
# or with nodemon for development
npx nodemon server.js
```

**Backend will run on**: `http://localhost:5000`

#### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env file with:
# VITE_API_URL=http://localhost:5000/api/v1

# Start development server
npm run dev
```

**Frontend will run on**: `http://localhost:5173`

#### 3. Mobile App Setup

```bash
cd mobile-app
npm install

# Update API URL in app code if needed
# File: config/api.js or wherever API base URL is defined

# Start Expo development server
npm start
# or
npx expo start

# Then scan QR code with Expo Go app (Android/iOS)
```

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/diabetes_system` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key_min_32_characters` |
| `ENCRYPTION_KEY` | 32-char hex key for AES-256 | Generate with Node crypto |
| `PORT` | Backend server port | `5000` |
| `LM_STUDIO_BASE_URL` | LM Studio API endpoint | `http://127.0.0.1:1234` |
| `LM_STUDIO_MODEL` | LLM model name | `waltonfuture-diabetica-7b` |
| `CHROMA_DB_HOST` | ChromaDB server URL | `http://127.0.0.1:8000` |
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `465` |
| `EMAIL_USER` | Email account | `your_email@gmail.com` |
| `EMAIL_PASS` | Email app password | `your_app_specific_password` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |

## 📦 Technology Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **AI/ML**: 
  - XGBoost (Python) for diabetes prediction
  - LM Studio (Diabetica-7B) for medical reasoning
  - ChromaDB for RAG-based document retrieval
  - Xenova/Transformers for embeddings
- **Authentication**: JWT with bcrypt
- **Encryption**: AES-256-GCM for PII data
- **PDF Generation**: PDFKit
- **Email**: Nodemailer

### Frontend
- **Framework**: React 18 with Vite
- **UI Library**: Material-UI (MUI) v7
- **Charts**: Chart.js, ApexCharts, ECharts
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Routing**: React Router v7

### Mobile App
- **Framework**: React Native with Expo SDK 54
- **UI Library**: React Native Paper
- **Navigation**: React Navigation v7
- **HTTP Client**: Axios
- **Storage**: AsyncStorage

## 🎯 Key Features Details

### 1. Risk Assessment
- **Hybrid AI Model**: Combines XGBoost statistical analysis with LLM medical reasoning
- **512-sample trained model**: Achieves high accuracy in diabetes prediction
- **14 symptom categories**: Comprehensive questionnaire
- **Confidence scoring**: Provides prediction confidence levels

### 2. Personalized Health Plans
- **Diet Plans**: Regional cuisine-based meal plans with nutritional analysis
- **Exercise Plans**: MET-based workout routines tailored to fitness level
- **Lifestyle Tips**: Medication reminders, sleep hygiene, stress management
- **PDF Reports**: Professional medical-style reports emailed automatically

### 3. RAG-Powered Chat
- **ChromaDB Integration**: Vector database for medical document retrieval
- **LM Studio**: Local LLM for medical Q&A
- **Source Citation**: Shows document sources for answers
- **Context-aware**: Maintains conversation history

### 4. Security & Privacy
- **Field-level Encryption**: AES-256-GCM for PII (name, DOB, medical data)
- **JWT Authentication**: Secure token-based auth with httpOnly cookies
- **Audit Logging**: Comprehensive audit trail for all operations
- **HIPAA-aligned**: Data handling follows healthcare privacy standards

## 📱 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Risk Assessment
- `GET /api/v1/questions/:diseaseId` - Get questionnaire
- `POST /api/v1/questions/answer` - Submit answer
- `POST /api/v1/assessment/assess/:diseaseId` - Calculate risk

### Health Plans
- `POST /api/v1/diet-plan/generate` - Generate diet plan
- `GET /api/v1/diet-plan/history` - Get diet plan history
- `POST /api/v1/exercise-plan/generate` - Generate exercise plan
- `GET /api/v1/exercise-plan/history` - Get exercise plans
- `POST /api/v1/lifestyle-tips/generate` - Generate lifestyle tips

### Chat Assistant
- `POST /api/v1/chat/complete` - Send chat message

### Analytics
- `GET /api/v1/analytics/dashboard` - Get dashboard metrics
- `GET /api/v1/audit-logs` - Get audit logs

## 🚢 Deployment

### Backend Deployment

```bash
# Build is not required for Node.js, but ensure:
# 1. All dependencies are installed
npm install --production

# 2. Environment variables are set
# 3. MongoDB is accessible
# 4. LM Studio and ChromaDB are running

# Start with PM2 (recommended for production)
npm install -g pm2
pm2 start server.js --name diabetes-backend

# Or use a process manager like systemd
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Output will be in dist/ folder
# Deploy dist/ to:
# - Netlify
# - Vercel
# - AWS S3 + CloudFront
# - Nginx/Apache server

# Update VITE_API_URL in .env.production before building
```

### Mobile App Deployment

```bash
# Build for Android
npx expo build:android

# Build for iOS (requires Mac)
npx expo build:ios

# Or use EAS Build (recommended)
npm install -g eas-cli
eas build --platform android
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## 🧪 Testing

The project includes comprehensive API endpoints. Test using:
- **Postman/Insomnia**: Import API collection
- **Frontend UI**: Built-in testing through user interface
- **Mobile App**: Test on Expo Go or physical devices

## 📄 License

This project is part of an academic Final Year Project (FYP).

## 👥 Contributors

Developed as part of Final Year Project (FYP) at [Your University Name].

## 📞 Support

For issues or questions:
1. Check the API documentation
2. Review environment variable configuration
3. Ensure all services (MongoDB, LM Studio, ChromaDB) are running
4. Check backend logs for error details

## 🔄 Recent Updates

- ✅ Email reporting system with PDF attachments
- ✅ Risk assessment email automation
- ✅ Exercise plan precautions field parsing fix
- ✅ Chat interface user message visibility fix
- ✅ Date generation timezone fix for plan creation

---

**Built with ❤️ using React, Node.js, and AI**
