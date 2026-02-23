// Load environment variables FIRST using ESM-friendly entry
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env located next to this file (ensures correct .env is used even if cwd differs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from', envPath);
import fs from 'fs';
console.log('.env exists:', fs.existsSync(envPath));
const result = dotenv.config({ path: envPath });
if (result.error) console.warn('dotenv.load error:', result.error);

// Show presence of critical secrets (do not log actual secrets)
console.log('ENV: JWT_SECRET set=', !!process.env.JWT_SECRET);
console.log('ENV: REFRESH_TOKEN_SECRET set=', !!process.env.REFRESH_TOKEN_SECRET);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { ensureRolesExist, ensureRolePermissions } from './utils/roleUtils.js';
import { initializeEmbeddingModel } from './services/embeddingService.js';
import { initializeQdrantDB } from './services/qdrantService.js';
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
import personalizedSystemRoutes from './routes/personalizedSystemRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import dietPlanRoutes from './routes/dietPlanRoutes.js';
import monthlyDietPlanRoutes from './routes/monthlyDietPlanRoutes.js';
import exercisePlanRoutes from './routes/exercisePlanRoutes.js';
import lifestyleTipsRoutes from './routes/lifestyleTipsRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import adminFeedbackRoutes from './routes/adminFeedbackRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import testSettingsRoutes from './routes/testSettingsRoutes.js';
import prioritiesRoutes from './routes/priorities.js';
import habitsRoutes from './routes/habitsRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { captureAuditContext } from './middlewares/auditMiddleware.js';
import AuditLog from './models/AuditLog.js';
import os from 'os';

const app = express();

// Helper function to get local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true, // Accept all origins (for mobile app development)
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Add audit context capture middleware globally
app.use(captureAuditContext);

// Server info endpoint for mobile app auto-discovery
app.get('/api/v1/server-info', (req, res) => {
  const localIP = getLocalIPAddress();
  const port = process.env.PORT || 5000;
  res.json({
    success: true,
    data: {
      ip: localIP,
      port: port,
      apiUrl: `http://${localIP}:${port}/api/v1`,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// Connect to database and ensure roles exist
const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ Database connected successfully');
        
        // Ensure all required roles exist and have the right permissions
        await ensureRolesExist();
        await ensureRolePermissions();
        
        // **Initialize RAG services**
        if (process.env.RAG_ENABLED === 'true') {
            try {
                console.log('🔧 Initializing RAG services...');
                await initializeEmbeddingModel();
                console.log('✅ Embedding model (Jina AI) initialized');
                
                await initializeQdrantDB();
                console.log('✅ Qdrant Cloud initialized');
                console.log('🎯 RAG system ready');
            } catch (ragError) {
                console.error('❌ RAG initialization failed:', ragError.message);
                console.log('⚠️  Server will continue without RAG - chat will use basic prompts only');
            }
        } else {
            console.log('ℹ️  RAG is disabled (RAG_ENABLED=false)');
        }
        
        // Start the server
        const PORT = process.env.PORT || 5000;
        const localIP = getLocalIPAddress();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🌐 Local IP: ${localIP}`);
            console.log(`📱 Mobile API URL: http://${localIP}:${PORT}/api/v1`);
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
app.use('/api/v1/personalized-system', personalizedSystemRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/diet-plan', dietPlanRoutes);
app.use('/api/v1/monthly-diet-plan', monthlyDietPlanRoutes);
app.use('/api/v1/exercise-plan', exercisePlanRoutes);
app.use('/api/v1/lifestyle-tips', lifestyleTipsRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/admin/feedback', adminFeedbackRoutes);
app.use('/api/v1/admin/audit-logs', auditRoutes);
app.use('/api/v1/admin/settings', settingsRoutes);
app.use('/api/v1', testSettingsRoutes); // Public test endpoint

// Development/Testing route for clearing plans
if (process.env.NODE_ENV !== 'production') {
  const devRoutes = (await import('./routes/devRoutes.js')).default;
  app.use('/api/v1/dev', devRoutes);
  console.log('🔧 Dev routes enabled');
}
app.use('/api/v1/priorities', prioritiesRoutes);
app.use('/api/v1/habits', habitsRoutes);
app.use('/api/v1/health', healthRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Catch-all for all unsupported routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Start the server
startServer();
