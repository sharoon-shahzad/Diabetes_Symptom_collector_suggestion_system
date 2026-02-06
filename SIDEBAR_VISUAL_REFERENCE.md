# Sidebar States Visual Reference

## Desktop - Expanded State (260px)
```
┌─────────────────────────────────────────────────┐
│  [D] DiabetesCare               [<]             │  ← Header
├─────────────────────────────────────────────────┤
│  [👤] Admin User                                │  ← User Profile
│       SUPER ADMIN                               │
├─────────────────────────────────────────────────┤
│  [📊] Manage Diseases                           │
│  [🐛] Manage Symptoms                           │  ← Navigation
│  [❓] Manage Questions                          │     Menu
│  [👥] User Management                           │
│  [📄] Content Management                        │
│  [💬] Feedback (Admin)                          │
│  [📜] Audit Logs                                │
│  [📁] Document Upload                           │
│  [👑] Manage Admins                             │
│  [🔐] Manage Roles & Permissions                │
│  [⚙️] Settings                                  │
│                                                 │
│                ... scrollable ...               │
│                                                 │
├─────────────────────────────────────────────────┤
│              [🌙/☀️]                             │  ← Theme Toggle
│           [🚪 Logout]                           │  ← Logout Button
└─────────────────────────────────────────────────┘
```

## Desktop - Collapsed State (72px)
```
┌─────────┐
│   [>]   │  ← Toggle Button
├─────────┤
│   [👤]  │  ← User Avatar (hover: name)
├─────────┤
│   [📊]  │  ← Icons only
│   [🐛]  │     (tooltips on hover)
│   [❓]  │
│   [👥]  │
│   [📄]  │
│   [💬]  │
│   [📜]  │
│   [📁]  │
│   [👑]  │
│   [🔐]  │
│   [⚙️]  │
│         │
│    ...  │
│         │
├─────────┤
│  [🌙]   │  ← Theme Toggle
│  [🚪]   │  ← Logout Icon
└─────────┘
```

## Mobile State (280px)
```
┌─────────────────────────────────────────────────────┐
│  [D] DiabetesCare                                   │
├─────────────────────────────────────────────────────┤
│  [👤] Admin User                                    │
│       SUPER ADMIN                                   │
├─────────────────────────────────────────────────────┤
│  [📊] Manage Diseases                               │
│  [🐛] Manage Symptoms                               │
│  [❓] Manage Questions                              │
│  ... (same as expanded desktop)                    │
├─────────────────────────────────────────────────────┤
│              [🌙/☀️]                                 │
│           [🚪 Logout]                               │
└─────────────────────────────────────────────────────┘
```

## Color States

### Menu Item - Default (Light Theme)
```
Background: transparent
Text: #6b7280 (gray-500)
Icon: #9ca3af (gray-400)
```

### Menu Item - Hover (Light Theme)
```
Background: #f3f4f6 (gray-100)
Text: #1f2937 (gray-800)
Icon: #6b7280 (gray-500)
```

### Menu Item - Active (Light Theme)
```
Background: #eff6ff (blue-50)
Text: #2563eb (blue-600) ← Project Primary
Icon: #2563eb (blue-600) ← Project Primary
```

### Menu Item - Default (Dark Theme)
```
Background: transparent
Text: #94a3b8 (slate-400)
Icon: #64748b (slate-500)
```

### Menu Item - Hover (Dark Theme)
```
Background: #1e293b (slate-800)
Text: #f1f5f9 (slate-100)
Icon: #94a3b8 (slate-400)
```

### Menu Item - Active (Dark Theme)
```
Background: #1e3a8a (blue-900)
Text: #60a5fa (blue-400) ← Project Primary Dark
Icon: #60a5fa (blue-400) ← Project Primary Dark
```

## Spacing & Typography

### Expanded State
- Item Height: 44px
- Item Padding: 10px 12px
- Icon Size: 20px
- Font Size: 14px
- Font Weight: 500 (normal), 600 (active)
- Gap between items: 4px

### Collapsed State
- Item Height: 44px
- Item Padding: 10px 16px (centered)
- Icon Size: 20px
- Font Size: N/A (icons only)
- Font Weight: N/A
- Gap between items: 4px

### User Section
- Avatar Size: 40px
- Avatar Border Radius: 12px
- Username Font: 14px, 600 weight
- Role Font: 11px, 500 weight, uppercase

## Transitions
All state changes animate smoothly over 300ms:
- Width changes (260px ↔ 72px)
- Padding changes
- Opacity (text fade in/out)
- Background colors (hover, active)
- Icon colors

## Breakpoints
- Mobile: 0px - 899px (temporary drawer)
- Desktop: 900px+ (permanent drawer)

## Z-Index Layers
- Sidebar: default (part of layout flow)
- Mobile Overlay: 1200 (Material-UI Drawer default)
- Mobile Menu Button: 1200

## Accessibility
- ✅ Keyboard navigable (Tab, Enter, Escape)
- ✅ Tooltips for collapsed state
- ✅ ARIA labels on buttons
- ✅ Focus indicators
- ✅ Screen reader friendly

## Responsive Behavior

### Desktop (≥ 900px)
- Permanent drawer
- Can toggle expanded/collapsed
- State persists during session
- No overlay

### Tablet/Mobile (< 900px)
- Temporary drawer
- Opens from left edge
- Overlay background (darkens content)
- Auto-closes on menu select
- Hamburger menu button (top-left)

## Integration Points

### AdminDashboard.jsx
```jsx
// Desktop Sidebar
<SuperAdminSidebar
  variant="permanent"
  open={sidebarOpen}
  onToggle={() => setSidebarOpen(!sidebarOpen)}
  selectedIndex={selectedIndex}
  onSectionChange={setSelectedIndex}
  sections={sections}
  user={user}
  onLogout={handleLogout}
  isMobile={false}
/>

// Mobile Sidebar
<SuperAdminSidebar
  variant="temporary"
  open={mobileOpen}
  onClose={() => setMobileOpen(false)}
  onToggle={() => setMobileOpen(!mobileOpen)}
  selectedIndex={selectedIndex}
  onSectionChange={setSelectedIndex}
  sections={sections}
  user={user}
  onLogout={handleLogout}
  isMobile={true}
/>
```

### Main Content Width Calculation
```jsx
width: { 
  xs: '100%', 
  md: `calc(100% - ${sidebarOpen ? '260px' : '72px'})` 
}
```

## Design Tokens Path
```
frontend/src/theme/sidebar-tokens.json
```

Import in any component:
```jsx
import sidebarTokens from '../theme/sidebar-tokens.json';

// Usage
const width = sidebarTokens.width.expanded; // "260px"
const color = sidebarTokens.colors.light.background; // "#ffffff"
```
