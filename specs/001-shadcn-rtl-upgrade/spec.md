# Feature Specification: Shadcn RTL Upgrade

**Feature Branch**: `001-shadcn-rtl-upgrade`
**Created**: 2026-05-17
**Status**: Draft
**Input**: User description: "This is a Saas project was developed using shadcn before it was supporting RTL. we want to upgrade only shadcn components so it supports the RTL."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Arabic-Speaking User Browses the App in RTL (Priority: P1)

An Arabic-speaking user visits the app and expects all shadcn UI components to render correctly in right-to-left direction. Dropdown menus open on the correct side, dialogs animate from the right, and form inputs respect RTL text direction.

**Why this priority**: This is the primary goal — making shadcn components functional in RTL mode. Without this, Arabic users cannot use the app effectively.

**Independent Test**: Can be fully tested by switching the locale to Arabic (`ar`) and verifying that all shadcn-powered UI components (buttons, dialogs, dropdowns, forms, tables, cards, etc.) render with correct RTL layout and behavior.

**Acceptance Scenarios**:

1. **Given** the user has selected Arabic as their locale, **When** they navigate to any page, **Then** all shadcn UI components render with correct RTL text direction and layout
2. **Given** the user is on a page with a shadcn dialog component, **When** they open the dialog in Arabic locale, **Then** the dialog animates and positions correctly for RTL
3. **Given** the user is on a page with a shadcn dropdown menu, **When** they open the dropdown in Arabic locale, **Then** the menu aligns to the correct side
4. **Given** the user is on a page with a shadcn sheet component, **When** they open the sheet in Arabic locale, **Then** the sheet slides from the correct direction (right-to-left)
5. **Given** the user is on a page with a shadcn data table, **When** they view the table in Arabic locale, **Then** the table content flows right-to-left and column headers align correctly

---

### User Story 2 - Developer Adds New Shadcn Components with RTL Support (Priority: P2)

A developer adds a new shadcn component to the project and wants RTL support to work automatically without manual configuration.

**Why this priority**: Developer experience matters for maintainability. If RTL support requires manual work for each new component, it will degrade over time.

**Independent Test**: Can be tested by adding a new shadcn component via the CLI and verifying it renders correctly in both LTR and RTL modes without additional code changes.

**Acceptance Scenarios**:

1. **Given** the components.json has `rtl: true` configured, **When** a new shadcn component is added via the CLI, **Then** the generated component includes proper RTL-aware Tailwind classes
2. **Given** the project has DirectionProvider wrapping the app, **When** a new Radix-based shadcn component is added, **Then** it automatically responds to the RTL context

---

### User Story 3 - English User Experiences No Regression in LTR Mode (Priority: P2)

An English-speaking user continues to use the app and sees no visual or behavioral changes in left-to-right mode after the RTL upgrade.

**Why this priority**: The upgrade must not break existing LTR functionality. Regression in English mode is unacceptable.

**Independent Test**: Can be tested by running existing UI tests and manually verifying key pages in English locale look identical to before the upgrade.

**Acceptance Scenarios**:

1. **Given** the user has English set as their locale, **When** they interact with any shadcn component, **Then** all components render exactly as they did before the RTL upgrade
2. **Given** the components.json has `rtl: true`, **When** viewing the app in English, **Then** the `dir` attribute on the HTML element is `ltr`

---

### Edge Cases

- What happens when the locale switches between LTR and RTL at runtime? Does the UI transition smoothly?
- How does RTL affect form validation error messages — do they align correctly?
- What about third-party components (e.g., Fumadocs) that are not shadcn — do they need RTL adjustments?
- How does RTL affect the sidebar/navigation layout in the SaaS dashboard?
- What about the toast/sonner notifications in RTL mode?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add `rtl: true` to the shadcn configuration file (`components.json`)
- **FR-002**: System MUST install `@radix-ui/react-direction` as a direct dependency
- **FR-003**: System MUST create a `DirectionProvider` component accessible as `@ui/components/direction`
- **FR-004**: System MUST set the `dir` attribute on the root `<html>` tag based on the current locale (`rtl` for Arabic, `ltr` for English)
- **FR-005**: System MUST wrap the application with `DirectionProvider` from `@radix-ui/react-direction`, passing the correct direction value based on the current locale
- **FR-006**: Existing shadcn UI components MUST render correctly in both LTR and RTL modes without manual per-component direction handling
- **FR-007**: Components using directional Tailwind classes (`left-*`, `right-*`, `ml-*`, `mr-*`, `pl-*`, `pr-*`, `border-l-*`, `border-r-*`, etc.) MUST use RTL-aware alternatives (`start-*`, `end-*`, `ms-*`, `me-*`, `ps-*`, `pe-*`, `border-s-*`, `border-e-*`, etc.) where appropriate
- **FR-008**: System MUST NOT introduce any visual regressions in LTR (English) mode
- **FR-009**: Radix-based shadcn components (dialog, dropdown-menu, sheet, select, tooltip, etc.) MUST use DirectionProvider to correctly position popovers, modals, and menus in RTL mode

### Key Entities *(include if feature involves data)*

- **Locale Configuration**: The set of supported locales (`en`, `ar`) and their associated direction (`ltr`, `rtl`) defined in the app configuration
- **Direction Context**: The Radix DirectionProvider that propagates the current text direction to all Radix-based shadcn components

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 23 existing shadcn UI components render correctly in Arabic RTL mode with no layout issues
- **SC-002**: Zero visual regressions in English LTR mode when compared to the pre-upgrade state
- **SC-003**: New shadcn components added via CLI automatically include RTL support without manual intervention
- **SC-004**: The `dir` attribute is correctly set on the `<html>` element for both Arabic (`rtl`) and English (`ltr`) locales
- **SC-005**: Radix-powered components (dialog, dropdown-menu, sheet, select, tooltip, alert-dialog) position correctly in RTL mode with proper animation directions
- **SC-006**: All hardcoded directional CSS classes (`left`, `right`, `ml`, `mr`, `pl`, `pr`, `border-l`, `border-r`) in shadcn component files are replaced with logical property equivalents (`start`, `end`, `ms`, `me`, `ps`, `pe`, `border-s`, `border-e`)

## Assumptions

- The project's existing i18n system (next-intl) will be used to determine the current locale and derive the text direction
- Only shadcn UI components are in scope for this upgrade; non-shadcn UI components (Fumadocs, custom components) will not be refactored
- The Arabic locale (`ar`) is the only RTL language supported; other RTL languages (Hebrew, Persian, Urdu) are out of scope
- Tailwind CSS v4's logical property support (`start`/`end`, `ms`/`me`, etc.) will be used for directional styling
- The `DirectionProvider` will wrap the application at the root layout level, not per-page
- Runtime locale switching should update the direction without requiring a full page reload
