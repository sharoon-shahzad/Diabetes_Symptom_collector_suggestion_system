# Testing Guide - New Onboarding Flow

## Quick Start Testing

### Test Scenario 1: New Unauthenticated User (Not Diagnosed)
1. Open the app at `http://localhost:3000/`
2. Click "Get Started" button
3. Navigate through the website tour (3 steps)
4. Click "Get Started" on the final tour step
5. **New:** You should see the Diagnosis Question page
6. Select "No, I am not diagnosed with diabetes"
7. Click "Continue"
8. Complete the Symptom Assessment (answer all questions for each symptom category)
9. After completing all questions, you should see a **login dialog**
10. Click "Sign Up" or "Sign In"
11. Complete authentication
12. **Expected:** You should be redirected to the Assessment page with your risk results
13. **Verify:** All your answers were saved to your account

### Test Scenario 2: New Unauthenticated User (Diagnosed)
1. Open the app at `http://localhost:3000/`
2. Click "Get Started" button
3. Navigate through the website tour
4. Click "Get Started" on the final tour step
5. **New:** You should see the Diagnosis Question page
6. Select "Yes, I have been diagnosed with diabetes"
7. Click "Continue"
8. **Expected:** You should be redirected to Sign In with a message about accessing the diagnosed dashboard
9. Sign in or create an account
10. **Expected:** You should be redirected to the Personalized Suggestion System

### Test Scenario 3: State Persistence
1. Start the onboarding flow as unauthenticated user
2. Answer the diagnosis question (select "No")
3. Start answering symptom assessment questions
4. Answer a few questions (don't complete all)
5. **Refresh the page**
6. **Expected:** You should be back on the Symptom Assessment page
7. **Verify:** Your progress is preserved (you can continue where you left off)

### Test Scenario 4: Returning User Flow
1. Sign in with an existing account that has `diabetes_diagnosed = 'yes'`
2. Navigate to Dashboard
3. Click on "Personalized Suggestions"
4. **Expected:** You should have access to the Personalized Suggestion System
5. **Verify:** No diagnosis question appears (already answered)

### Test Scenario 5: Route Guards
1. **Without logging in**, try to navigate directly to:
   - `http://localhost:3000/assessment`
   - **Expected:** Redirected to Sign In with appropriate message
   
2. **Without logging in**, try to navigate to:
   - `http://localhost:3000/personalized-suggestions`
   - **Expected:** Redirected to Sign In with message about diagnosis requirement

3. **Log in as undiagnosed user**, try to access:
   - `http://localhost:3000/personalized-suggestions`
   - **Expected:** Redirected to Dashboard with message to complete diagnosis question

## Backend Testing

### Test API Endpoint: Batch Save Onboarding Answers
```bash
# Make sure backend is running on http://localhost:5000

# First, login to get a token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"YourPassword123!"}'

# Copy the accessToken from response

# Test batch save endpoint
curl -X POST http://localhost:5000/api/v1/questions/batch-save-answers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "answers": [
      {
        "questionId": "QUESTION_ID_1",
        "answerText": "Yes"
      },
      {
        "questionId": "QUESTION_ID_2",
        "answerText": "25 years"
      }
    ]
  }'

# Expected response:
# {
#   "success": true,
#   "message": "Successfully saved 2 answers",
#   "savedCount": 2,
#   "totalSubmitted": 2
# }
```

## Browser DevTools Testing

### Check SessionStorage
1. Open Browser DevTools (F12)
2. Go to Application tab → Storage → Session Storage
3. Look for key: `onboardingState`
4. **Expected structure:**
```json
{
  "isCompleted": false,
  "isDiagnosed": "no",
  "answers": {},
  "userInfo": {
    "age": null,
    "gender": null
  },
  "currentStep": "questions"
}
```

5. Look for key: `pendingOnboardingAnswers`
6. **Expected structure:**
```json
{
  "answers": {
    "questionId1": "answerText1",
    "questionId2": "answerText2"
  },
  "symptomId": "symptomId",
  "symptomName": "Symptom Category Name"
}
```

### Check Console Logs
Look for these console messages:
- `✅ Saved pending onboarding answers after login`
- `User completed onboarding via batch save`
- Messages about answers being saved

## Edge Cases to Test

### 1. Network Failure During Batch Save
1. Complete onboarding questions
2. Open DevTools → Network tab
3. Set throttling to "Offline"
4. Try to log in
5. **Expected:** Login might succeed but batch save will fail
6. **Verify:** Error is logged but user can still access their account
7. **Future Enhancement:** Show retry option

### 2. Partial Answers
1. Answer only some questions in the symptom assessment
2. Click "Next Symptom" without completing all
3. **Verify:** Only answered questions are saved
4. **Verify:** User is not marked as completing onboarding

### 3. Session Timeout
1. Start onboarding
2. Leave browser idle for extended period (depends on session timeout settings)
3. Try to continue
4. **Verify:** Session data is still preserved in sessionStorage
5. **Verify:** Login is required before saving

### 4. Multiple Tabs
1. Open app in two browser tabs
2. Start onboarding in Tab 1
3. Answer some questions
4. Switch to Tab 2
5. **Verify:** Changes in Tab 1 are reflected in Tab 2 (sessionStorage is shared)

## Verification Checklist

After testing, verify:

- [ ] Unauthenticated users can access the tour
- [ ] Diagnosis question appears after tour
- [ ] Diagnosis question saves choice to context
- [ ] "Yes" answer redirects to sign-in with appropriate message
- [ ] "No" answer continues to symptom assessment
- [ ] Symptom assessment works without login
- [ ] Login dialog appears only after completing ALL questions
- [ ] Answers are stored in sessionStorage
- [ ] Answers are saved to database after login
- [ ] Assessment page requires authentication
- [ ] Personalized suggestions require diagnosis = "yes"
- [ ] State persists across page refreshes
- [ ] Batch save endpoint works correctly
- [ ] User is redirected to assessment after login from onboarding
- [ ] No duplicate answers are created
- [ ] Onboarding completion status is updated correctly

## Common Issues and Solutions

### Issue: Answers not saving after login
**Solution:** Check browser console for errors. Verify:
1. `pendingOnboardingAnswers` exists in sessionStorage
2. Access token is valid
3. Backend endpoint is accessible
4. User has 'answer:submit:own' permission

### Issue: Diagnosis question appears for returning users
**Solution:** Verify:
1. User's `diabetes_diagnosed` field is set correctly in database
2. OnboardingContext is properly checking this field
3. User is logged in when checking status

### Issue: Redirected to login when trying to access assessment
**Expected behavior:** This is correct! Assessment requires authentication.
**Action:** Complete the onboarding flow and log in first.

### Issue: Can't access personalized suggestions
**Check:**
1. Are you logged in?
2. Is your `diabetes_diagnosed` field set to "yes"?
3. Did you complete the diagnosis question?

## Performance Checks

1. **Page Load Time:** Onboarding pages should load within 2 seconds
2. **State Save Time:** sessionStorage writes should be instant (< 10ms)
3. **Batch Save API:** Should complete within 3 seconds for 50 answers
4. **Assessment Generation:** May take 5-10 seconds (depends on ML model)

## Regression Testing

Ensure existing features still work:
- [ ] Standard login flow
- [ ] Standard signup flow
- [ ] Password reset
- [ ] Email verification
- [ ] Admin dashboard access
- [ ] Existing user dashboard
- [ ] Medical info forms
- [ ] Diet plan functionality
- [ ] Exercise plan functionality

## Success Criteria

The refactoring is successful if:
1. ✅ Users can complete onboarding without authentication
2. ✅ All answers are preserved after login
3. ✅ No user data is lost during the flow
4. ✅ Route guards prevent unauthorized access
5. ✅ Diagnosed users see appropriate dashboard
6. ✅ Undiagnosed users complete assessment
7. ✅ State persists across sessions
8. ✅ No errors in browser console
9. ✅ Backend saves answers correctly
10. ✅ User experience is smooth and intuitive
