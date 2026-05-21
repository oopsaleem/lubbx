---

description: "Task list for sidebar navigation replacement"
---

# Tasks: Sidebar Navigation Replacement

**Input**: Design documents from `/specs/003-sidebar-replacement/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No explicit test tasks — this is a UI component replacement. Verification is via manual testing per quickstart.md steps.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `apps/web/` — frontend application root
- **Config**: `config/` — centralized configuration package
- Paths shown reflect the monorepo structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install shadcn sidebar component and add required CSS variables

- [ ] T001 Install shadcn sidebar component via `pnpm dlx shadcn@latest add sidebar` — creates `apps/web/modules/ui/components/sidebar.tsx`
- [ ] T002 [P] Add sidebar CSS theme variables to `apps/web/app/globals.css` under `@layer base` — ensure variables match the app's existing light/dark palette for consistent theme

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Remove `useSidebarLayout` from config type definition in `config/types.ts` (key `ui.saas.useSidebarLayout`)
- [ ] T004 Remove `useSidebarLayout` from config defaults in `config/index.ts` (key `ui.saas.useSidebarLayout`)
- [ ] T005 [P] Create `apps/web/modules/saas/shared/components/AppSidebar.tsx` — sidebar component with `organizationId` prop, SidebarHeader (Logo + conditional OrganizationSelect), SidebarContent (menu groups with admin/org conditions, collapsible group sections via Collapsible wrapper), SidebarFooter (UserMenu with showUserName), and SidebarRail. Extract menu items from old NavBar pattern.
- [ ] T006 Integrate SidebarProvider + AppSidebar + SidebarInset into the app layout at `apps/web/app/(saas)/app/layout.tsx`, wrapping the existing provider tree

**Checkpoint**: Foundation ready — sidebar renders in layout with all menu items visible

---

## Phase 3: User Story 1 - Navigate application via sidebar (Priority: P1) 🎯 MVP

**Goal**: Users can navigate between all app sections through a persistent sidebar with active state highlighting, conditional admin/org items, and sticky header/footer sections.

**Independent Test**: Authenticate as any user, land on dashboard, click each menu item — the correct page loads and the active item is visually highlighted. Verify admin menus are visible for admin users only.

- [ ] T007 [US1] Implement active state highlighting in `apps/web/modules/saas/shared/components/AppSidebar.tsx` using `usePathname()` to determine which sidebar menu item is active (mirror pattern from old NavBar)
- [ ] T008 [P] [US1] Implement admin-role conditional menu item visibility in `apps/web/modules/saas/shared/components/AppSidebar.tsx` (show Admin link only when `user.role === "admin"`)
- [ ] T009 [P] [US1] Implement organization-context conditional menu items in `apps/web/modules/saas/shared/components/AppSidebar.tsx` (show Organization Settings link only when org is active)
- [ ] T010 [P] [US1] Configure sticky SidebarHeader with Logo (Link to /app) and conditional OrganizationSelect in `apps/web/modules/saas/shared/components/AppSidebar.tsx`
- [ ] T011 [P] [US1] Configure sticky SidebarFooter with UserMenu (showUserName) in `apps/web/modules/saas/shared/components/AppSidebar.tsx`

**Checkpoint**: Full navigation works — users can browse all sections with correct active states, conditional items, and sticky layout

---

## Phase 4: User Story 2 - Collapse and expand sidebar (Priority: P1)

**Goal**: Users can collapse the sidebar to icon-only mode to reclaim screen space and expand it back. The shortcut Cmd+B / Ctrl+B toggles the sidebar. State persists across navigation.

**Independent Test**: Click collapse trigger — sidebar transitions to icon-only mode. Click expand trigger — returns to full width. Navigate between pages — collapsed state is preserved. Press Cmd+B — sidebar toggles.

- [ ] T012 [US2] Configure `collapsible="icon"` on the Sidebar component and add SidebarTrigger in `apps/web/modules/saas/shared/components/AppSidebar.tsx` (shadcn sidebar provides this natively)
- [ ] T013 [US2] Verify Cmd+B / Ctrl+B keyboard shortcut works (built into shadcn sidebar via `SIDEBAR_KEYBOARD_SHORTCUT` constant)
- [ ] T014 [P] [US2] Persist sidebar collapse/expand state across navigation — verify the Jotai atom in `apps/web/modules/saas/shared/lib/state.ts` stores the collapsed state and restores it on page navigation (US2 test: collapse sidebar, navigate to another page, verify it remains collapsed)

**Checkpoint**: Sidebar can be collapsed, expanded via click or keyboard, and state persists across page navigation

---

## Phase 5: User Story 3 - Mobile sidebar behavior (Priority: P2)

**Goal**: On mobile, the sidebar appears as an overlay drawer that slides in when triggered and closes when tapping outside.

**Independent Test**: Resize browser to mobile viewport width — sidebar becomes a slide-in drawer. Tap outside the drawer — it closes.

- [ ] T015 [US3] Verify mobile overlay behavior — shadcn sidebar automatically renders a Sheet for mobile via its responsive logic; ensure `SidebarProvider` does not prevent mobile behavior in `apps/web/app/(saas)/app/layout.tsx`

**Checkpoint**: Sidebar correctly transitions to slide-in overlay on mobile viewports

---

## Phase 6: User Story 4 - RTL support for Arabic users (Priority: P2)

**Goal**: Sidebar positions on the right side for Arabic (RTL) locale with mirrored animations and icons.

**Independent Test**: Switch locale to Arabic — sidebar appears on the right. Verify trigger icon is flipped and collapse/expand animations are mirrored.

- [ ] T016 [US4] Pass `dir` prop to the Sidebar component in `apps/web/modules/saas/shared/components/AppSidebar.tsx` based on the current locale direction (use existing direction logic from `Document.tsx` or via the DirectionProviderWrapper)
- [ ] T017 [US4] Add `className="rtl:rotate-180"` to the SidebarTrigger icon (PanelLeft) in `apps/web/modules/saas/shared/components/AppSidebar.tsx` for RTL direction flip

**Checkpoint**: Sidebar correctly positions and animates in both LTR and RTL modes

---

## Phase 7: Cleanup & Polish (Cross-Cutting Concerns)

**Purpose**: Remove old NavBar component and associated config, update all consumers, verify success criteria

- [ ] T018 [P] Delete `apps/web/modules/saas/shared/components/NavBar.tsx`
- [ ] T019 [P] Update `apps/web/modules/saas/shared/components/AppWrapper.tsx` — remove NavBar import, remove `useSidebarLayout` references, remove `md:ml-[280px]` classes (layout margin is now handled by SidebarInset)
- [ ] T020 [P] Update `apps/web/app/(saas)/app/(account)/admin/layout.tsx` if it references any NavBar-specific patterns
- [ ] T021 Run `pnpm build` to verify no remaining broken imports or references to removed `useSidebarLayout` or `NavBar`
- [ ] T022 [P] Follow `specs/003-sidebar-replacement/quickstart.md` verification steps to validate end-to-end
- [ ] T023 [P] Verify SC-002 — sidebar collapse/expand animation completes in under 300ms (manual timing check using browser DevTools Performance panel)
- [ ] T024 [P] Verify SC-005 — mobile sidebar overlay opens and closes without causing layout shift (resize to mobile viewport, toggle sidebar, confirm no content reflow)
- [ ] T025 [P] Verify edge case — rapid trigger clicks do not cause animation glitches or incorrect state (rapidly click collapse/expand trigger 10+ times, verify final state is correct)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3) can proceed independently once foundational is done
  - US2-4 (Phase 4-6) configure the same component after US1 is built
- **Cleanup (Phase 7)**: Depends on all user stories being complete; T023-T025 verification tasks can run in parallel after all implementation is done

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — core sidebar component must be rendered first
- **US2 (P1)**: Depends on US1 — collapse/expand configures the component built in US1
- **US3 (P2)**: Depends on US1 — mobile behavior is inherent to the sidebar component
- **US4 (P2)**: Depends on US1 — RTL dir prop configures the existing sidebar component

### Within Each User Story

- Configuration before verification
- Core implementation before visual polish
- Story complete before moving to next

### Parallel Opportunities

- T001 and T002 can run in parallel
- T003 and T004 can run in parallel (different files, same config removal)
- T005 runs alone (creates the core component)
- T008-T011 within US1 can all run in parallel (different props/features on same component)
- T012-T014 within US2 can run in parallel
- T016 and T017 within US4 can run in parallel
- T018-T022 (cleanup + verification) can all run in parallel
- T023-T025 (post-build verification) run in parallel after T021

---

## Parallel Example: User Story 1

```bash
# All these tasks modify different aspects of AppSidebar.tsx simultaneously:
Task: "T007 Implement active state highlighting in AppSidebar.tsx"
Task: "T008 Implement admin-role conditional menu items in AppSidebar.tsx"
Task: "T009 Implement org-context conditional items in AppSidebar.tsx"
Task: "T010 Configure sticky SidebarHeader with Logo in AppSidebar.tsx"
Task: "T011 Configure sticky SidebarFooter with UserMenu in AppSidebar.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (navigation with all menu items, active state, stickiness)
4. **STOP and VALIDATE**: Test that:
   - Sidebar renders on all authenticated pages
   - Each menu item navigates to the correct section
   - Active state highlights correctly
   - Admin/conditional menu items respect permissions
   - Logo in header and UserMenu in footer are sticky
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Sidebar renders with full menu
2. Add US2 → Collapse/expand + keyboard shortcut → Valid
3. Add US3 → Mobile overlay → Valid
4. Add US4 → RTL support → Valid
5. Cleanup → Remove old code → Final

### Parallel Team Strategy

With multiple developers:
1. One developer: Setup + Foundational (T001-T006)
2. Another developer: US1 implementation (T007-T011) — starts after T005-T006
3. Final pass: Cleanup (T018-T022) — runs after all US work done

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
