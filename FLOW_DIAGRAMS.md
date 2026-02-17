# User Flow Diagrams - New Onboarding System

## Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          LANDING PAGE                                    │
│                    (Unauthenticated User)                               │
│                                                                          │
│  [Hero Section] [Features] [Testimonials]                              │
│                                                                          │
│              ┌──────────────────────┐                                   │
│              │   Get Started Button  │                                  │
│              └──────────┬────────────┘                                  │
└─────────────────────────┼────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      WEBSITE TOUR (Onboarding)                          │
│                       /onboarding                                        │
│                                                                          │
│  Step 1: Welcome                                                        │
│  ├─ Smart Assessment                                                    │
│  ├─ Personalized Recommendations                                        │
│  └─ Health Tracking                                                     │
│                                                                          │
│  Step 2: Features                                                       │
│  ├─ AI-Powered Analysis                                                 │
│  ├─ Expert Guidance                                                     │
│  └─ Progress Monitoring                                                 │
│                                                                          │
│  Step 3: Get Started                                                    │
│  ├─ Secure & Private                                                    │
│  ├─ Instant Results                                                     │
│  └─ Evidence-Based                                                      │
│                                                                          │
│              ┌──────────────────────┐                                   │
│              │  Continue / Get Started │                                │
│              └──────────┬────────────┘                                  │
└─────────────────────────┼────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DIAGNOSIS QUESTION                                    │
│                   /diagnosis-question                                    │
│                                                                          │
│  Question: "Have you been previously diagnosed with diabetes?"          │
│                                                                          │
│  ┌────────────────────────────┐  ┌────────────────────────────┐        │
│  │  ✓ Yes, I have been        │  │  ○ No, I am not            │        │
│  │    diagnosed with diabetes │  │    diagnosed with diabetes │        │
│  │                            │  │                            │        │
│  │  → Access personalized     │  │  → Take symptom            │        │
│  │    management tools        │  │    assessment              │        │
│  └─────────────┬──────────────┘  └─────────────┬──────────────┘        │
│                │                               │                        │
└────────────────┼───────────────────────────────┼────────────────────────┘
                 │                               │
                 │ (Diagnosed)                   │ (Not Diagnosed)
                 ▼                               ▼
┌─────────────────────────────┐   ┌──────────────────────────────────────┐
│      SIGN IN / SIGN UP       │   │     SYMPTOM ASSESSMENT               │
│        /signin               │   │   /symptom-assessment                │
│                              │   │                                      │
│  Message: "Please sign in to │   │  Answer questions for each symptom:  │
│  access your personalized    │   │  ├─ Urination Patterns              │
│  diabetes management         │   │  ├─ Thirst & Hydration              │
│  dashboard"                  │   │  ├─ Weight Changes                  │
│                              │   │  ├─ Energy Levels                   │
│  isDiagnosed: true flag set  │   │  ├─ Appetite Changes                │
│                              │   │  ├─ Vision Changes                  │
│  After Login ──────────────► │   │  └─ ... (all symptom categories)    │
│  Personalized Dashboard      │   │                                      │
└─────────────────────────────┘   │  ┌─────────────────────────────┐    │
                                  │  │  All questions completed?    │    │
                                  │  └──────────┬──────────────────┘    │
                                  │             │ Yes                    │
                                  └─────────────┼────────────────────────┘
                                                │
                                                ▼
                              ┌────────────────────────────────────────┐
                              │      LOGIN / SIGNUP DIALOG             │
                              │                                        │
                              │  "Great! One More Step"                │
                              │                                        │
                              │  You've completed all questions!       │
                              │  Sign in to view your personalized     │
                              │  risk assessment.                      │
                              │                                        │
                              │  ┌───────────┐  ┌──────────────┐     │
                              │  │  Sign Up  │  │   Sign In     │     │
                              │  └─────┬─────┘  └──────┬────────┘     │
                              └────────┼────────────────┼──────────────┘
                                       │                │
                                       │ (New User)     │ (Returning)
                                       ▼                ▼
                              ┌─────────────────────────────────┐
                              │   AUTHENTICATION PROCESS         │
                              │                                  │
                              │  1. User enters credentials      │
                              │  2. Backend validates            │
                              │  3. Access token generated       │
                              │  4. Check sessionStorage for     │
                              │     pendingOnboardingAnswers     │
                              │  5. If found:                    │
                              │     └─ Batch save to database    │
                              │     └─ Clear sessionStorage      │
                              │  6. Redirect to assessment       │
                              └──────────┬───────────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────────────────┐
                              │   RISK ASSESSMENT RESULTS        │
                              │        /assessment               │
                              │                                  │
                              │  ┌─────────────────────────┐    │
                              │  │   Risk Level: Low/Med/High│   │
                              │  │   Probability: XX%        │   │
                              │  │   Confidence: XX%         │   │
                              │  └─────────────────────────┘    │
                              │                                  │
                              │  ┌─────────────────────────┐    │
                              │  │   Feature Importance     │   │
                              │  │   ├─ Age: 15%           │   │
                              │  │   ├─ Polyuria: 12%      │   │
                              │  │   └─ Weight: 10%        │   │
                              │  └─────────────────────────┘    │
                              │                                  │
                              │  ┌─────────────────────────┐    │
                              │  │   Recommendations        │   │
                              │  │   • Lifestyle changes    │   │
                              │  │   • Medical consultation │   │
                              │  │   • Monitoring plan      │   │
                              │  └─────────────────────────┘    │
                              │                                  │
                              │  ┌──────────────────┐           │
                              │  │  Go to Dashboard  │           │
                              │  └────────┬──────────┘           │
                              └───────────┼──────────────────────┘
                                          │
                                          ▼
                              ┌─────────────────────────────────┐
                              │      USER DASHBOARD              │
                              │        /dashboard                │
                              │                                  │
                              │  Undiagnosed User Dashboard:     │
                              │  ├─ Insights                     │
                              │  ├─ My Account                   │
                              │  ├─ My Disease Data              │
                              │  ├─ Check My Risk                │
                              │  └─ My Feedback                  │
                              │                                  │
                              │  • Periodically asks if now      │
                              │    diagnosed                     │
                              │  • If user selects "Yes" →       │
                              │    Redirect to Personalized      │
                              │    Suggestion System             │
                              └──────────────────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ONBOARDING CONTEXT STATE                            │
│                      (React Context + SessionStorage)                    │
│                                                                          │
│  {                                                                       │
│    isCompleted: false,                                                  │
│    isDiagnosed: null,  ← Set when user answers diagnosis question       │
│    answers: {},        ← Populated during symptom assessment            │
│    userInfo: {                                                          │
│      age: null,                                                         │
│      gender: null                                                       │
│    },                                                                   │
│    currentStep: 'initial'  ← 'initial' → 'tour' → 'diagnosis' →        │
│                                 'questions' → 'completed'               │
│  }                                                                      │
│                                                                          │
│  Persisted to: sessionStorage['onboardingState']                        │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                  PENDING ANSWERS (SessionStorage)                        │
│                                                                          │
│  sessionStorage['pendingOnboardingAnswers'] = {                         │
│    answers: {                                                           │
│      "64abc123...": "Yes",                                              │
│      "64abc456...": "25 years",                                         │
│      "64abc789...": "Male",                                             │
│      ...                                                                │
│    },                                                                   │
│    symptomId: "64def123...",                                            │
│    symptomName: "Urination Patterns"                                    │
│  }                                                                      │
│                                                                          │
│  ↓ After Login ↓                                                        │
│                                                                          │
│  POST /api/v1/questions/batch-save-answers                              │
│  {                                                                      │
│    answers: [                                                           │
│      { questionId: "64abc123...", answerText: "Yes" },                  │
│      { questionId: "64abc456...", answerText: "25 years" },             │
│      ...                                                                │
│    ]                                                                    │
│  }                                                                      │
│                                                                          │
│  ↓ Backend Processing ↓                                                 │
│                                                                          │
│  For each answer:                                                       │
│    1. Find/Create Answer document                                       │
│    2. Create Questions_Answers link                                     │
│    3. Soft delete old Users_Answers                                     │
│    4. Create new Users_Answers                                          │
│                                                                          │
│  ↓ Completion Check ↓                                                   │
│                                                                          │
│  If all questions answered:                                             │
│    user.onboardingCompleted = true                                      │
│                                                                          │
│  ✅ Clear sessionStorage                                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

## Route Guard Logic

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ROUTE PROTECTION                                 │
└─────────────────────────────────────────────────────────────────────────┘

/assessment (Risk Assessment Results)
────────────────────────────────────
├─ CHECK: Is user authenticated?
│  ├─ NO  → Redirect to /signin with message
│  └─ YES → Load assessment data
│
└─ Additional Check: Has user completed onboarding?
   ├─ NO  → Show message to complete onboarding
   └─ YES → Display results


/personalized-suggestions (Diagnosed Dashboard)
────────────────────────────────────────────────
├─ CHECK: Is user authenticated?
│  ├─ NO  → Redirect to /signin with isDiagnosed flag
│  └─ YES → Continue to next check
│
└─ CHECK: Is user.diabetes_diagnosed === 'yes'?
   ├─ NO  → Redirect to /dashboard with message
   │         "Please complete diagnosis question"
   └─ YES → Load personalized system


/dashboard (General User Dashboard)
────────────────────────────────────
├─ CHECK: Is user authenticated?
│  ├─ NO  → Redirect to /signin
│  └─ YES → Continue
│
├─ CHECK: User diagnosis status
│  ├─ diabetes_diagnosed === 'yes'
│  │  └─ Show: Diagnosed Dashboard Sections
│  │     ├─ Insights
│  │     ├─ My Account
│  │     ├─ Personalized Suggestions ←──┐
│  │     ├─ Chat Assistant               │ (Main features)
│  │     └─ My Feedback                  │
│  │                                      │
│  └─ diabetes_diagnosed === 'no' or null
│     └─ Show: Undiagnosed Dashboard Sections
│        ├─ Insights
│        ├─ My Account
│        ├─ My Disease Data
│        ├─ Check My Risk
│        └─ My Feedback
│
└─ Periodic Popup: "Are you now diagnosed?"
   └─ If YES → Update status → Reload dashboard
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              App.jsx                                     │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    ThemeProvider                                │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │             OnboardingProvider                            │  │    │
│  │  │  ┌────────────────────────────────────────────────────┐  │  │    │
│  │  │  │                Router                              │  │  │    │
│  │  │  │  ┌──────────────────────────────────────────────┐ │  │  │    │
│  │  │  │  │            AppContent                        │ │  │  │    │
│  │  │  │  │  ┌────────────────────────────────────────┐ │ │  │  │    │
│  │  │  │  │  │          Routes                        │ │ │  │  │    │
│  │  │  │  │  │                                        │ │ │  │  │    │
│  │  │  │  │  │  / → LandingPage                      │ │ │  │  │    │
│  │  │  │  │  │  /onboarding → Onboarding             │ │ │  │  │    │
│  │  │  │  │  │  /diagnosis-question → DiagnosisQ.    │ │ │  │  │    │
│  │  │  │  │  │  /symptom-assessment → SymptomAss.    │ │ │  │  │    │
│  │  │  │  │  │  /assessment → Assessment (guarded)   │ │ │  │  │    │
│  │  │  │  │  │  /dashboard → Dashboard (guarded)     │ │ │  │  │    │
│  │  │  │  │  │  /personalized-suggestions → PS       │ │ │  │  │    │
│  │  │  │  │  │                          (guarded)     │ │ │  │  │    │
│  │  │  │  │  └────────────────────────────────────────┘ │ │  │  │    │
│  │  │  │  └──────────────────────────────────────────────┘ │  │  │    │
│  │  │  └────────────────────────────────────────────────────┘  │  │    │
│  │  │                                                           │  │    │
│  │  │  Context Methods Available to All Components:            │  │    │
│  │  │  • useOnboarding() hook                                  │  │    │
│  │  │  • updateDiagnosisStatus(status)                         │  │    │
│  │  │  • updateAnswer(questionId, answerId)                    │  │    │
│  │  │  • completeOnboarding()                                  │  │    │
│  │  │  • resetOnboarding()                                     │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Lifecycle

```
User Starts Onboarding (Unauthenticated)
│
├─ Website Tour
│  └─ Context: currentStep = 'tour'
│
├─ Diagnosis Question
│  ├─ User selects answer
│  ├─ Context: isDiagnosed = 'yes' or 'no'
│  └─ Context: currentStep = 'diagnosis'
│
├─ IF diagnosed = 'no':
│  │
│  ├─ Symptom Assessment
│  │  ├─ QuestionList component loads questions
│  │  ├─ User answers questions
│  │  ├─ Answers stored in local state
│  │  ├─ On save (for unauth users):
│  │  │  └─ sessionStorage['pendingOnboardingAnswers'] = answers
│  │  └─ Context: currentStep = 'questions'
│  │
│  ├─ All questions completed
│  │  ├─ Login dialog appears
│  │  └─ Context: isCompleted = true
│  │
│  └─ User logs in / signs up
│     │
│     ├─ SignInForm.handleSubmit()
│     │  ├─ POST /api/v1/auth/login
│     │  ├─ Receive accessToken
│     │  ├─ Check sessionStorage for pendingOnboardingAnswers
│     │  ├─ If found:
│     │  │  ├─ Convert to array format
│     │  │  ├─ POST /api/v1/questions/batch-save-answers
│     │  │  │  ├─ Backend saves to database
│     │  │  │  ├─ Creates Users_Answers entries
│     │  │  │  └─ Updates user.onboardingCompleted
│     │  │  └─ Clear sessionStorage
│     │  └─ Navigate to /assessment
│     │
│     └─ Assessment Page Loads
│        ├─ Fetch saved answers from database
│        ├─ POST /api/v1/assessment/diabetes
│        ├─ ML model processes answers
│        ├─ Risk assessment generated
│        └─ Results displayed
│
└─ IF diagnosed = 'yes':
   │
   ├─ Redirect to /signin
   │  └─ Message about accessing diagnosed dashboard
   │
   └─ After login:
      └─ Navigate to /personalized-suggestions
         ├─ Check user.diabetes_diagnosed === 'yes'
         ├─ If true: Load personalized system
         └─ If false: Redirect to dashboard
```

## Summary

This comprehensive flow ensures:

1. **Smooth onboarding** for new users without authentication barriers
2. **State preservation** across all steps using React Context and sessionStorage
3. **Secure data handling** with answers only saved to database after authentication
4. **Appropriate routing** based on diagnosis status and authentication state
5. **No data loss** during the entire user journey
6. **Clear user feedback** at each step of the process

The system is designed to be user-friendly, secure, and maintainable with clear separation of concerns between unauthenticated and authenticated states.
