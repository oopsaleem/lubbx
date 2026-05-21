# Feature Specification: Sidebar Navigation Replacement

**Feature Branch**: `003-sidebar-replacement`
**Created**: 2026-05-19
**Status**: Draft
**Input**: User description: "Replace the NavBar with shadcn-ui sidebar component"

## Clarifications

### Session 2026-05-19

- Q: Should the `useSidebarLayout` config option remain as a toggle between top-nav and sidebar, or should the sidebar replace the NavBar entirely? → A: Replace entirely — remove the old NavBar, remove `useSidebarLayout` config, always show the sidebar.

## User Scenarios & Testing

### User Story 1 - Navigate application via sidebar (Priority: P1)

A user who has logged into the application should be able to navigate between all available sections (Dashboard, AI Chatbot, Settings, Admin) through a persistent sidebar. The sidebar clearly indicates which section is currently active, supports both LTR and RTL directions, and collapses to icon-only mode on smaller viewports or when manually triggered.

**Why this priority**: Navigation is the primary function of the sidebar — without it users cannot move between app sections. This is the core value proposition.

**Independent Test**: Can be fully tested by authenticating as any user, landing on the dashboard, clicking each menu item, and verifying the correct page loads with the active state visibly highlighted. Delivers immediate value by replacing the current navigation.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and viewing any app page, **When** they click a sidebar menu item, **Then** they are navigated to the corresponding section and the active item is visually highlighted
2. **Given** a user with admin privileges, **When** they view the sidebar, **Then** they see the Admin menu item in addition to standard menu items
3. **Given** a sidebar with many menu items, **When** the list exceeds the viewport height, **Then** the content area scrolls independently while the header and footer remain sticky

---

### User Story 2 - Collapse and expand sidebar (Priority: P1)

A user should be able to collapse the sidebar to an icon-only state to reclaim screen real estate, and expand it back to full width. The collapsed state persists across page navigations. A keyboard shortcut (Cmd+B / Ctrl+B) triggers the toggle for power users.

**Why this priority**: Screen space optimization is a core feature of collapsible sidebars and directly impacts daily usability. Combined with Story 1, this delivers a complete navigation experience.

**Independent Test**: Can be verified independently by clicking the collapse trigger and confirming the sidebar transitions to icon-only mode, then expanding it again. The shortcut can be tested separately as a power-user enhancement.

**Acceptance Scenarios**:

1. **Given** the sidebar is in expanded state, **When** the user clicks the collapse trigger, **Then** the sidebar collapses to show only icons
2. **Given** the sidebar is in collapsed state, **When** the user clicks the expand trigger, **Then** the sidebar returns to full width
3. **Given** the sidebar is in collapsed state, **When** the user navigates to a different page, **Then** the collapsed state is preserved
4. **Given** the sidebar is expanded, **When** the user presses Cmd+B (Mac) or Ctrl+B (Windows/Linux), **Then** the sidebar collapses

---

### User Story 3 - Mobile sidebar behavior (Priority: P2)

On mobile devices, the sidebar should appear as an overlay (drawer/sheet) that slides in from the side when triggered, rather than a fixed column. Tapping outside the drawer closes it.

**Why this priority**: Mobile support is important for usability on small screens, but the desktop experience delivers the primary value.

**Independent Test**: Can be tested by resizing the browser to mobile viewport width and verifying the sidebar becomes a slide-in drawer that opens/closes correctly.

**Acceptance Scenarios**:

1. **Given** a user is on a mobile device, **When** they open the sidebar, **Then** it appears as an overlay sliding in from the appropriate side (left for LTR, right for RTL)
2. **Given** the mobile sidebar is open, **When** the user taps outside the sidebar, **Then** it closes

---

### User Story 4 - RTL support for Arabic users (Priority: P2)

The sidebar correctly positions itself on the right side when the locale is Arabic (RTL). All icons, spacing, and animations are mirrored appropriately for the RTL reading direction.

**Why this priority**: The application already supports Arabic locale with RTL layout. The sidebar must maintain consistency with the existing RTL experience.

**Independent Test**: Can be tested by switching the locale to Arabic and verifying the sidebar appears on the right side, collapses toward the right, and all directional elements are flipped.

**Acceptance Scenarios**:

1. **Given** the locale is Arabic (RTL), **When** the user views the page, **Then** the sidebar appears on the right side of the viewport
2. **Given** the locale is Arabic (RTL) and the sidebar is collapsed, **When** the user opens it, **Then** it expands toward the left
3. **Given** the locale is Arabic (RTL), **When** the sidebar trigger is clicked, **Then** the toggle icon is flipped to match RTL direction

---

### Edge Cases

- What happens when a user has no organization assigned? The sidebar should still show core navigation items (Dashboard, Settings) without requiring an organization context
- What happens when the sidebar contains many menu items? The content area scrolls independently from the header (branding) and footer (user menu)
- How does the sidebar behave when an admin navigates to a non-admin page? The admin menu item should not appear, preventing navigation confusion
- What happens when the sidebar trigger is clicked rapidly? The toggle should debounce or complete the current animation before accepting new input

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a persistent navigation sidebar on all authenticated app pages
- **FR-002**: Sidebar MUST include links to all available sections based on user role and organization context
- **FR-003**: Sidebar MUST indicate the currently active page with a clear visual distinction
- **FR-004**: Sidebar MUST support collapsing to icon-only mode and expanding back to full width
- **FR-005**: Collapsed/expanded state MUST persist during the browsing session
- **FR-006**: Sidebar MUST include a toggle trigger that users can click to collapse or expand
- **FR-007**: System MUST support a keyboard shortcut (Cmd+B / Ctrl+B) to toggle sidebar state
- **FR-008**: On mobile viewports, sidebar MUST render as an overlay/drawer that slides in and out
- **FR-009**: Mobile overlay MUST close when tapping outside its boundaries
- **FR-010**: Sidebar MUST position on the right side when locale is RTL (Arabic) and on the left side when locale is LTR
- **FR-011**: Sidebar MUST include branding/logo at the top in a sticky header area
- **FR-012**: Sidebar MUST include user account menu at the bottom in a sticky footer area
- **FR-013**: Sidebar MUST include an organization/workspace selector when organizations feature is enabled
- **FR-014**: Sidebar groups MUST support labels and optional collapsible group sections
- **FR-015**: Sidebar MUST use the application's existing theme (light/dark) consistently
- **FR-016**: Old NavBar component and its `useSidebarLayout` config option MUST be removed as part of this feature

### Key Entities

- **Navigation Menu Item**: Represents a single destination within the sidebar (icon, label, href, active state). Can be conditionally shown based on user role and feature flags.
- **Sidebar Configuration**: Represents the sidebar's state (expanded/collapsed), position (left/right based on locale), and visibility on mobile.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can navigate to any app section in 2 clicks or fewer from any authenticated page
- **SC-002**: Sidebar collapses and expands in under 300ms animation time
- **SC-003**: Sidebar renders correctly in both LTR and RTL locales without visual defects
- **SC-004**: Sidebar maintains consistent appearance across all authenticated pages
- **SC-005**: Mobile sidebar overlay opens and closes without page layout shift
- **SC-006**: Old NavBar component is fully removed with no remaining references in authenticated app pages

## Assumptions

- The sidebar replaces the authenticated app NavBar entirely; the old NavBar component and its `useSidebarLayout` config option are removed
- Marketing pages retain their existing navigation (outside the scope of this feature)
- The existing application layout structure (AppWrapper, route groups) will be adapted to integrate with the new sidebar, replacing the `md:ml-[280px]` approach with the sidebar's native layout
- Existing menu items, their ordering, and conditional visibility rules (admin role, organization context) will be preserved
- The sidebar will use the application's existing CSS theme variables for colors and spacing
- Icons for menu items will remain consistent with the current set (lucide-react icons)
