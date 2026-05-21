# Data Model: Sidebar Navigation

## Entities

### NavigationMenuItem

Represents a single clickable item in the sidebar.

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Display text (i18n key or resolved string) |
| `href` | string | Route path |
| `icon` | React component (lucide icon) | Icon displayed alongside label |
| `isActive` | boolean | Whether current route matches this item |
| `badge` | number (optional) | Notification count or badge value |
| `children` | NavigationMenuItem[] (optional) | Sub-menu items (nested) |
| `showWhen` | condition object (optional) | Visibility guard (role, feature flag) |

### SidebarConfig

Controls sidebar appearance and behavior.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `open` | boolean | true | Desktop sidebar expanded state |
| `openMobile` | boolean | false | Mobile sidebar sheet open state |
| `isMobile` | boolean | false | Whether viewport is mobile width |
| `direction` | "ltr" \| "rtl" | "ltr" | Text direction based on locale |

### SidebarState (Jotai atom)

Persists collapse state across navigation.

| Field | Type | Initial | Description |
|-------|------|---------|-------------|
| `desktopCollapsed` | boolean | false | Persists sidebar expanded/collapsed on desktop |

## State Transitions

```
Desktop:
  expanded ↔ collapsed (via trigger click or Cmd+B)

Mobile:
  hidden ↔ visible (via hamburger/trigger button, overlay)
  visible → hidden (tap outside or close button)
```

## Navigation Menu Groups

```
Group: Platform
  ├── Dashboard (Start) — always visible
  ├── AI Demo — always visible
  └── AI Chatbot — always visible

Group: Organization (conditional on config.organizations.enable)
  └── Organization Settings — visible when org context exists

Group: Account
  ├── Account Settings — always visible
  └── Admin (visible when user.role === "admin")
```
