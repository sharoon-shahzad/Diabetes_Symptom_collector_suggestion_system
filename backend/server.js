import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { ensureRolesExist } from './utils/roleUtils.js';
import authRoutes from './routes/authRoute.js';
import userRoutes from './routes/userRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import diseaseRoutes from './routes/diseaseRoutes.js';
import symptomRoutes from './routes/symptomRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import queryRoutes from './routes/queryRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Connect to database and ensure roles exist
const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ Database connected successfully');
        
        // Ensure all required roles exist
        await ensureRolesExist();
        
        // Start the server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/diseases', diseaseRoutes);
app.use('/api/v1/symptoms', symptomRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/assessment', assessmentRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/admin/docs', documentRoutes);
app.use('/api/v1/query', queryRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Catch-all for unsupported GET requests
app.get('*', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Start the server
startServer();