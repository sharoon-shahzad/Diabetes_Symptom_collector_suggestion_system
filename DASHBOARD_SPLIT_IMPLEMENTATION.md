# Dashboard Split Implementation – Undiagnosed vs Diagnosed

## Overview
This implementation creates **two completely separate dashboards** based on the user's diabetes diagnosis status (`diabetes_diagnosed`):

1. **Undiagnosed Dashboard** – For users who have NOT been diagnosed (status: `'no'` or `null`)
2. **Diagnosed Dashboard** – For users who HAVE been diagnosed (status: `'yes'`)

---

## Architecture

### 1. Section Definitions
Two distinct section arrays are defined at the top of `Dashboard.jsx`:

**Undiagnosed Sections:**
```
- Insights
- My Account
- My Disease Data
- Check My Risk
- My Feedback
```

**Diagnosed Sections:**
```
- Insights
- My Account
- Personalized Suggestions
- My Feedback
```

### 2. Dynamic Section Selection
The `sections` array is computed dynamically via `useMemo()` based on `user?.diabetes_diagnosed`:

```javascript
const sections = useMemo(() => {
  if (user?.diabetes_diagnosed === 'yes') return diagnosedSections;
  return undiagnosedSections;
}, [user?.diabetes_diagnosed]);
```

### 3. Section Label Tracking
A `currentSection` variable tracks the label of the selected section:

```javascript
const currentSection = sections[selectedIndex]?.label;
```

### 4. Index Clamping
When sections change (e.g., user switches from undiagnosed to diagnosed), the `selectedIndex` is automatically clamped to prevent out-of-bounds access:

```javascript
useEffect(() => {
  if (selectedIndex >= sections.length) {
    setSelectedIndex(0);
  }
}, [sections.length, selectedIndex]);
```

### 5. Dynamic Disease Data Fetching
Disease data is fetched when `currentSection` changes instead of using fixed indices:

```javascript
useEffect(() => {
  if (currentSection === 'Insights' || currentSection === 'My Disease Data') {
    // Fetch disease data
  }
}, [currentSection]);
```

---

## User Flows

### First-Time User (Undiagnosed)
1. **Logs in** → `/dashboard`
2. **Diagnosis popup appears** → "Have you been diagnosed with diabetes?"
3. **Selects "No"** → Popup closes, stays on undiagnosed dashboard
4. **Sees dashboard with:** Insights, My Account, My Disease Data, **Check My Risk**, My Feedback
5. **Can click "Check My Risk"** → Navigate to `/assessment`

### First-Time User (Diagnosed)
1. **Logs in** → `/dashboard`
2. **Diagnosis popup appears** → "Have you been diagnosed with diabetes?"
3. **Selects "Yes"** → 
   - Diagnosis flag updated in backend + frontend
   - Sidebar sections **instantly switch** to diagnosed set
   - Dashboard focuses on **Personalized Suggestions** tab
4. **Sees dashboard with:** Insights, My Account, **Personalized Suggestions**, My Feedback

### Returning Undiagnosed User
1. **Logs in** → `/dashboard`
2. **No popup** (diagnosis status already set to `'no'`)
3. **Sees undiagnosed dashboard**

### Returning Diagnosed User
1. **Logs in** → `/dashboard`
2. **No popup** (diagnosis status already set to `'yes'`)
3. **Sees diagnosed dashboard with Personalized Suggestions tab**

---

## Section-Specific Behavior

### Undiagnosed Dashboard

#### Insights Tab
- Shows risk summary cards
- Shows quick actions
- Shows disease data snippets
- Fetches disease data on render

#### My Account Tab
- Profile editing
- Email display (read-only)
- Password reset option
- Theme preferences

#### My Disease Data Tab
- Full health profile with disease tracking
- Questions answered and completion progress
- Activity timeline
- Edit button to update disease data

#### Check My Risk Tab
- **Only appears for undiagnosed users**
- Offers two CTA buttons:
  1. **"Check my risk now"** → Navigate to `/assessment`
  2. **"Update my info first"** → Navigate to `/onboarding`

#### My Feedback Tab
- User feedback history
- Feedback submission form

---

### Diagnosed Dashboard

#### Insights Tab
- Shows risk summary cards
- Shows quick actions
- Shows disease data snippets (if any)
- Fetches disease data on render

#### My Account Tab
- Same as undiagnosed dashboard

#### Personalized Suggestions Tab
- **Only appears for diagnosed users**
- Hub to access personalized system
- Button: **"Go to Personalized Suggestions"** → Navigate to `/personalized-suggestions/dashboard`
- This then gates access to:
  - Personal & Medical Information (with 100% completion requirement)
  - Diet Plan (unlocked when personal/medical info is 100% complete)
  - Exercise Plan (unlocked when personal/medical info is 100% complete)
  - Lifestyle Tips (unlocked when personal/medical info is 100% complete)
  - Chat Assistant (unlocked when personal/medical info is 100% complete)

#### My Feedback Tab
- Same as undiagnosed dashboard

---

## Access Control

### Diagnosis Gating
- **Check My Risk tab:** Only visible when `user.diabetes_diagnosed !== 'yes'`
- **Personalized Suggestions tab:** Only visible when `user.diabetes_diagnosed === 'yes'`

### Additional Gating (PersonalizedSuggestionDashboard.jsx)
- **Route `/personalized-suggestions/dashboard`:** 
  - On mount, checks if user is diagnosed
  - If NOT diagnosed → Redirects to `/dashboard` with toast warning
  - If diagnosed → Allows access

- **Info Completion Requirement:**
  - Diet, Exercise, Lifestyle, Chat tiles locked until Personal & Medical Info is 100% complete
  - Clicking locked tile shows info toast
  - Users guided to complete personal/medical info first

---

## Code Changes

### File: `frontend/src/pages/Dashboard.jsx`

**Additions:**
1. Two separate section arrays: `undiagnosedSections` and `diagnosedSections`
2. Computed `sections` from user diagnosis status
3. Computed `currentSection` label tracker
4. Effect to clamp `selectedIndex` when sections change
5. Changed disease data fetching from index-based to label-based
6. Changed diagnosis answer handler to focus Personalized Suggestions tab instead of navigating away
7. Changed all tab rendering from `selectedIndex === N` to `currentSection === 'Label'`
8. Removed conditional branches within tabs (e.g., no more `if diagnosed then X else Y`)

**Deletions:**
- Old mixed index-based conditions for tabs
- Conditional branches within Check My Risk tab (was showing different content for diagnosed vs undiagnosed)

### File: `frontend/src/pages/PersonalizedSuggestionDashboard.jsx`

**Additions:**
1. Authorization check on mount using `getCurrentUser()`
2. Redirect + toast if user is not diagnosed
3. Hard gate on sections (diet/exercise/lifestyle/chat) locked until 100% personal/medical info complete
4. Completion-based section activation logic
5. Toast feedback when clicking locked sections
6. Loading state while auth is checked

**Impact:**
- Users cannot manually type `/personalized-suggestions/dashboard` and bypass the dashboard
- Personal & Medical Info is ALWAYS the first thing to complete
- Smooth UX with loading state and clear messaging

---

## Clean Separation Benefits

✅ **Clear Mental Model**: Each user knows exactly which dashboard they're in  
✅ **No Mixing**: Risk assessment and personalized suggestions never mixed  
✅ **Easy Navigation**: Sidebar dynamically updates to show only relevant sections  
✅ **No "Feature Locked" Messaging on Wrong Dashboard**: Each tab is purpose-built  
✅ **Safe Transitions**: Index clamping prevents errors when diagnosis status changes  
✅ **Future-Proof**: Easy to add more sections to either dashboard independently  

---

## Testing Checklist

- [ ] **Undiagnosed flow**: Log in → See undiagnosed dashboard → "Check My Risk" visible
- [ ] **Diagnosed flow**: Log in → Answer "Yes" → See diagnosed dashboard → "Personalized Suggestions" visible
- [ ] **Manual diagnosis**: Undiagnosed user changes status → Sidebar updates instantly
- [ ] **Risk assessment**: Click "Check my risk now" → Navigate to `/assessment`
- [ ] **Personalized access**: Click "Go to Personalized Suggestions" → Navigate to hub → Info locked
- [ ] **Gating test**: Try typing `/personalized-suggestions/dashboard` as undiagnosed → Redirect to `/dashboard`
- [ ] **Completion**: Mark personal info complete → Diet/Exercise/Lifestyle/Chat unlock
- [ ] **Feedback**: Both dashboards have working feedback section
- [ ] **My Disease Data**: Only visible on undiagnosed; Insights available on both
