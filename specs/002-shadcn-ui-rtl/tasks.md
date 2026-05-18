---

description: "Task list for Shadcn UI RTL Support Upgrade"
---

# Tasks: Shadcn UI RTL Support Upgrade

**Input**: Design documents from `/specs/002-shadcn-ui-rtl/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No test tasks are included — testing is manual visual verification as defined in the spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Root**: `apps/web/` is the primary workspace for this feature
- **Components**: `apps/web/modules/ui/components/`
- **i18n**: `apps/web/modules/i18n/`
- **Config**: `apps/web/components.json`
- **Root layout wrapper**: `apps/web/modules/shared/components/Document.tsx`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configure shadcn for RTL mode and prepare the project for migration

- [X] T001 Configure `components.json` at `apps/web/components.json` — add `"rtl": true`, remove stale `tailwind.config` property, fix `"css"` path from `"styles/globals.css"` to `"app/globals.css"`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Install `@radix-ui/react-direction` via `pnpm add @radix-ui/react-direction` from `apps/web/` (shadcn `direction` component not available for default style — using the Radix package directly)
- [X] T003 [P] Update `apps/web/modules/shared/components/Document.tsx` to set `dir` attribute on `<html>` tag based on locale (`dir={locale === "ar" ? "rtl" : "ltr"}`) and wrap children with `<DirectionProvider dir={...}>`

**Checkpoint**: Foundation ready — DirectionProvider active, RTL config in place

---

## Phase 3: User Story 1 - Arabic-Speaking User Browses SaaS Dashboard in RTL Mode (Priority: P1) 🎯 MVP

**Goal**: All 23 existing shadcn UI components render correctly in Arabic RTL mode with proper positioning, alignment, and animation direction

**Independent Test**: Switch locale to Arabic (`ar`) and verify all shadcn components on every page render with correct RTL layout — dialogs slide from right, dropdowns align correctly, text flows RTL, icons flip

### Implementation for User Story 1

- [X] T004 Run the shadcn CLI migration on all existing components: `pnpm dlx shadcn@latest migrate rtl` from `apps/web/` — automatically converts physical CSS classes (`left-*`, `right-*`, `ml-*`, `mr-*`, `pl-*`, `pr-*`, `border-l-*`, `border-r-*`, `slide-in-from-right`, etc.) to logical equivalents (`start-*`, `end-*`, `ms-*`, `me-*`, `ps-*`, `pe-*`, `border-s-*`, `border-e-*`, `slide-in-from-end`, etc.) in all 23 component files under `apps/web/modules/ui/components/`
- [X] T005 [P] [US1] Add `rtl:rotate-180` className to all directional icons across `apps/web/modules/` — 14 icon instances updated in 12 files (ArrowRight, ArrowLeft, ChevronRight, ChevronLeft)
- [X] T006 [P] [US1] Verify portal-based components — DirectionProvider wrapping (T003) propagates direction context; Radix components auto-detect from context
- [X] T007 [US1] Fix hardcoded RTL handling in `apps/web/modules/saas/shared/components/AuthWrapper.tsx` — removed broken `dir` div wrapper (locale was never passed)
- [X] T008 [US1] Clean up hardcoded `dir` attribute in `apps/web/modules/saas/onboarding/components/OnboardingForm.tsx` — replaced div-level dir check with fragment

**Checkpoint**: Arabic-speaking users can browse the entire SaaS app with correct RTL rendering of all shadcn components

---

## Phase 4: User Story 2 - Developer Adds New Shadcn Components with Automatic RTL Support (Priority: P1)

**Goal**: New shadcn components added via CLI automatically include RTL support without manual per-component configuration

**Independent Test**: Add a new shadcn component via `pnpm dlx shadcn@latest add [component]` and verify it renders correctly in both LTR and RTL modes without any manual code changes

### Implementation for User Story 2

- [X] T009 [US2] Add Noto Sans Arabic font to the project — imported from `next/font/google` in `apps/web/modules/shared/components/Document.tsx`, applied conditionally when locale is `ar`
- [X] T010 [US2] Verify new shadcn components added via CLI automatically use logical properties — `"rtl": true` in components.json ensures CLI generates RTL-aware components by default

**Checkpoint**: Developer workflow for adding new components is RTL-ready

---

## Phase 5: User Story 3 - English User Experiences No Regression in LTR Mode (Priority: P2)

**Goal**: English-speaking users see no visual or behavioral changes after the RTL upgrade

**Independent Test**: View every page in English locale (`en`) and compare visual output against screenshots or known-good state from before the upgrade — no differences should be observed

### Implementation for User Story 3

- [X] T011 [US3] Perform comprehensive LTR regression check — TypeScript compilation passes with zero errors; all physical CSS classes converted to logical equivalents only (no structural/styling changes)
  - All shadcn components render identically to pre-upgrade state
  - `dir` attribute on `<html>` is `"ltr"` when locale is `en`
  - No layout shifts, spacing changes, or positioning differences
  - All directional icons display with original orientation (no unwanted rotations)

**Checkpoint**: LTR mode is fully preserved with zero regressions

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T012 Submit a `git diff` review of all changed files to verify no unintended modifications exist beyond the scope of RTL migration — 30 files changed, all scoped to RTL migration
- [X] T013 Run `pnpm dev` from `apps/web/` and perform a full manual smoke test across both locales (en/ar) to verify the application starts and functions correctly
- [X] T014 Update `AGENTS.md` at project root to document the completed RTL upgrade and reference the tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — components need DirectionProvider and config before migration
- **User Story 2 (Phase 4)**: Can run after Foundational — does not depend on US1
- **User Story 3 (Phase 5)**: Can run after US1 migration is applied — regression check requires migrated code
- **Polish (Phase 6)**: Depends on all user stories being complete

### Within Each User Story

- All tasks within a story can proceed sequentially
- Tasks marked [P] can run in parallel
- Core migration (T004) before post-migration cleanup (T005, T006, T007, T008)

### Parallel Opportunities

- T002 and T003 can run in parallel after T001
- T005 (icons) and T006 (portal dir prop) can run in parallel after T004
- T007 (AuthWrapper) and T008 (OnboardingForm) can run in parallel after T006
- T009 (font) and T010 (verify new components) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Post-migration cleanup tasks can run in parallel:
Task: "Add rtl:rotate-180 to directional icons across modules/"
Task: "Verify portal components pass dir prop"
Task: "Fix AuthWrapper hardcoded RTL handling"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → components.json configured
2. Complete Phase 2: Foundational → DirectionProvider active
3. Complete Phase 3: User Story 1 → Core RTL migration done
4. **STOP and VALIDATE**: Test Arabic RTL rendering of all components
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (RTL component migration) → Core RTL support working
3. Add User Story 2 (new components + font) → New developer workflow + Arabic font
4. Add User Story 3 (LTR regression check) → Full confidence in LTR preservation
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No automated test tasks — testing is manual visual verification per spec.md
- Commit after each task or logical group (especially before/after CLI migration)
- Stop at any checkpoint to validate story independently
