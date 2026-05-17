# Tasks: Shadcn RTL Upgrade

**Input**: Design documents from `/specs/001-shadcn-rtl-upgrade/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the spec. Manual visual verification across locales is the testing approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `apps/web/` is the primary application
- Shadcn components at: `apps/web/modules/ui/components/`
- Shared layout at: `apps/web/modules/shared/components/Document.tsx`
- Config at: `apps/web/components.json`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configure shadcn for RTL and install required dependencies

- [ ] T001 Add `"rtl": true` to shadcn config at `apps/web/components.json`
- [ ] T002 [P] Install `@radix-ui/react-direction` dependency with `pnpm --filter web add @radix-ui/react-direction`
- [ ] T003 [P] Create `DirectionProvider` re-export component at `apps/web/modules/ui/components/direction.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire DirectionProvider into the app layout; set `dir` attribute on `<html>`; update Toaster position

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Update `apps/web/modules/shared/components/Document.tsx` to:
  - Import `DirectionProvider` from `@ui/components/direction`
  - Import `useLocale` from `next-intl`
  - Add `dir` attribute to `<html>` tag (`dir={locale === "ar" ? "rtl" : "ltr"}`)
  - Wrap children with `<DirectionProvider direction={direction}>`
  - Make sonner `<Toaster position={direction === "rtl" ? "top-left" : "top-right"} />`

**Checkpoint**: Foundation ready — DirectionProvider is active, dir attribute is set. User story implementation can now begin.

---

## Phase 3: User Story 1 - Arabic-Speaking User Browses the App in RTL (Priority: P1) 🎯 MVP

**Goal**: All 23 shadcn UI components render correctly in RTL mode. Directional CSS classes updated to logical properties. Radix components respond to DirectionProvider context.

**Independent Test**: Switch locale to Arabic (`/ar`) and verify all shadcn components render with correct RTL layout and behavior — dialogs position correctly, dropdowns open on the correct side, sheets slide from the right, form inputs respect RTL direction.

### Implementation for User Story 1

**Components with major changes (parallelizable per-component):**

- [ ] T005 [P] [US1] Update RTL-affected animated positioning classes in `apps/web/modules/ui/components/sheet.tsx` (left-0→start-0, right-0→end-0, border-l→border-s, border-r→border-e, text-left→text-start, space-x→gap, slide-out/in animations)
- [ ] T006 [P] [US1] Update RTL-affected classes in `apps/web/modules/ui/components/dropdown-menu.tsx` (pl-8→ps-8, pr-3/pr-8→pe-3/pe-8, left-2→start-2, right-2→end-2, ml-auto→ms-auto)
- [ ] T007 [P] [US1] Update RTL-affected classes in `apps/web/modules/ui/components/dialog.tsx` (left-[50%]→start-1/2, right-4→end-4, text-left→text-start, space-x-2→gap-2, slide-in/out animations)
- [ ] T008 [P] [US1] Update RTL-affected classes in `apps/web/modules/ui/components/alert-dialog.tsx` (left-[50%]→start-1/2, text-left→text-start, space-x-2→gap-2, slide-in/out animations)
- [ ] T009 [P] [US1] Update RTL-affected classes in `apps/web/modules/ui/components/select.tsx` (pr-8→pe-8, pl-2→ps-2, right-2→end-2)
- [ ] T010 [P] [US1] Update RTL-affected classes in `apps/web/modules/ui/components/button.tsx` (mr-1.5→me-1.5)
- [ ] T011 [P] [US1] Update RTL-affected classes in `apps/web/modules/ui/components/alert.tsx` ([&>svg]:left-4→[&>svg]:start-4, [&>svg~*]:pl-6→[&>svg~*]:ps-6)
- [ ] T012 [P] [US1] Update RTL-affected classes in `apps/web/modules/ui/components/password-input.tsx` (right-0→end-0, pr-10→pe-10, pr-4→pe-4)
- [ ] T013 [P] [US1] Update RTL-affected classes in `apps/web/modules/ui/components/table.tsx` (text-left→text-start, [&:has([role=checkbox])]:pr-0→[&:has([role=checkbox])]:pe-0)
- [ ] T014 [P] [US1] Update RTL-affected classes in `apps/web/modules/ui/components/input-otp.tsx` (border-r→border-e, first:rounded-l-md→first:rounded-s-md, first:border-l→first:border-s, last:rounded-r-md→last:rounded-e-md)
- [ ] T015 [P] [US1] Update RTL-affected animation classes in `apps/web/modules/ui/components/tooltip.tsx` (data-[side=left]/data-[side=right] slide animations — verify DirectionProvider handles side swapping correctly)

**Components verified as RTL-ready (no changes needed):**

- [ ] T016 [P] [US1] Verify RTL correctness for no-change components: `accordion.tsx`, `avatar.tsx`, `badge.tsx`, `card.tsx`, `form.tsx`, `input.tsx`, `label.tsx`, `progress.tsx`, `skeleton.tsx`, `tabs.tsx`, `textarea.tsx`, `toast.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional. Verify by running the dev server and testing each component in Arabic locale.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Add Arabic font support, verify developer experience for new components, and confirm zero LTR regressions.

- [ ] T017 Add Arabic font (`Noto_Sans_Arabic` from `next/font/google`) to `apps/web/modules/shared/components/Document.tsx` for the Arabic locale
- [ ] T018 Verify that adding a new shadcn component via CLI (`pnpm dlx shadcn@latest add`) generates RTL-aware classes automatically (US2 validation)
- [ ] T019 Manual regression test — switch to English locale (`/en`) and verify all components render identically to pre-upgrade state (US3 validation)
- [ ] T020 Manual acceptance test — switch to Arabic locale (`/ar`) and verify all shadcn components render correctly in RTL mode (US1 full validation)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **Polish (Phase 4)**: Depends on User Story 1 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — independent of other stories
- **User Story 2 (P2)**: Achieved via Setup (T001 + T002 + T003) + Foundational (T004) — no separate phase needed
- **User Story 3 (P2)**: Verification in Polish phase — depends on all prior phases

### Within Each User Story

- Component CSS updates (T005-T015) can all run in parallel
- Verification tasks (T016-T020) depend on all prior tasks

### Parallel Opportunities

- T001, T002, T003 can run in parallel (all Setup)
- T005 through T015 can all run in parallel (different component files, no dependencies)
- T016 can run in parallel with T005-T015
- T019 and T020 can run together in Polish phase

---

## Parallel Example: User Story 1

```bash
# All component CSS updates can be done in parallel (different files):
Task: "Update RTL-affected classes in apps/web/modules/ui/components/sheet.tsx"
Task: "Update RTL-affected classes in apps/web/modules/ui/components/dropdown-menu.tsx"
Task: "Update RTL-affected classes in apps/web/modules/ui/components/dialog.tsx"
Task: "Update RTL-affected classes in apps/web/modules/ui/components/alert-dialog.tsx"
Task: "Update RTL-affected classes in apps/web/modules/ui/components/select.tsx"
Task: "Update RTL-affected classes in apps/web/modules/ui/components/button.tsx"
Task: "Update RTL-affected classes in apps/web/modules/ui/components/alert.tsx"
Task: "Update RTL-affected classes in apps/web/modules/ui/components/password-input.tsx"
Task: "Update RTL-affected classes in apps/web/modules/ui/components/table.tsx"
Task: "Update RTL-affected classes in apps/web/modules/ui/components/input-otp.tsx"
Task: "Update RTL-affected classes in apps/web/modules/ui/components/tooltip.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004)
3. Complete Phase 3: User Story 1 (T005-T016)
4. **STOP and VALIDATE**: Test all shadcn components in Arabic locale
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (all component CSS updates) → Test in Arabic locale → Deploy/Demo (MVP!)
3. Add Polish items (font + verification) → Final validation

### Parallel Team Strategy

With multiple developers:

1. One developer: T001-T004 (Setup + Foundational)
2. Multiple developers: Split T005-T015 across developers (all are independent files)
3. One developer: T016-T020 (verification and polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
