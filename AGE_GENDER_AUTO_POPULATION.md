# Age and Gender Auto-Population from User Profile

**Date:** January 26, 2026  
**Status:** ✅ IMPLEMENTED

---

## 🎯 OBJECTIVE

Remove Age and Gender questions from the onboarding assessment and instead collect them during user signup. These values are then automatically populated from the user's profile when running the diabetes risk assessment.

---

## ✅ CHANGES IMPLEMENTED

### 1. **Backend - Removed Questions from Database Seed**
**File:** `backend/seed.js`

**Changes:**
- ❌ Removed "What is your age?" question
- ❌ Removed "What is your gender?" question
- ✅ Updated category description to note these are collected from profile

**Benefits:**
- Users don't have to answer age/gender twice
- Reduces onboarding friction (2 fewer questions)
- More accurate data (directly from profile instead of re-entered)

---

### 2. **Backend - Enhanced User Model**
**File:** `backend/models/User.js`

**Changes:**
```javascript
date_of_birth: {
    type: Date,
    required: true,  // ✅ NOW REQUIRED
},
gender: {
    type: String,
    enum: ['Male', 'Female', 'male', 'female'],
    required: true,  // ✅ NOW REQUIRED (removed null option)
},
```

**Impact:**
- All new users MUST provide date of birth and gender
- Ensures ML model always has required data
- Prevents incomplete assessments

---

### 3. **Backend - Enhanced Registration Validation**
**File:** `backend/controllers/authController.js`

**Changes:**
```javascript
// ✅ Added validation for date_of_birth and gender
if (!fullName || !email || !password || !date_of_birth || !gender) {
    return res.status(400).json({ 
        success: false,
        message: 'All fields are required (name, email, password, date of birth, and gender).' 
    });
}

// ✅ Added gender value validation
if (!['Male', 'Female', 'male', 'female'].includes(gender)) {
    return res.status(400).json({ 
        success: false,
        message: 'Gender must be either Male or Female.' 
    });
}
```

**Benefits:**
- Server-side validation prevents incomplete registrations
- Clear error messages guide users
- Gender values match ML model expectations

---

### 4. **Backend - Smart Feature Mapping with Age Calculation**
**File:** `backend/controllers/assessmentController.js`

**Changes to `mapAnswersToFeatures()` function:**

```javascript
// ✅ NEW: Function now accepts userData parameter
function mapAnswersToFeatures(answersByQuestionId, questions, userData = null) {
  
  // ✅ AUTO-POPULATE Age from date_of_birth
  if (userData?.date_of_birth) {
    const birthDate = new Date(userData.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    features.Age = age;
    console.log(`👤 Auto-populated Age: ${age} (DOB: ${birthDate.toDateString()})`);
  }
  
  // ✅ AUTO-POPULATE Gender from profile
  if (userData?.gender) {
    const genderNormalized = userData.gender.toLowerCase();
    features.Gender = (genderNormalized === 'male') ? 1 : 0;  // Male=1, Female=0
    console.log(`👤 Auto-populated Gender: ${userData.gender} → ${features.Gender}`);
  }
}
```

**Key Features:**
- ✅ Calculates actual age from date of birth (accurate to the day!)
- ✅ Handles birthday edge cases (birthday hasn't occurred this year)
- ✅ Normalizes gender to ML model format (Male=1, Female=0)
- ✅ Logs values for debugging
- ✅ Graceful fallback if data missing

---

### 5. **Backend - Assessment Function Updates**
**File:** `backend/controllers/assessmentController.js`

**Changes to `assessDiabetes()` function:**

```javascript
export const assessDiabetes = async (req, res) => {
  // ✅ Fetch user profile data
  const user = await User.findById(userId).select('date_of_birth gender fullName email');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // ✅ VALIDATE user has required profile data
  if (!user.date_of_birth || !user.gender) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please complete your profile with date of birth and gender before assessment',
      missing_profile_fields: {
        date_of_birth: !user.date_of_birth,
        gender: !user.gender
      }
    });
  }
  
  // ✅ Pass user data to feature mapping
  const features = mapAnswersToFeatures(answersByQuestionId, questions, {
    date_of_birth: user.date_of_birth,
    gender: user.gender
  });
}
```

**Benefits:**
- ✅ Validates profile completeness before assessment
- ✅ Clear error messages if profile incomplete
- ✅ Automatically populates Age and Gender features
- ✅ No user intervention needed

---

### 6. **Frontend - No Changes Needed!**
**File:** `frontend/src/components/SignUp/SignUpForm.jsx`

**Existing Implementation:**
- ✅ Already collects date of birth (DatePicker component)
- ✅ Already collects gender (dropdown with Male/Female)
- ✅ Already validates both fields as required in step 0
- ✅ Already sends both to backend in registration request

**No changes needed because:**
- Signup form already had these fields
- Validation already in place
- Frontend code already correct

---

## 📊 BEFORE vs AFTER

| Aspect | ❌ BEFORE | ✅ AFTER |
|--------|----------|---------|
| **Onboarding Questions** | 17 questions (incl. Age & Gender) | 15 questions |
| **User Experience** | Answer age/gender twice | Answer once during signup |
| **Age Accuracy** | User enters number (could be outdated) | Calculated from DOB (always current) |
| **Gender Source** | Re-entered during assessment | From verified profile |
| **Required Profile Fields** | Name, email, password only | Name, email, password, DOB, gender |
| **Assessment Validation** | Only checks answered questions | Checks profile completeness too |
| **Data Consistency** | Age could differ from profile | Always matches profile |

---

## 🎯 HOW IT WORKS

### User Flow:

1. **Signup Phase**
   ```
   User fills signup form:
   ✅ Name
   ✅ Email
   ✅ Password
   ✅ Date of Birth (DatePicker - required)
   ✅ Gender (Male/Female dropdown - required)
   
   → Saved to User document in MongoDB
   ```

2. **Onboarding Phase**
   ```
   User answers assessment questions:
   ✅ Height (feet/inches)
   ✅ Weight (kg)
   ✅ 13 symptom questions
   
   ❌ NO Age question
   ❌ NO Gender question
   
   → Saved to UsersAnswers collection
   ```

3. **Assessment Phase**
   ```
   Backend processes assessment:
   1. Fetch user profile → Get DOB & Gender
   2. Calculate Age from DOB → Auto-populate Age feature
   3. Map Gender → Auto-populate Gender feature (Male=1, Female=0)
   4. Map user answers → Populate other 14 features
   5. Calculate BMI → Auto-populate Obesity feature
   6. Send all 16 features to ML model
   
   → Diabetes risk prediction returned
   ```

---

## 🧮 AGE CALCULATION LOGIC

**Birthday Handling Example:**

```javascript
User DOB: March 15, 1990
Today: January 26, 2026

Step 1: Year difference = 2026 - 1990 = 36
Step 2: Check if birthday occurred this year
        - Today's month (1) < Birth month (3) ✅
        - Birthday hasn't occurred yet this year
Step 3: Subtract 1 from age
        - Age = 36 - 1 = 35

Result: Age = 35 (accurate!)
```

**If today was April 1, 2026:**
```javascript
Step 1: Year difference = 2026 - 1990 = 36
Step 2: Check if birthday occurred
        - Today's month (4) > Birth month (3) ✅
        - Birthday already occurred
Step 3: No adjustment needed
        - Age = 36

Result: Age = 36 (accurate!)
```

---

## 🔒 VALIDATION & ERROR HANDLING

### Registration Validation:
```javascript
✅ Missing DOB → "All fields are required (name, email, password, date of birth, and gender)"
✅ Missing Gender → Same error message
✅ Invalid Gender → "Gender must be either Male or Female"
✅ Invalid Date → Native browser date validation (DatePicker component)
```

### Assessment Validation:
```javascript
✅ Missing DOB in profile → "Please complete your profile with date of birth and gender"
✅ Missing Gender in profile → Same error + missing_profile_fields object
✅ Invalid DOB format → JavaScript Date handles gracefully
```

### Backward Compatibility:
```javascript
✅ Existing users without DOB/Gender → Assessment blocked with clear error
✅ Migration needed for existing users → Admin can update profiles manually
✅ Graceful fallback → If userData not provided, defaults to 0 (with console warning)
```

---

## 📝 CONSOLE LOGGING

**During Assessment:**
```
🔄 Processing answers from 15 questions
👤 Auto-populated Age from profile: 35 (DOB: Sat Mar 15 1990)
👤 Auto-populated Gender from profile: Male → 1
📊 Mapping question "What is your height?" → Feature: "height_cm"
  ✅ Unit conversion: 170.18
📊 Mapping question "What is your weight? (in kg)" → Feature: "weight_kg"
  ✅ Extracted number: 75
💪 Calculated BMI: 25.9 → Obesity: 1 (Height: 170.18cm, Weight: 75kg)
📊 Mapping question "Do you experience frequent urination?" → Feature: "Polyuria"
  ✅ Mapped via value_mapping: "Yes" → 1
... (11 more symptoms)
📋 Final features: {
  Age: 35,
  Gender: 1,
  Obesity: 1,
  Polyuria: 1,
  Polydipsia: 0,
  ...
}
```

---

## 🧪 TESTING CHECKLIST

### Backend Tests:
- [ ] Register new user with all fields → Success
- [ ] Register without DOB → Error "All fields required"
- [ ] Register without Gender → Error "All fields required"
- [ ] Register with invalid Gender → Error "Gender must be Male or Female"
- [ ] Run assessment with complete profile → Age & Gender auto-populated
- [ ] Run assessment without DOB in profile → Error with missing_profile_fields
- [ ] Verify age calculation for various DOBs → Matches manual calculation
- [ ] Verify gender mapping → Male=1, Female=0

### Frontend Tests:
- [ ] Signup form validates DOB as required
- [ ] Signup form validates Gender as required
- [ ] DatePicker allows date selection
- [ ] Gender dropdown shows Male/Female options
- [ ] Onboarding doesn't show Age question
- [ ] Onboarding doesn't show Gender question
- [ ] Assessment completes successfully with 15 questions (not 17)

### Integration Tests:
- [ ] Complete flow: Signup → Onboarding → Assessment
- [ ] Verify ML model receives all 16 features
- [ ] Verify Age matches calculated age from DOB
- [ ] Verify Gender matches profile value

---

## 🎉 BENEFITS

### For Users:
✅ **Less Repetition** - Don't answer age/gender twice  
✅ **Faster Onboarding** - 2 fewer questions (11% reduction)  
✅ **More Accurate** - Age always current (calculated from DOB)  
✅ **Better UX** - Streamlined assessment flow  

### For System:
✅ **Data Consistency** - Single source of truth (user profile)  
✅ **Accuracy** - Age calculated precisely, not user-entered  
✅ **Validation** - Profile completeness checked before assessment  
✅ **Maintainability** - Less duplication, cleaner code  

### For ML Model:
✅ **Reliable Inputs** - Age always accurate (not stale user input)  
✅ **Consistent Format** - Gender always in correct format (Male=1, Female=0)  
✅ **Complete Data** - Validation ensures required fields present  
✅ **Better Predictions** - More accurate features = better results  

---

## 🚀 DEPLOYMENT STEPS

1. **Run Database Seed:**
   ```bash
   cd backend
   npm run seed
   ```
   This removes Age and Gender questions from database.

2. **Verify Existing Users:**
   ```bash
   # Check how many users lack DOB/Gender
   db.users.count({ $or: [
     { date_of_birth: null },
     { gender: null }
   ]})
   ```

3. **Migration (if needed):**
   If existing users lack DOB/Gender, either:
   - Prompt them to complete profile on next login
   - Admin manually updates profiles
   - Use default values (not recommended)

4. **Test Assessment:**
   ```bash
   # Complete signup with new user
   # Run onboarding (15 questions)
   # Run assessment
   # Verify Age and Gender in console logs
   ```

---

## 📌 NOTES

- **No Frontend Changes** - Signup form already had date picker and gender dropdown
- **Age Always Current** - Calculated from DOB, not stored value
- **Birthday Accuracy** - Handles birthday edge cases correctly
- **Gender Mapping** - Normalized to ML model expectations (Male=1, Female=0)
- **Backward Compatible** - Graceful error for users without profile data
- **Console Logging** - Detailed logs for debugging age/gender population

---

**Status:** ✅ READY FOR TESTING  
**Questions Reduced:** 17 → 15 (2 removed)  
**User Experience:** Improved (less repetition)  
**Data Accuracy:** Enhanced (calculated age vs entered age)

