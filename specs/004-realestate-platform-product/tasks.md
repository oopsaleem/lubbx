---

description: "Task list for Real Estate Platform Product feature implementation"

---

# Tasks: Real Estate Platform Product

**Input**: Design documents from `specs/004-realestate-platform-product/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test tasks included — spec does not require TDD/playwright as mandatory work items.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**: `packages/database/` for schemas, `packages/storage/` for S3, `packages/payments/` for billing, `apps/web/` for Next.js pages and components
- **Organization hierarchy**: All projects are scoped under an organization. Routes live under `[organizationSlug]/projects/`. API queries filter by `organizationId`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — install new dependencies and configure tooling

- [x] T001 Install panorama viewer dependencies: `@photo-sphere-viewer/core`, `@photo-sphere-viewer/markers-plugin`, `@photo-sphere-viewer/virtual-tour-plugin`, `react-photo-sphere-viewer`
- [x] T002 [P] Install 3D model viewer dependency: `@google/model-viewer`
- [x] T003 [P] Install drag-and-drop dependency: `@dnd-kit/react`
- [x] T004 [P] Install image processing dependency: `sharp` (already installed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, storage package updates, and upload API infrastructure that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Add new Prisma enums to `packages/database/prisma/schema.prisma`: `OrganizationPlan`, `BillingPeriod`, `ProjectStatus`, `MediaType`, `ProjectMemberRole`, `ProjectMemberStatus`, `AnalyticsEventType`
- [x] T006 [P] Add new fields to existing `Organization` model in `packages/database/prisma/schema.prisma`: `plan`, `storageUsedBytes`, `storageLimitBytes`, `billingPeriod`, `stripeCustomerId`
- [x] T007 [P] Add `Project`, `Room`, `MediaFile`, `VirtualTour`, `PanoramaScene`, `ProjectMember`, `AnalyticsEvent` models to `packages/database/prisma/schema.prisma` with all fields, relations, cascade deletes, and indexes. Project must have required `organizationId` FK and `createdById` FK — org is the master, every query scopes by organization.
- [x] T008 Run Prisma migration: `cd packages/database && npx prisma migrate dev --name add-real-estate-models`
- [x] T009 [P] Extend `packages/storage/provider/s3/index.ts` to accept dynamic `ContentType` parameter in `getSignedUploadUrl` (currently hardcoded `image/jpeg`)
- [x] T010 [P] Add media bucket names to `packages/config/index.ts`: `panoramas`, `models`, `floorPlans`, `gallery`, `featured`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Project CRUD & Organization Scoping (Priority: P1) 🎯 MVP

**Goal**: Organization owners/members can create, list, edit, and delete projects scoped to their active organization, with room management and status toggle. Projects are always scoped under an organization — every route and query enforces `organizationId`.

**Independent Test**: Authenticated org member navigates to Projects, creates a project with title + description, sees it in the list, edits it, toggles status to PUBLISHED, and deletes it — all scoped to the active organization.

- [x] T011 [P] [US1] Create Project create/edit form component in `apps/web/modules/saas/projects/components/ProjectForm.tsx` with fields: title (required), description, address, price, featured image — using react-hook-form + zod validation
- [x] T012 [P] [US1] Create Project list page component in `apps/web/modules/saas/projects/components/ProjectList.tsx` with pagination, skeleton loading state, and empty state with "Create your first project" CTA
- [x] T013 [P] [US1] Create Project detail page component in `apps/web/modules/saas/projects/components/ProjectDetail.tsx` showing project info, status toggle, and navigation to media/tours/billing tabs
- [x] T014 [US1] Create project routes under `apps/web/app/(saas)/app/(organizations)/[organizationSlug]/projects/` with pages for list, new, detail, edit — all routes scoped to the active organization slug
- [x] T015 [US1] Implement server actions or API routes for project CRUD in `packages/api/src/routes/projects.ts` with org-scoped queries (always filtered by `organizationId`), input sanitization (FR-025), and cascade delete for associated media/tours
- [x] T016 [P] [US1] Add Room management (add, remove, reorder) to project editor — server logic in project API, UI component in `apps/web/modules/saas/projects/components/RoomManager.tsx`
- [x] T017 [US1] Add featured image upload to project form — use the media library upload flow (init→confirm pattern) or a direct S3 presigned URL to the `featured` bucket; store the returned `s3Key` in `project.featuredImageKey`
- [x] T018 [P] [US1] Add project status toggle (DRAFT/PUBLISHED) UI and server logic — PUBLISHED makes project visible on public viewer route
- [x] T019 [US1] Add loading skeleton states for project list and detail views per edge case pattern

**Checkpoint**: US1 complete — projects can be created, listed, edited, published/unpublished, and deleted with cascade

---

## Phase 4: User Story 2 — Media Library with Room Navigation (Priority: P1)

**Goal**: Organization members can upload property media files (panoramas, 3D models, floor plans, gallery images), auto-classified by type, and organize them across rooms via drag-and-drop.

**Independent Test**: User opens project, navigates to media library, uploads a .jpg with 2:1 aspect ratio (auto-classified as PANORAMA), sees it in the library, drags it to a room, deletes it — S3 object removed and storage decremented.

- [x] T020 [US2] Create upload-init API endpoint `POST /api/projects/:projectId/media/upload-init` in `packages/api/src/routes/media.ts` — validates file types, sizes (max 100 MB, FR-023), rate limits (50/min/org, FR-024), storage limits (FR-016), and returns presigned URLs
- [x] T021 [US2] Create upload-confirm API endpoint `POST /api/projects/:projectId/media/upload-confirm` in `packages/api/src/routes/media.ts` — verifies S3 object exists, finalizes media type (re-checks aspect ratio for panoramas), inserts MediaFile record, updates Organization.storageUsedBytes in DB transaction
- [x] T022 [P] [US2] Create media list endpoint `GET /api/projects/:projectId/media` with filtering by room and type in `packages/api/src/routes/media.ts`
- [x] T023 [P] [US2] Create media delete endpoint `DELETE /api/projects/:projectId/media/:mediaId` in `packages/api/src/routes/media.ts` — removes S3 object, decrements storageUsedBytes
- [x] T024 [P] [US2] Create media room assignment endpoint `PATCH /api/projects/:projectId/media/:mediaId/assign-room` in `packages/api/src/routes/media.ts`
- [x] T025 [US2] Create client-side upload hook `apps/web/modules/saas/projects/lib/use-media-upload.ts` with concurrent queue (default 3 parallel, configurable), XHR progress tracking, upload-init → upload-confirm flow, and retry logic
- [x] T026 [P] [US2] Create media grid component `apps/web/modules/saas/projects/media/MediaGrid.tsx` with dnd-kit drag support — files display thumbnails, type badges, and can be dragged to rooms
- [x] T027 [P] [US2] Create room sidebar component `apps/web/modules/saas/projects/media/RoomSidebar.tsx` as dnd-kit drop target — clicking a room filters media; drag-to-room reassigns
- [x] T028 [P] [US2] Create upload dialog component `apps/web/modules/saas/projects/media/UploadDialog.tsx` with file selection, type-aware preview, concurrent upload with per-file progress bars
- [x] T029 [P] [US2] Create file card component `apps/web/modules/saas/projects/media/FileCard.tsx` showing thumbnail, filename, type badge, size, and room assignment
- [x] T030 [US2] Add client-side file type detection utility in `apps/web/modules/saas/projects/lib/media-utils.ts` — extension mapping, aspect ratio detection via Image(), file size validation
- [x] T031 [P] [US2] Add Hono rate limiter middleware `hono-rate-limiter` to upload-init endpoint (50/min/org)
- [x] T032 [US2] Add empty state for media library ("Upload media" CTA with illustration) and skeleton loaders during fetch

**Checkpoint**: US2 complete — media files can be uploaded, auto-classified, browsed by room, dragged to assign, and deleted

---

## Phase 5: User Story 3 — Virtual Tour Editor (Priority: P2)

**Goal**: Organization members can create 360° virtual tours within a project by adding panorama scenes, setting initial view directions, and placing interactive hotspots that link scenes together.

**Independent Test**: User creates a tour, adds two panorama scenes, places a hotspot on the first pointing to the second, saves, previews — clicking the hotspot transitions to the second scene.

- [x] T033 [US3] Create tour CRUD API endpoints in `packages/api/src/routes/tours.ts`: `POST/GET/PUT/DELETE /api/projects/:projectId/tours` and `POST/GET/PUT/DELETE /api/projects/:projectId/tours/:tourId/scenes`
- [x] T034 [P] [US3] Create tour list component `apps/web/modules/saas/projects/tours/TourList.tsx` listing tours for a project with create/edit/delete — empty state with "Add a tour" CTA
- [x] T035 [P] [US3] Create tour editor component `apps/web/modules/saas/projects/tours/TourEditor.tsx` with edit/preview mode toggle (FR-011, AC-5)
- [x] T036 [P] [US3] Create scene list component `apps/web/modules/saas/projects/tours/SceneList.tsx` with drag-to-reorder, panorama preview thumbnails, add/remove scene
- [x] T037 [US3] Create panorama preview component `apps/web/modules/saas/projects/tours/PanoramaPreview.tsx` wrapping `ReactPhotoSphereViewer` with MarkersPlugin — renders panorama with initial view direction, displays hotspots in edit mode
- [x] T038 [US3] Add hotspot placement interaction in PanoramaPreview — clicking on the PSV preview at a specific yaw/pitch creates a hotspot with a default label (AC-2)
- [x] T039 [P] [US3] Create hotspot form component `apps/web/modules/saas/projects/tours/HotspotForm.tsx` for editing hotspot properties: yaw, pitch, label (English + Arabic), target scene selector, external URL
- [x] T040 [US3] Implement hotspot persistence flow — save hotspots per-scene (FR-011), load them on scene select, render as clickable markers in preview mode
- [x] T041 [US3] Wire scene reorder to API — PATCH scene sortOrders on drag complete
- [x] T042 [P] [US3] Add preview mode to tour editor — hides hotspot placement controls, renders VirtualTourPlugin for click-to-navigate hotspots (AC-5)
- [ ] T043 [US3] Implement optimistic concurrency for concurrent tour edits (spec edge case) — check `updatedAt` timestamp on save; reject stale writes with conflict response; last-save-wins with no locking for v1 (not implemented — advanced pattern)

**Checkpoint**: US3 complete — tours can be created, scenes added with panoramas, hotspots placed and linked, preview navigates scenes

---

## Phase 6: User Story 4 — Public Property Viewer (Priority: P2)

**Goal**: Unauthenticated visitors can view published projects via a public route with tabs for 360° tour, 3D model, floor plan, and gallery — only rendered if data exists.

**Independent Test**: Visitor opens published project URL — sees tabs for each non-empty media type, clicks hotspots to navigate scenes, switches language between English and Arabic.

- [x] T044 [P] [US4] Create public API endpoint `GET /api/public/projects/:projectId` returning published project data and available tab info (auth-skipped, FR-012). Query must verify project belongs to an active organization and has status PUBLISHED.
- [x] T045 [P] [US4] Create public tour data endpoint `GET /api/public/projects/:projectId/tours/:tourId?locale=en` returning scenes with locale-sensitive hotspot labels
- [x] T046 [P] [US4] Create public media endpoints `GET /api/public/projects/:projectId/models`, `/floor-plans`, `/gallery` returning S3 signed URLs for each media type
- [x] T047 [US4] Create public viewer page at `apps/web/app/(marketing)/[locale]/project/[projectId]/page.tsx` — server component that fetches project data, renders tabs only for non-empty types (FR-013)
- [x] T048 [P] [US4] Create main viewer component `apps/web/modules/saas/viewers/PropertyViewer.tsx` with tab navigation (Tour, 3D Model, Floor Plan, Gallery) and language/theme toggles
- [x] T049 [P] [US4] Create 360° Tour tab component `apps/web/modules/saas/viewers/TourTab.tsx` dynamically importing PanoramaViewer with VirtualTourPlugin — supports multiple tours selection (AC-2), hotspot click transitions (AC-3)
- [x] T050 [P] [US4] Create 3D Model tab component `apps/web/modules/saas/viewers/ModelTab.tsx` dynamically importing `@google/model-viewer` with `ssr: false` — loads .glb files with orbit controls
- [x] T051 [P] [US4] Create Floor Plan tab component `apps/web/modules/saas/viewers/FloorPlanTab.tsx` rendering floor plan images with zoom/pan
- [x] T052 [P] [US4] Create Gallery tab component `apps/web/modules/saas/viewers/GalleryTab.tsx` with image grid and lightbox
- [x] T053 [US4] Implement language toggle (FR-014) — switches locale between en/ar, reloads page with Arabic UI text, RTL direction, and locale-sensitive hotspot labels (AC-4)
- [x] T054 [P] [US4] Handle "project unpublished" state — return 404 when project is DRAFT (edge case). For manually deleted S3 files, show a dimmed card with "File unavailable" badge and optional retry action (edge case)
- [x] T055 [US4] Handle empty state — if no media exists for published project, show "No content available" state instead of empty tabs

**Checkpoint**: US4 complete — public viewer renders published projects with all tabs, language toggle, and proper empty/error states

---

## Phase 7: User Story 5 — Billing & Usage Tracking (Priority: P3)

**Goal**: Organizations see billing page with current plan, storage usage vs. limit, and upgrade options. Flex plan charges based on storage via Stripe metered billing.

**Independent Test**: Organization on Free plan (3 GB limit) uploads files until storage exceeds 3 GB — uploads blocked with upgrade prompt. Billing page shows usage as progress bar.

- [x] T056 [US5] Add storage usage query to organization billing API — expose `storageUsedBytes` and `storageLimitBytes` in existing billing endpoint
- [x] T057 [US5] Update billing page UI `apps/web/modules/saas/payments/` to show storage usage progress bar, current plan name, and upgrade button (FR-015)
- [x] T058 [US5] Implement upload blocking on storage limit exceeded (FR-016) — upload-init endpoint checks `storageUsedBytes + fileSize > storageLimitBytes` for Free plan, returns 413 with upgrade prompt. For Flex plan, `storageLimitBytes` is null — skip the check
- [ ] T059 [US5] Create Flex plan product and metered price in Stripe (one-time setup via seed script or Dashboard): Meter with `last` aggregation, Price with `unit_amount=20` ($0.20/GB/month) tied to meter (requires Stripe Dashboard setup)
- [x] T060 [P] [US5] Create daily cron job `apps/web/modules/saas/payments/jobs/report-storage-usage.ts` — queries FLEX-plan orgs, converts storageUsedBytes to GB, calls `stripe.billing.meterEvents.create()` with idempotency key
- [x] T061 [US5] Add Stripe webhook handler for `v1.billing.meter.error_report_triggered` in `packages/payments/provider/stripe/index.ts` — log and alert on meter event failures
- [x] T062 [P] [US5] Update organization plan upgrade flow — on Stripe Checkout completion, update `organization.plan`, `organization.storageLimitBytes` (set null/MAX for Flex, 3GB for Free), and `organization.stripeCustomerId` (AC-4). For Flex: `storageLimitBytes` should be null (no hard limit enforced server-side)

**Checkpoint**: US5 complete — billing page shows usage, Free plan enforces limit, Flex plan reports usage to Stripe daily

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Features that span multiple stories, WCAG compliance, edge cases, and cleanup

- [x] T063 [P] Implement collaborator invite API endpoint in `packages/api/src/routes/project-members.ts` — org admin or project owner can invite by email with EDITOR or VIEWER role (FR-020). Creates ProjectMember record in PENDING status. Rate limit: max 20 invitations per hour per organization (FR-024).
- [ ] T064 [P] Send collaborator invitation email via `packages/mail/` — React Email template with accept link that resolves to the project page (FR-021) (requires email template setup)
- [x] T065 [P] Create accept-invitation UI — landing page that reads invitation token, creates User→ProjectMember binding (sets `userId`), transitions status to ACCEPTED, and redirects to the project (FR-022)
- [x] T066 [P] Add view analytics tracking (FR-019) — server-side AnalyticsEvent increment on public viewer page load for eventType=VIEW
- [x] T067 [P] Add share button + share analytics tracking (FR-019) — share button in public viewer copies link or opens native share sheet; increments AnalyticsEvent with eventType=SHARE
- [ ] T068 [P] Add WCAG 2.1 AA compliance audit across all new UI — keyboard nav, ARIA labels, focus management, color contrast 4.5:1, skip-to-content link (SC-008) (requires audit pass)
- [x] T069 [P] Add XSS sanitization (FR-025) for all user-supplied text fields across project/tour/media forms — use existing sanitization utilities or add server-side validation
- [ ] T070 [P] Add error boundary components for viewer tabs — graceful fallback if 360° viewer, 3D viewer, or gallery fails to load (requires React error boundaries setup)
- [ ] T071 [P] S3 stale upload-init cleanup cron job — hourly cleanup of unconfirmed upload-init records older than 30 minutes (requires cron infra setup)
- [ ] T072 [P] Add thumbnail generation for uploaded images using `sharp` — generate preview thumbnails for media library grid and viewer (requires image processing pipeline)
- [ ] T073 [P] Add cross-browser error tracking — configure client-side error reporting and verify SC-006 (requires error tracking setup)
- [x] T074 [P] Run `pnpm build` to verify no broken imports across all modified files
- [x] T075 [P] Run `pnpm lint` (biome) to verify code quality across all new code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — independent of other stories
- **User Story 2 (Phase 4)**: Depends on Foundational + US1 (projects must exist) — can run after Phase 2 if projects seeded manually
- **User Story 3 (Phase 5)**: Depends on Foundational + US2 (media files must exist for scenes) — panoramas required
- **User Story 4 (Phase 6)**: Depends on US1 (projects), US2 (media), US3 (tours) — published project with data needed to test
- **User Story 5 (Phase 7)**: Depends on Foundational (storage tracking on Organization model) — independent of other stories business logic
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — independent of other stories
- **US2 (P1)**: Depends on US1 (projects) — needs a project context for uploads
- **US3 (P2)**: Depends on US2 (panorama media) — needs panoramas to create scenes
- **US4 (P2)**: Depends on US1 + US2 + US3 — needs published project with data
- **US5 (P3)**: Can start after Phase 2 — storage tracking independent of project/media logic

### Within Each User Story

- API/backend logic before UI components
- Models/services before endpoints
- Core implementation before polish

### Parallel Opportunities

- Phase 1 tasks T001–T004 all marked [P] — independent dependency installs
- Phase 2 tasks T005, T006, T007 — schema changes independent
- Phase 2 tasks T009, T010 — storage/config changes independent of schema
- Each user story phase can proceed once its dependencies are met
- Within each phase: [P]-marked tasks can run in parallel
- Phase 8 tasks T063–T075 all marked [P] — fully parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 — Project CRUD
4. **STOP and VALIDATE**: Test US1 independently — create, edit, publish, delete project
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Project CRUD) → Test independently → Deploy
3. Add US2 (Media Library) → Test independently → Deploy
4. Add US3 (Virtual Tour Editor) → Test independently → Deploy
5. Add US4 (Public Viewer) → Test independently → Deploy
6. Add US5 (Billing) → Test independently → Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 + US2 (frontend-heavy)
   - Developer B: US3 + US5 (tour editor + billing)
   - Developer C: US4 (public viewer) — can begin after US1/US2 data shape is stable
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Organization hierarchy is enforced throughout**: Projects belong to an Organization. All routes are scoped under `[organizationSlug]/projects/`. All queries filter by `organizationId`. The public viewer verifies the project is PUBLISHED and belongs to an active organization.
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
