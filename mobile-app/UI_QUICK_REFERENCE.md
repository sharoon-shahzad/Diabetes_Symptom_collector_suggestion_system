# Mobile App UI - Quick Reference Guide

## 🎨 Color Palette (Web App Colors)

```javascript
// Primary Colors
primary:      '#2563eb'  // Main blue - buttons, links
secondary:    '#64748b'  // Gray - secondary elements
success:      '#4caf50'  // Green - success states
warning:      '#ff9800'  // Orange - warnings, risks
error:        '#f44336'  // Red - errors, danger
info:         '#2196f3'  // Light blue - info messages

// Text Colors
textPrimary:  '#0f172a'  // Dark slate - headings, important text
textSecondary:'#475569'  // Medium gray - body text, descriptions

// Backgrounds
background:   '#f7f7fb'  // Light gray - main background
surface:      '#ffffff'  // White - cards, modals
border:       '#e0e0e0'  // Light gray - borders, dividers
```

## 📏 Typography Scale

```javascript
// Font Sizes
hero:        28px  // Hero/Welcome text
heading1:    22px  // Section headings
heading2:    20px  // Subsection headings
heading3:    18px  // Card titles
body:        15px  // Body text
bodySmall:   14px  // Secondary text
caption:     13px  // Labels, captions
tiny:        12px  // Badges, hints

// Font Weights
light:       400   // Body text
medium:      500   // Labels
semibold:    600   // Headings, buttons
bold:        700   // Hero, important
extrabold:   800   // Not used (too heavy)
```

## 🎯 Spacing System

```javascript
xs:   4px   // Tiny gaps
sm:   8px   // Small gaps
md:   12px  // Default gaps
lg:   16px  // Card padding
xl:   20px  // Section padding
xxl:  24px  // Major spacing
xxxl: 32px  // Hero spacing
```

## 📦 Component Sizes

```javascript
// Touch Targets
minimum:     40px × 40px  // Minimum touch size
comfortable: 44px × 44px  // Comfortable touch
spacious:    48px × 48px  // Spacious touch

// Icons
small:       16px  // Small inline icons
medium:      20px  // Standard icons
large:       24px  // Large action icons
xlarge:      32px  // Hero icons
xxlarge:     64px  // Empty state icons

// Avatars
small:       40px  // Header avatar
medium:      70px  // Drawer avatar
large:       90px  // Profile avatar

// Border Radius
small:       10px  // Badges, chips
medium:      12px  // Cards, buttons
large:       16px  // Modals
xlarge:      20px  // Not used
circle:      50%   // Avatars
```

## 🎭 Shadows & Elevation

```javascript
// Card Shadow (elevation: 2)
shadowColor: '#000'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.08
shadowRadius: 8

// Button Shadow (elevation: 3)
shadowColor: '#2563eb'  // or button color
shadowOffset: { width: 0, height: 3 }
shadowOpacity: 0.3
shadowRadius: 6

// Modal Shadow (elevation: 8)
shadowColor: '#000'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.2
shadowRadius: 12

// Drawer Shadow (elevation: 16)
shadowColor: '#000'
shadowOffset: { width: 4, height: 0 }
shadowOpacity: 0.25
shadowRadius: 16
```

## 🧩 Common Patterns

### Standard Card
```javascript
<View style={styles.card}>
  <Text style={styles.cardTitle}>Title</Text>
  <Text style={styles.cardSubtitle}>Subtitle</Text>
</View>

styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  }
}
```

### Primary Button
```javascript
<TouchableOpacity style={styles.primaryButton}>
  <Ionicons name="icon-name" size={22} color="#fff" />
  <Text style={styles.buttonText}>Button Text</Text>
</TouchableOpacity>

styles = {
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    elevation: 3,
  }
}
```

### Section Header
```javascript
<Text style={styles.sectionHeading}>Section Title</Text>

styles = {
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  }
}
```

## 🎨 Icon Guidelines

### Use Outline Icons
```javascript
✅ 'home-outline'
✅ 'person-outline'
✅ 'medical-outline'
✅ 'chatbubbles-outline'

❌ 'home' (filled)
❌ 'person' (filled)
```

### Icon Sizes by Context
```javascript
Header:        26px
Drawer:        20px
Action Cards:  24px
Stat Cards:    24px
Empty States:  72px
Buttons:       22px
```

### Icon Colors
```javascript
// Match section color
Home:          '#2563eb'
Profile:       '#64748b'
Health Data:   '#2196f3'
Risk Check:    '#ff9800'
Suggestions:   '#ff9800'
Chat:          '#2196f3'
Feedback:      '#4caf50'
```

## 📱 Layout Structure

```
SafeAreaView (edges: ['top'])
  ├── Header (floating, white, elevated)
  │   ├── Menu Button (left)
  │   ├── Title (center)
  │   └── Avatar (right)
  │
  ├── Content (scrollable, gray background)
  │   ├── Section (padding: 20)
  │   │   ├── Heading
  │   │   └── Cards (margin: 16)
  │   │
  │   └── Section
  │       └── Content
  │
  └── Modals (when active)
      ├── Drawer (left side)
      └── Popups (centered)
```

## 🔄 State Colors

```javascript
// Status Indicators
active:       '#4caf50'  // Green
inactive:     '#64748b'  // Gray
pending:      '#ff9800'  // Orange
error:        '#f44336'  // Red

// Risk Levels
veryLow:      '#4caf50'  // Green
low:          '#4caf50'  // Green
moderate:     '#ff9800'  // Orange
high:         '#ff9800'  // Orange
veryHigh:     '#f44336'  // Red
```

## 🎯 Do's and Don'ts

### ✅ DO
- Use web app colors exactly
- Keep spacing consistent
- Use outline icons
- Maintain 40px+ touch targets
- Use proper elevation
- Keep text readable (high contrast)
- Follow typography scale
- Test on different screens

### ❌ DON'T
- Introduce new colors
- Use gradients
- Add emojis to text
- Use glassmorphism
- Create custom animations
- Use filled icons unnecessarily
- Overcomplicate layouts
- Ignore spacing system

## 📊 Responsive Breakpoints

```javascript
// Phone (Default)
width < 375px   // Small phones
width < 414px   // Standard phones
width < 480px   // Large phones

// Tablet (Future)
width >= 768px  // Portrait tablet
width >= 1024px // Landscape tablet

// Current: Optimized for 360-414px width
```

## 🚀 Quick Commands

```bash
# Start development server
cd mobile-app
npm start

# Clear cache and restart
npm start -- --clear

# Check for errors
npx react-native doctor

# Build Android
npm run android

# Build iOS
npm run ios
```

## 📝 File Structure

```
mobile-app/
├── screens/
│   ├── UnifiedDashboardModern.js  ← Main dashboard
│   ├── DiseaseDataScreenNew.js    ← Health data
│   ├── AssessmentScreenNew.js     ← Risk check
│   └── ...
├── contexts/
│   ├── ThemeContext.js            ← Color definitions
│   └── AuthContext.js             ← User state
├── utils/
│   └── api.js                     ← API calls
└── App.js                         ← Root component
```

---

## 🎉 Summary

**Key Principles:**
1. **Consistency** - Match web app exactly
2. **Simplicity** - Clean, minimal design
3. **Professionalism** - No AI-generated look
4. **Usability** - Easy to navigate and use
5. **Performance** - Fast and responsive

**Remember:**
- Stick to defined colors
- Follow spacing system
- Use outline icons
- Keep it professional
- Test thoroughly

This refactored UI provides a **production-ready mobile experience** that users will love! 🚀
