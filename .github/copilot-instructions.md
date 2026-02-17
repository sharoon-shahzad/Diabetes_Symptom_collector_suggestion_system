# Diabetes Management System - AI Agent Guidelines

A multi-platform diabetes health management system with backend API, React web app, and React Native mobile app (Phase 1 complete).

## Code Style

### By Component
- **Backend** (`backend/`): JavaScript ES6+ modules, async/await, try-catch error handling
  - Controllers: camelCase exports ([authController.js](../backend/controllers/authController.js))
  - Models: PascalCase Mongoose schemas ([User.js](../backend/models/User.js))
  - Routes: kebab-case URLs `/api/v1/diet-plan/generate`
- **Frontend** (`frontend/src/`): React functional components with hooks, Material-UI styling
  - Components: PascalCase, `export const` pattern ([DynamicInsightsComponents.jsx](../frontend/src/components/Dashboard/DynamicInsightsComponents.jsx))
- **Mobile** (`mobile-app/`): TypeScript strict mode, React Native Paper (Material Design 3)
  - Screens: File-based routing in `app/`, lowercase with parentheses for groups `(auth)/signin.tsx`
  - Components: PascalCase, type-safe props ([Button.tsx](../mobile-app/src/components/common/Button.tsx))

## Architecture

### Backend Structure
```
controllers/ → business logic handlers
models/ → Mongoose schemas (MongoDB)
services/ → reusable logic (dietPlanService, chromaService, emailService)
routes/ → Express endpoints (protected by auth middleware)
middlewares/ → authMiddleware, validationMiddleware, auditMiddleware
```
See [server.js](../backend/server.js) for middleware registration order.

### State Management
- **Frontend**: React Context API for theme/onboarding + local state hooks
- **Mobile**: Redux Toolkit + RTK Query ([store/index.ts](../mobile-app/src/store/index.ts))
  - Slices: `authSlice`, `offlineSlice`
  - APIs: RTK Query endpoints in feature folders ([authApi.ts](../mobile-app/src/features/auth/authApi.ts))
  - Persistence: Redux Persist + AsyncStorage (auth/offline whitelisted)

### API Communication
- **Base URLs**: `/api/v1/[resource]` pattern
- **Auth**: JWT with auto-refresh on 401 via Axios interceptors ([frontend](../frontend/src/utils/axiosInstance.js), [mobile](../mobile-app/src/services/api.ts))
- **Response format**: `{ success, message, data, error }`

## Build and Test

### Installation & Development
```bash
# Backend - Manual start (no package.json scripts)
cd backend && node server.js

# Frontend
cd frontend && npm install && npm run dev

# Mobile App
cd mobile-app && npm install && npx expo start
# Then: Press 'i' (iOS) or 'a' (Android) or scan QR code
```

### Mobile-Specific Setup
1. Create `mobile-app/.env` with `API_URL=http://YOUR_LOCAL_IP:5000` (not localhost)
2. Ensure backend is running before mobile app connects

### Type Checking (Mobile Only)
```bash
cd mobile-app && npm run type-check
```

## Project Conventions

### Authentication Pattern
- JWT access tokens (15min) + refresh tokens (7 days, HTTP-only cookies)
- Middleware: `verifyAccessTokenMiddleware` populates `req.user` ([authMiddleware.js](../backend/middlewares/authMiddleware.js))
- Mobile: Tokens stored in Expo SecureStore ([storage.ts](../mobile-app/src/utils/storage.ts))
- Auto-refresh: Interceptors catch 401, refresh token, retry original request

### Validation
- **Backend**: express-validator in middleware ([validationMiddleware.js](../backend/middlewares/validationMiddleware.js))
- **Mobile**: Zod schemas with React Hook Form ([validation.ts](../mobile-app/src/utils/validation.ts))
- Password rules: 8+ chars, uppercase + lowercase + number + special char

### Route Protection
- All routes in `backend/routes/` use `verifyAccessTokenMiddleware` unless explicitly public
- Role-based access via `roleCheckMiddleware` (admin, content_creator, super_admin)

### File Upload Pattern
- Use `multer` middleware for file uploads (profile images, documents)
- Store in `backend/uploads/` with filename sanitization

## Integration Points

### External Services
- **Python ML Model**: `backend/DiabetesModel/EnhancedDiabetesSystem.py` (spawned as child process)
- **ChromaDB**: Vector DB for RAG chat (`chromaService` in backend/services/)
- **Database**: MongoDB via Mongoose ([db.js](../backend/config/db.js)), env: `MONGO_URI`
- **Email**: Nodemailer for verification, password reset, PDF reports

### Environment Variables
- **Backend**: `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `EMAIL_*` configs, `FRONTEND_URL`, `MOBILE_URL`
- **Frontend**: `VITE_API_URL` (defaults to `http://localhost:5000`)
- **Mobile**: `API_URL` in `.env` (must be local network IP, not localhost)

### API Versioning
All endpoints prefixed with `/api/v1/` - increment version for breaking changes.

## Security

### Sensitive Areas
- Never log/expose JWT secrets or refresh tokens
- Passwords hashed with bcrypt (10 rounds) before storage
- Audit logging captures all authenticated actions ([auditMiddleware.js](../backend/middlewares/auditMiddleware.js))

### CORS Configuration
- Development: Accepts all origins (configured in [server.js](../backend/server.js))
- Production: Restrict to `FRONTEND_URL` and `MOBILE_URL` from env

### Token Refresh Flow
1. Access token expires → 401 response
2. Frontend/Mobile intercepts 401 → calls `/auth/refresh-token` with refresh token cookie
3. Backend validates refresh token → issues new access token
4. Interceptor retries original request with new token
5. See [authController.js](../backend/controllers/authController.js) `refreshToken` function

## Mobile App Specifics (Phase 1 Complete)

### Navigation
- **Expo Router**: File-based routing in `mobile-app/app/`
- Route groups: `(auth)/`, `(onboarding)/`, `(tabs)/`
- Dynamic routes: `[token].tsx` for activation/reset links

### Offline Support
- Mutations queued when offline via custom middleware ([syncMiddleware.ts](../mobile-app/src/store/syncMiddleware.ts))
- Auto-sync on reconnect detected by NetInfo
- Queue stored in Redux Persist for crash recovery

### Phase 2 Features (Not Yet Implemented)
- Diet/exercise plan generation (placeholder screens exist)
- AI chat assistant (placeholder)
- Health metrics tracking
- Google Fit integration
- Push notifications

---

**Key Documentation**: 
- Mobile: [mobile-app/README.md](../mobile-app/README.md), [QUICK_START.md](../mobile-app/QUICK_START.md), [PHASE_1_COMPLETE.md](../mobile-app/PHASE_1_COMPLETE.md)
- Root: [README.md](../README.md)
