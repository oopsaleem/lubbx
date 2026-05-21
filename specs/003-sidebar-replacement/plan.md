# Implementation Plan: Sidebar Navigation Replacement

**Branch**: `003-sidebar-replacement` | **Date**: 2026-05-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-sidebar-replacement/spec.md`

## Summary

Replace the existing NavBar component with a shadcn Sidebar component that provides persistent navigation, collapse-to-icons mode, mobile overlay support, full RTL compatibility, and sticky header (branding) + footer (user menu). The old `useSidebarLayout` config option and NavBar component are removed.

## Technical Context

**Language/Version**: TypeScript 5.8 / React 19.2 / Next.js 16.2
**Primary Dependencies**: shadcn/ui sidebar (Radix UI), lucide-react, next-intl (i18n), TanStack Query, Jotai
**Storage**: N/A (sidebar state persisted in-memory via Jotai atom)
**Testing**: Manual (per quickstart.md) — no automated tests specified for this UI replacement
**Target Platform**: Web (modern browsers, desktop + mobile)
**Project Type**: Web application (Next.js App Router, monorepo with Turborepo)
**Performance Goals**: Sidebar collapse/expand animation under 300ms
**Constraints**: Must match existing app theme (light/dark via CSS variables), support RTL for Arabic locale, preserve all menu items with role-based visibility
**Scale/Scope**: Single sidebar component replacing NavBar across all authenticated app pages; ~6 menu items across 3 groups (Platform, Organization, Account); 2 user roles (admin, user)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS — The constitution file is a template with no project-specific gates defined. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/003-sidebar-replacement/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (with clarifications)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (not applicable — UI component)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/web/modules/ui/components/
└── sidebar.tsx                  # NEW — shadcn sidebar component (installed via CLI)

apps/web/modules/saas/shared/components/
├── AppSidebar.tsx               # NEW — main sidebar component (replaces NavBar)
├── NavBar.tsx                   # REMOVED
└── AppWrapper.tsx               # MODIFIED — integrate SidebarProvider + AppSidebar

apps/web/app/(saas)/app/(account)/
└── layout.tsx                   # UNCHANGED — still uses AppWrapper

apps/web/app/(saas)/app/(organizations)/
├── [organizationSlug]/
│   └── layout.tsx               # UNCHANGED — still uses AppWrapper
└── (without-organization-slug)/
    └── layout.tsx               # MODIFIED — use AppWrapper instead of AuthWrapper

apps/web/app/globals.css         # MODIFIED — add sidebar CSS variables
```

**Structure Decision**: Web application pattern — single frontend with component isolation. The sidebar is a presentational/container component within the SaaS shared module, consuming existing sub-components (UserMenu, OrganizationSelect, Logo) and the same inline menu definition pattern from the old NavBar. The existing `AppWrapper` component is modified to use shadcn's sidebar layout instead of the old NavBar layout, minimizing changes to route group layouts.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — this section is not needed.
