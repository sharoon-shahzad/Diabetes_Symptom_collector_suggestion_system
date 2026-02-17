# Diabetes Health Mobile App - Phase 1 MVP ✅

A comprehensive React Native mobile application for diabetes management with AI-powered risk assessment, personalized health plans, and real-time chat assistance.

**Status**: Phase 1 MVP Complete - Core authentication, onboarding, and navigation functional

## 📱 Features

### ✅ Implemented (Phase 1)

- 🔐 **Authentication System**
  - Sign in / Sign up (3-step registration wizard)
  - Email verification with activation links
  - Forgot password / Reset password flows
  - "Remember Me" functionality
  - JWT token management with auto-refresh

- 🎯 **Onboarding Flow**
  - Welcome tutorial (3-slide carousel)
  - Diabetes diagnosis questionnaire
  - Symptom assessment form

- 📊 **Dashboard**
  - Personalized landing page
  - Health stats for diagnosed users
  - Risk assessment CTA for undiagnosed users
  - Quick action cards

- 🧭 **Navigation**
  - Bottom tab navigation (4 tabs)
  - File-based routing with Expo Router
  - Smooth screen transitions

- 🔄 **Offline-First Architecture**
  - Mutation queueing when offline
  - Auto-sync when connection restored
  - Network status tracking

- 🔒 **Security**
  - Secure token storage (Expo SecureStore)
  - Request/response interceptors
  - Token refresh handling

### 🚧 Coming in Phase 2

- 🥗 **Diet Plans** - Personalized daily and monthly meal plans
- 💪 **Exercise Plans** - Custom workout routines
- 💬 **AI Chat Assistant** - RAG-powered Q&A with medical documents
- 📈 **Health Tracking** - BMI, A1C, blood sugar, activity monitoring
- 📊 **Reports** - Visual analytics and progress tracking
- 🔔 **Push Notifications** - Reminders and alerts
- 👆 **Biometric Auth** - Face ID / Fingerprint login

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native 0.76.5 |
| **Runtime** | Expo SDK 52 |
| **Language** | TypeScript (strict mode) |
| **State Management** | Redux Toolkit + RTK Query |
| **Persistence** | Redux Persist + AsyncStorage |
| **UI Library** | React Native Paper v5 (Material Design 3) |
| **Navigation** | Expo Router (file-based) |
| **Forms** | React Hook Form + Zod |
| **HTTP Client** | Axios |
| **Icons** | MaterialCommunityIcons |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli` (optional for Expo Go)
- iOS: Xcode 14+ (Mac only) or iOS Simulator
- Android: Android Studio with SDK 34 or Android Emulator

### Installation

1. **Navigate to mobile app directory**:
   ```bash
   cd mobile-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure backend URL**:
   
   Create a `.env` file (copy from `.env.example`):
   ```env
   API_URL=http://YOUR_LOCAL_IP:5000
   ```
   
   **Important**: Use your computer's local network IP, not `localhost`:
   - **Mac**: Run `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows**: Run `ipconfig` (look for IPv4 Address)
   - **Example**: `API_URL=http://192.168.1.100:5000`

4. **Start development server**:
   ```bash
   npx expo start
   ```

5. **Run the app**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your physical device

### Backend Setup

Make sure the backend API is running on `http://localhost:5000` (or update `.env`).

See backend documentation for setup instructions.

## Project Structure

```
mobile-app/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flows
│   ├── (onboarding)/      # Onboarding + symptom assessment
│   ├── (tabs)/            # Main app tabs (dashboard, plans, chat, profile)
│   └── personalized/      # Personalized health features
├── src/
│   ├── components/        # Reusable UI components
│   ├── features/          # Redux feature slices
│   ├── store/             # Redux store configuration
│   ├── services/          # API clients
│   ├── hooks/             # Custom React hooks
│   ├── theme/             # Design system (colors, typography)
│   ├── utils/             # Utilities and validation
│   └── types/             # TypeScript types
└── assets/                # Images, fonts, icons
```

## Architecture

### Offline-First Strategy

- All data cached in Redux with Redux Persist
- Mutations queued when offline, executed on reconnection
- Background sync every 15 minutes
- Conflict resolution: server wins (last-write-wins)

### Authentication

- JWT access tokens (short-lived) stored in Expo SecureStore
- Refresh tokens (HttpOnly cookies) handled by backend
- Auto-refresh on 401 errors via axios interceptors
- Persistent login across app restarts

### State Management

- **Redux Toolkit** for global state (user, plans, assessment)
- **RTK Query** for API calls with automatic caching
- **Redux Persist** for offline persistence

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Clear cache
npm start --clear
```

## 📱 Implemented Screens (Phase 1)

### Authentication (5 screens)
- **Sign In** - Email/password with remember me
- **Sign Up** - 3-step wizard (Personal Info → Account → Review)
- **Forgot Password** - Request reset email
- **Reset Password** - Set new password from email link
- **Account Activation** - Email verification handler

### Onboarding (3 screens)
- **Welcome** - 3-slide tutorial with skip option
- **Diagnosis** - "Are you diagnosed with diabetes?" question
- **Symptoms** - Symptom assessment form (simplified MVP version)

### Main App (4 tabs)
- **Dashboard** - Personalized landing page with quick actions
- **Health Plans** - Placeholder for diet/exercise plans (Phase 2)
- **AI Chat** - Placeholder for chat assistant (Phase 2)
- **Profile** - User profile and settings

## 🔄 User Flows

### First-Time User (Undiagnosed)
1. Launch app → Splash screen
2. Welcome tutorial (3 slides)
3. Diagnosis question → Select "No"
4. Complete symptom assessment
5. Sign up / Sign in
6. Dashboard with risk assessment CTA

### First-Time User (Diagnosed)
1. Launch app → Splash screen
2. Welcome tutorial (3 slides)
3. Diagnosis question → Select "Yes"
4. Sign up / Sign in
5. Dashboard with health stats (placeholder)

### Returning User
1. Launch app → Splash screen
2. Auto-login with stored token
3. Dashboard (if onboarding complete)
4. Or continue from where they left off

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests (Coming in Phase 2)
npm test

# E2E tests (Coming in Phase 2)
npm run test:e2e
```

## Building

### Android

```bash
# Development build
eas build --profile development --platform android

# Production build
eas build --profile production --platform android
```

### iOS

```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `API_URL`: Backend API base URL
- `NODE_ENV`: development | production

## 🎨 Design System

### Colors
- **Primary**: #2563eb (Blue)
- **Success**: #4caf50 (Green)
- **Warning**: #ff9800 (Orange)
- **Error**: #f44336 (Red)
- **Info**: #2196f3 (Light Blue)

### Typography
- *📄 License

Private - All Rights Reserved (Final Year Project)

## 📞 Support

For backend API documentation, see `backend/README.md`

---

**Last Updated**: Phase 1 MVP Complete - January 2025
**Status**: ✅ Ready for testing and Phase 2 development
- **Container Padding**: 16px

## 📦 Key Dependencies

```json
{
  "expo": "^52.0.0",
  "react-native": "0.76.5",
  "@reduxjs/toolkit": "^2.4.0",
  "react-native-paper": "^5.12.5",
  "expo-router": "^4.0.9",
  "react-hook-form": "^7.53.2",
  "zod": "^3.23.8",
  "axios": "^1.7.9"
}
```

## 🐛 Known Issues

### Phase 1 Limitations:
- ⚠️ Plans, Chat, and Profile edit screens are placeholders
- ⚠️ No actual health data tracking yet
- ⚠️ Symptom assessment is simplified (full multi-step version in Phase 2)
- ⚠️ No push notifications
- ⚠️ No biometric authentication

### Platform-Specific:
- iOS: DateTimePicker may show incorrect styling (Expo SDK 52 known issue)
- Android: Back button behavior needs handling in auth screens

## 🚧 Roadmap

### Phase 2 (Planned)
- [ ] Complete symptom assessment (multi-disease, multi-symptom)
- [ ] Diet plan generation and tracking
- [ ] Exercise plan generation and tracking  
- [ ] Monthly diet plan calendar
- [ ] AI chat assistant (RAG-powered)
- [ ] Health metrics tracking (blood sugar, weight, A1C)
- [ ] Google Fit / Apple Health integration
- [ ] Report generation and analytics
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Profile editing
- [ ] Settings management

## 🤝 Contributing

This is a Final Year Project. Follow the coding standards:

- ✅ TypeScript strict mode
- ✅ Functional components with hooks
- ✅ Feature-based folder structure
- ✅ Zod for validation
- ✅ ESLint + Prettier for formatting

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.
