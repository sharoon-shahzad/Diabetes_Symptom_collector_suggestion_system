# 🧪 Testing the New UI/UX Design System

## Quick Component Test

### Option 1: Use the Modern Templates

**Test Dashboard:**
1. Backup current dashboard:
   ```bash
   cd mobile-app/app/(tabs)
   cp dashboard.tsx dashboard.BACKUP.tsx
   ```

2. Copy modern template:
   ```bash
   cp dashboard.MODERN.tsx dashboard.tsx
   ```

3. Run app:
   ```bash
   cd ../..
   npx expo start
   ```

4. Navigate to Dashboard tab and verify:
   - ✅ Modern card layout with proper spacing
   - ✅ Clean visual hierarchy
   - ✅ Health summary metrics
   - ✅ Quick action grid (2 columns)
   - ✅ Smooth touch feedback
   - ✅ Professional colors and typography

**Test Sign In:**
1. Backup current signin:
   ```bash
   cd mobile-app/app/(auth)
   cp signin.tsx signin.BACKUP.tsx
   ```

2. Copy modern template:
   ```bash
   cp signin.MODERN.tsx signin.tsx
   ```

3. Sign out of app, then test signin screen:
   - ✅ Clean form layout with proper spacing
   - ✅ Modern input fields with icons
   - ✅ Custom checkbox (Remember Me)
   - ✅ Validation error messages
   - ✅ Loading state when submitting

---

### Option 2: Create a Test Screen

Create `mobile-app/app/component-test.tsx`:

```tsx
/**
 * Component Test Screen
 * Test all new design system components
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '@components/common/Button';
import { Card } from '@components/common/Card';
import { TextInput } from '@components/common/TextInput';
import { EmptyState } from '@components/common/EmptyState';
import { ErrorState } from '@components/common/ErrorState';
import { colors } from '@theme/colors';
import { typography, textStyles } from '@theme/typography';
import { spacing } from '@theme/spacing';

export default function ComponentTest() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Typography Test */}
        <Card variant="elevated" padding={4}>
          <Text style={styles.sectionTitle}>Typography</Text>
          <Text style={textStyles.h1}>Heading 1</Text>
          <Text style={textStyles.h2}>Heading 2</Text>
          <Text style={textStyles.h3}>Heading 3</Text>
          <Text style={textStyles.body1}>Body text - 16px regular</Text>
          <Text style={textStyles.body2}>Small text - 14px regular</Text>
        </Card>

        {/* Button Test */}
        <Card variant="elevated" padding={4}>
          <Text style={styles.sectionTitle}>Buttons</Text>
          <View style={styles.buttonGrid}>
            <Button variant="primary" onPress={() => {}}>Primary</Button>
            <Button variant="secondary" onPress={() => {}}>Secondary</Button>
            <Button variant="outline" onPress={() => {}}>Outline</Button>
            <Button variant="ghost" onPress={() => {}}>Ghost</Button>
            <Button variant="danger" onPress={() => {}}>Danger</Button>
            <Button variant="primary" loading onPress={() => {}}>Loading</Button>
            <Button variant="primary" disabled onPress={() => {}}>Disabled</Button>
          </View>
        </Card>

        {/* Input Test */}
        <Card variant="elevated" padding={4}>
          <Text style={styles.sectionTitle}>Text Inputs</Text>
          <TextInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            leftIcon="email-outline"
            helperText="We'll never share your email"
          />
          <TextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            password
            leftIcon="lock-outline"
          />
          <TextInput
            label="With Error"
            placeholder="Test error state"
            value=""
            onChangeText={() => {}}
            error="This field is required"
            leftIcon="alert-circle-outline"
          />
        </Card>

        {/* Card Variants Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Variants</Text>
          <Card variant="elevated" padding={4}>
            <Text>Elevated Card (with shadow)</Text>
          </Card>
          <Card variant="flat" padding={4}>
            <Text>Flat Card (no shadow)</Text>
          </Card>
          <Card variant="outlined" padding={4}>
            <Text>Outlined Card (with border)</Text>
          </Card>
          <Card variant="elevated" padding={4} onPress={() => alert('Tapped!')}>
            <Text>Touchable Card (press me)</Text>
          </Card>
        </View>

        {/* Color Test */}
        <Card variant="elevated" padding={4}>
          <Text style={styles.sectionTitle}>Colors</Text>
          <View style={styles.colorGrid}>
            <View style={[styles.colorBox, { backgroundColor: colors.primary[600] }]}>
              <Text style={styles.colorLabel}>Primary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.success.main }]}>
              <Text style={styles.colorLabel}>Success</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.warning.main }]}>
              <Text style={[styles.colorLabel, { color: colors.neutral[900] }]}>Warning</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.error.main }]}>
              <Text style={styles.colorLabel}>Error</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.info.main }]}>
              <Text style={styles.colorLabel}>Info</Text>
            </View>
          </View>
        </Card>

        {/* Empty State Test */}
        <Card variant="elevated">
          <EmptyState
            icon="file-document-outline"
            title="No Data Yet"
            message="Start by adding your first item"
            onCtaPress={() => alert('CTA pressed!')}
            ctaLabel="Add Item"
          />
        </Card>

        {/* Spacing Test */}
        <Card variant="elevated" padding={4}>
          <Text style={styles.sectionTitle}>Spacing (8pt Grid)</Text>
          {[1, 2, 3, 4, 5, 6, 8].map((size) => (
            <View key={size} style={{ marginBottom: spacing[2] }}>
              <View
                style={{
                  height: spacing[size],
                  backgroundColor: colors.primary[200],
                  marginBottom: spacing[1],
                }}
              />
              <Text style={styles.spacingLabel}>
                spacing[{size}] = {spacing[size]}px
              </Text>
            </View>
          ))}
        </Card>

        {/* Back Button */}
        <Button
          variant="outline"
          onPress={() => router.back()}
          fullWidth
        >
          Back to App
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background.secondary,
  },
  content: {
    padding: spacing[4],
    gap: spacing[4],
  },
  sectionTitle: {
    fontSize: textStyles.h5.fontSize,
    fontWeight: textStyles.h5.fontWeight,
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  section: {
    gap: spacing[3],
  },
  buttonGrid: {
    gap: spacing[3],
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  colorBox: {
    width: 100,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[0],
    fontWeight: typography.fontWeight.semiBold,
  },
  spacingLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[600],
  },
});
```

Then navigate to `/component-test` in your app.

---

## Visual Regression Testing

### Before/After Comparison

**Check these visual aspects:**

#### ✅ Spacing
- All padding/margins use 8pt grid (4, 8, 12, 16, 24, 32, 48)
- Consistent gaps between elements
- No arbitrary values (like 15px, 23px)

#### ✅ Typography
- Clear visual hierarchy (H1 largest → body smallest)
- Proper line heights (readable, not cramped)
- Consistent font weights
- No pixel-sized text (minimum 12px)

#### ✅ Colors
- Soft, professional colors (no harsh #FF0000 reds)
- Good contrast (text readable on backgrounds)
- Semantic meaning (green=success, red=error)

#### ✅ Touch Targets
- All buttons ≥44px minimum height
- Comfortable tap targets (48px ideal)
- No tiny clickable elements

#### ✅ Elevation
- Subtle shadows (barely noticeable)
- Cards slightly lifted from background
- No heavy drop shadows

#### ✅ Border Radius
- Modern rounded corners (12-20px)
- Consistent across similar elements
- Not too round (not pill-shaped unless intended)

---

## Device Testing

### Test on Multiple Screens:

**Small Phone (iPhone SE):**
- All content fits without horizontal scroll
- Touch targets large enough
- Text readable

**Large Phone (iPhone 15 Pro Max, Pixel 8 Pro):**
- Proper use of white space
- Content doesn't look sparse
- Cards scale appropriately

**Tablet (iPad):**
- Layout adapts to larger screen
- Multi-column layouts where appropriate

---

## Accessibility Testing

### Enable Accessibility Features:

**iOS:**
- Settings → Accessibility → Display & Text Size → Larger Text
- Verify text scales appropriately

**Android:**
- Settings → Display → Font size (Large or Largest)
- Verify layout doesn't break

### Screen Reader Testing:

**iOS VoiceOver:**
```bash
Settings → Accessibility → VoiceOver → On
```
- All buttons should announce their purpose
- Proper reading order (top to bottom, left to right)

**Android TalkBack:**
```bash
Settings → Accessibility → TalkBack → On
```
- Same checks as iOS

---

## Performance Testing

### Verify Performance:

1. **Scroll Performance:**
   - Dashboard should scroll smoothly (60fps)
   - No stuttering when scrolling lists
   - Images load without blocking UI

2. **Touch Responsiveness:**
   - Buttons respond immediately to touch
   - No delay in feedback
   - Active opacity change is immediate

3. **Animation Performance:**
   - Loading spinners smooth
   - Screen transitions smooth
   - No janky animations

---

## Component-Specific Tests

### Button Component:

Test all variants + states:
- [ ] Primary variant (solid color)
- [ ] Secondary variant (gray background)
- [ ] Outline variant (transparent + border)
- [ ] Ghost variant (no background/border)
- [ ] Danger variant (red)
- [ ] Loading state (spinner shows)
- [ ] Disabled state (50% opacity)
- [ ] Touch feedback (darkens on press)
- [ ] Full-width works
- [ ] Icon + text works

### TextInput Component:

Test all states:
- [ ] Default state (gray border)
- [ ] Focus state (blue border)
- [ ] Error state (red border + message)
- [ ] Disabled state (gray, non-interactive)
- [ ] Password toggle works
- [ ] Left icon shows
- [ ] Helper text displays
- [ ] Keyboard opens properly
- [ ] Auto-complete works

### Card Component:

Test variants:
- [ ] Elevated (with shadow)
- [ ] Flat (no shadow)
- [ ] Outlined (with border)
- [ ] Touchable (onPress works)
- [ ] Custom padding works

---

## Integration Testing

### Test User Flows:

**1. Sign In Flow:**
- [ ] Navigate to sign-in screen
- [ ] Enter invalid email → See error
- [ ] Enter short password → See error
- [ ] Enter valid credentials → Sign in succeeds
- [ ] Navigate to dashboard

**2. Dashboard Interaction:**
- [ ] Pull to refresh works
- [ ] Quick action cards navigate correctly
- [ ] Heath metrics display
- [ ] Notification button pressable

**3. Form Interaction:**
- [ ] Keyboard doesn't cover inputs
- [ ] Tab between fields works
- [ ] Submit button disables during loading
- [ ] Success/error messages display

---

## Common Issues & Fixes

### Issue: Keyboard Covers Input

**Fix:**
```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  {/* Your form */}
</KeyboardAvoidingView>
```

### Issue: Touch Target Too Small

**Fix:**
```tsx
// Ensure minimum 44px
minHeight: layout.touchTarget.min,
minWidth: layout.touchTarget.min,

// Or use comfortable size (48px)
minHeight: layout.touchTarget.comfortable,
```

### Issue: Colors Don't Match Design

**Fix:**
```tsx
// Use new color palette
backgroundColor: colors.primary[600],  // Not colors.primary.main
color: colors.neutral[900],            // Not colors.light.text.primary
```

### Issue: Spacing Inconsistent

**Fix:**
```tsx
// Always use spacing scale
padding: spacing[4],          // Not padding: 16
marginBottom: spacing[6],     // Not marginBottom: 24
gap: spacing[3],              // Not gap: 12
```

---

## Final Checklist

Before shipping ui/ux redesign:

- [ ] All screens use new components
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No console warnings in runtime
- [ ] All touch targets ≥44px
- [ ] Proper spacing (8pt grid)
- [ ] Professional colors (no harsh colors)
- [ ] Clear typography hierarchy
- [ ] Subtle shadows (no heavy elevation)
- [ ] Accessibility labels on interactive elements
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Empty states shown
- [ ] Smooth 60fps scrolling
- [ ] Keyboard handling works
- [ ] Tested on iOS device
- [ ] Tested on Android device
- [ ] Screen reader tested
- [ ] Large text tested

---

## Quick Test Commands

```bash
# Type check
cd mobile-app
npm run type-check

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Clear cache if needed
npx expo start --clear

# Production build test
npx expo build:ios --no-publish
npx expo build:android --no-publish
```

---

## Need Help?

**Reference Files:**
- `UI_REDESIGN_COMPLETE.md` - Full documentation
- `REDESIGN_SUMMARY.md` - Migration guide
- `dashboard.MODERN.tsx` - Example dashboard
- `signin.MODERN.tsx` - Example sign-in

**Common Patterns:**
- Grid layout: See dashboard.MODERN.tsx (Quick Actions)
- Form layout: See signin.MODERN.tsx
- Card composition: See dashboard.MODERN.tsx (Health Summary)

**Testing Strategy:**
1. Start with component test screen (create one)
2. Then test template screens (dashboard, signin)
3. Then gradually migrate remaining screens
4. Test each screen on device after migration
