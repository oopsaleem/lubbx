# Feature Specification: Shadcn UI RTL Support Upgrade

**Feature Branch**: `002-shadcn-ui-rtl`
**Created**: 2026-05-18
**Status**: Draft
**Input**: User description: "upgrade all ui components to latest shadcn-ui as it is now support rtl"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Arabic-Speaking User Browses SaaS Dashboard in RTL Mode (Priority: P1)

An Arabic-speaking user visits the SaaS application and expects all shadcn UI components to render correctly in right-to-left direction. Dialogs slide from the correct side, dropdown menus open with proper alignment, form inputs respect RTL text flow, and all directional icons (arrows, chevrons) flip automatically to match the reading direction.

**Why this priority**: This is the core goal — making shadcn components fully functional in RTL mode. Without this, Arabic users cannot use the application effectively, which blocks market expansion.

**Independent Test**: Can be fully tested by switching the locale to Arabic (`ar`) and verifying that all shadcn-powered UI components render with correct RTL layout and behavior without any visual defects.

**Acceptance Scenarios**:

1. **Given** the user has selected Arabic as their locale, **When** they navigate to any page, **Then** all shadcn UI components render with correct RTL text direction and layout
2. **Given** the user opens a dialog or sheet component in Arabic locale, **When** the component animates in, **Then** it slides from the correct direction (right side) with appropriate logical animation classes
3. **Given** the user interacts with a dropdown menu in Arabic locale, **When** the menu opens, **Then** it aligns to the correct side based on RTL positioning
4. **Given** the user views a data table in Arabic locale, **When** they inspect column headers and cell content, **Then** content flows right-to-left with correct alignment
5. **Given** the user sees directional icons (arrows, chevrons, carets) in Arabic locale, **When** icons are rendered alongside text, **Then** they flip direction using RTL-aware rotation

---

### User Story 2 - Developer Adds New Shadcn Components with Automatic RTL Support (Priority: P1)

A developer adds a new shadcn component to the project via the CLI and expects RTL support to work automatically without manual per-component configuration.

**Why this priority**: If RTL requires manual work for each new component, it will not scale. The automation ensures future components inherit RTL support by default.

**Independent Test**: Can be tested by adding a new shadcn component via the CLI and verifying it renders correctly in both LTR and RTL modes without additional code changes.

**Acceptance Scenarios**:

1. **Given** the components.json has `rtl: true` configured, **When** a new shadcn component is added via the CLI, **Then** the generated component includes proper RTL-aware Tailwind classes using logical properties
2. **Given** the application has a DirectionProvider wrapping the root layout, **When** a new Radix-based shadcn component is added, **Then** it automatically responds to the current text direction context
3. **Given** the developer runs the shadcn migration command for existing components, **When** the migration completes, **Then** all physical positioning classes are replaced with logical equivalents

---

### User Story 3 - English User Experiences No Regression in LTR Mode (Priority: P2)

An English-speaking user continues to use the application and sees no visual or behavioral changes in left-to-right mode after the RTL upgrade.

**Why this priority**: The upgrade must not break existing LTR functionality. Regression in English mode is unacceptable for the existing user base.

**Independent Test**: Can be tested by viewing every page in English locale and comparing visual output against screenshots or known-good state from before the upgrade.

**Acceptance Scenarios**:

1. **Given** the user has English set as their locale, **When** they interact with any shadcn component, **Then** all components render identically to the pre-upgrade state
2. **Given** the components.json has `rtl: true`, **When** viewing the app in English, **Then** the `dir` attribute on the HTML element is `ltr`
3. **Given** the RTL migration has been applied, **When** running in LTR mode, **Then** no directional or layout differences are observed compared to before the upgrade

---

### Edge Cases

- What happens when the locale switches between LTR and RTL at runtime — does the direction update without a full page reload?
- How do portal-based components (toasts, tooltips, popovers) behave when the document direction changes while they are open?
- How do form validation error messages align in RTL mode — do text and icons render correctly?
- What about third-party or custom non-shadcn components that use hardcoded directional classes — are they affected?
- How does the sidebar/navigation layout respond to RTL — does the collapse/expand direction reverse correctly?
- What happens to pagination component when direction changes — do previous/next button positions swap?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST set `rtl: true` in the shadcn configuration file (`components.json`) to enable automatic RTL class transformation
- **FR-002**: System MUST run the shadcn CLI migration command (`shadcn migrate rtl`) on all existing UI component files to convert physical CSS classes to logical equivalents
- **FR-003**: System MUST add the shadcn `direction` component to the project (via `shadcn add direction`) which provides the DirectionProvider wrapper
- **FR-004**: System MUST wrap the application root layout with the DirectionProvider component, setting the `dir` attribute based on the current locale
- **FR-005**: System MUST set the `dir` attribute on the root `<html>` element based on the current locale (`rtl` for Arabic, `ltr` for English)
- **FR-006**: Directional icons (arrows, chevrons, carets, etc.) MUST use `rtl:rotate-180` class to automatically flip in RTL mode
- **FR-007**: Portal-based components (popovers, tooltips, dialogs, dropdowns) MUST pass the `dir` prop to their portal content to ensure correct positioning
- **FR-008**: Existing shadcn UI components MUST render correctly in both LTR and RTL modes without manual per-component direction handling
- **FR-009**: System MUST NOT introduce any visual regressions in LTR (English) mode after the migration
- **FR-010**: Animation classes using physical directions (`slide-in-from-right`, `slide-out-to-left`, etc.) MUST be automatically transformed to logical equivalents by the CLI migration

### Key Entities *(include if feature involves data)*

- **Locale Configuration**: The supported locales (`en`, `ar`) and their associated direction (`ltr`, `rtl`) defined in the application's i18n configuration
- **Direction Context**: The Radix DirectionProvider component that propagates the current text direction to all Radix-based shadcn components
- **Component Registry**: The set of shadcn UI component files under the `ui/` directory that will undergo CSS migration from physical to logical properties

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing shadcn UI components render correctly in Arabic RTL mode with no layout, alignment, or positioning issues
- **SC-002**: Zero visual regressions in English LTR mode when compared to the pre-upgrade state
- **SC-003**: New shadcn components added via CLI automatically include RTL support without any manual intervention
- **SC-004**: The `dir` attribute is correctly set on the `<html>` element matching the active locale (`rtl` for Arabic, `ltr` for English)
- **SC-005**: All physical directional CSS classes (`left`, `right`, `ml`, `mr`, `pl`, `pr`, `border-l`, `border-r`) in shadcn component files are replaced with logical property equivalents (`start`, `end`, `ms`, `me`, `ps`, `pe`, `border-s`, `border-e`) after migration
- **SC-006**: Directional icons display correctly in both LTR and RTL modes with automatic flip behavior
- **SC-007**: Portal-based components (tooltips, popovers, dropdowns) position correctly in RTL mode without clipping or misalignment

## Assumptions

- The project's existing i18n system (next-intl) will be used to determine the current locale and derive the text direction
- Only shadcn UI components are in scope for migration; non-shadcn custom components will not be refactored
- The Arabic locale (`ar`) is the only RTL language supported initially; other RTL languages (Hebrew, Persian, Urdu) are out of scope
- Tailwind CSS logical properties (`start`/`end`, `ms`/`me`, etc.) are fully supported by the project's Tailwind version
- The DirectionProvider will be added at the root layout level and will respond to locale changes
- The shadcn CLI migration command will handle the majority of class transformations automatically
- Calendar, Pagination, and Sidebar components may require manual migration steps as they are not fully covered by the automatic CLI migration
- A `noto-sans-arabic` or similar font pairing will be needed for Arabic text display
