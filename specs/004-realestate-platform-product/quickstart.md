# Quickstart: Real Estate Platform Product

## Prerequisites

- Node.js 20+, pnpm 9.3
- Feature branch `004-realestate-platform-product` checked out
- Local PostgreSQL running (via `docker compose up -d` or local install)
- Local MinIO running (included in `docker-compose.yml`)
- Stripe CLI for webhook testing (optional, for billing)

## Setup

```bash
pnpm install
```

## Implementation Steps

### Step 1: Database — Add new models

Edit `packages/database/prisma/schema.prisma`:

1. Add new enums: `OrganizationPlan`, `BillingPeriod`, `ProjectStatus`, `MediaType`, `ProjectMemberRole`, `ProjectMemberStatus`, `AnalyticsEventType`
2. Add fields to existing `Organization` model: `plan`, `storageUsedBytes`, `storageLimitBytes`, `billingPeriod`, `stripeCustomerId`
3. Add new models: `Project`, `Room`, `MediaFile`, `VirtualTour`, `PanoramaScene`, `ProjectMember`, `AnalyticsEvent`

**Relations**:
- Organization → Project: 1:N
- Project → Room: 1:N (cascade delete)
- Project → MediaFile: 1:N (cascade delete)
- Project → VirtualTour: 1:N (cascade delete)
- Project → ProjectMember: 1:N (cascade delete)
- Project → AnalyticsEvent: 1:N (cascade delete)
- VirtualTour → PanoramaScene: 1:N (cascade delete)

Run migration:
```bash
cd packages/database && npx prisma migrate dev --name add-real-estate-models
```

Optionally mirror models in `packages/database/drizzle/schema/` if Drizzle queries are needed.

### Step 2: Install new dependencies

```bash
# 360° panorama viewer
pnpm add @photo-sphere-viewer/core @photo-sphere-viewer/markers-plugin @photo-sphere-viewer/virtual-tour-plugin react-photo-sphere-viewer

# 3D model viewer (web component)
pnpm add @google/model-viewer

# Drag and drop (media library)
pnpm add @dnd-kit/react

# S3 image processing for thumbnails
pnpm add sharp
```

### Step 3: Upload API — S3 presigned URL flow

**3a. Extend storage package**: Update `packages/storage/provider/s3/index.ts` — make `getSignedUploadUrl` accept dynamic `ContentType` parameter (currently hardcoded `image/jpeg`).

**3b. Create upload routes**: Create `packages/api/src/routes/uploads.ts` with Hono routes:

| Route | Method | Description |
|-------|--------|-------------|
| `/api/projects/:projectId/media/upload-init` | POST | Validate & return presigned URLs |
| `/api/projects/:projectId/media/upload-confirm` | POST | Confirm upload, store metadata |
| `/api/projects/:projectId/media` | GET | List media files for project |
| `/api/projects/:projectId/media/:mediaId/assign-room` | PATCH | Assign media to room |
| `/api/projects/:projectId/media/:mediaId` | DELETE | Delete media file |

Add `hono-rate-limiter` middleware for rate limiting (50/min/org).

**3c. Create client-side upload hook**: Create `apps/web/modules/saas/projects/lib/use-media-upload.ts`:
- Upload queue with semaphore (3 concurrent)
- XHR-based upload with progress tracking
- upload-init → upload-confirm flow
- Retry logic for failed uploads

### Step 4: Project CRUD UI

**4a. Create routes**: Add under `apps/web/app/(saas)/app/(organizations)/[organizationSlug]/projects/`:
- `page.tsx` — Project list (server component with search/pagination)
- `new/page.tsx` — Create project form
- `[projectId]/page.tsx` — Project detail page
- `[projectId]/edit/page.tsx` — Edit project form

**4b. Create pages in `apps/web/modules/saas/projects/`**:
- Components: `ProjectList`, `ProjectCard`, `ProjectForm`, `ProjectHeader`
- Use `react-hook-form` + `zod` for form validation (existing pattern)
- Use `next-intl` for i18n labels
- Use shadcn/ui components for forms, cards, tables

### Step 5: Media Library UI

Create `apps/web/modules/saas/projects/media/`:
- `MediaGrid.tsx` — File grid with dnd-kit (drag to room sidebar)
- `RoomSidebar.tsx` — Room list with drag target
- `UploadDialog.tsx` — File selection + upload progress (multiple concurrent)
- `FileCard.tsx` — Thumbnail + type badge + room assignment
- Client-side file type detection + aspect ratio check for panoramas

### Step 6: Virtual Tour Editor

Create `apps/web/modules/saas/projects/tours/`:
- `TourList.tsx` — List of tours for a project
- `TourEditor.tsx` — Main editor wrapper (edit/preview toggle)
- `SceneList.tsx` — Ordered list of scenes with drag reorder
- `PanoramaPreview.tsx` — ReactPhotoSphereViewer wrapper with hotspot placement
- `HotspotForm.tsx` — Inline form for editing hotspot properties (yaw, pitch, labels, target)
- Integration with MarkersPlugin for visual hotspot display and click-to-edit

### Step 7: Public Property Viewer

**7a. Create public viewer page**: Add under `apps/web/app/(marketing)/[locale]/project/[projectId]/page.tsx`:
- Server component fetches project data (title, description, price, featured image)
- Renders tabs dynamically based on available media types
- Each tab lazy-loads its client component

**7b. Create viewer components** in `apps/web/modules/saas/viewers/`:
- `PropertyViewer.tsx` — Main viewer with tab navigation
- `TourTab.tsx` — Dynamic import of PanoramaViewer with VirtualTourPlugin
- `ModelTab.tsx` — Dynamic import of model-viewer web component
- `FloorPlanTab.tsx` — Image/PDF viewer
- `GalleryTab.tsx` — Image gallery grid with lightbox

**7c. Create public API routes**: `GET /api/public/projects/[projectId]` and tour/media-specific endpoints. These routes skip authentication and only return data for PUBLISHED projects.

### Step 8: Billing — Storage Usage Page

**8a. Extend billing page**: Update `apps/web/modules/saas/payments/`:
- Add storage usage progress bar (used/limit)
- Show current plan name and upgrade options
- Call `GET /api/organizations/billing` for plan + usage data

**8b. Add usage-based billing for Flex plan**:
- Stripe Meter creation (one-time setup via Dashboard or seed script)
- Daily cron job in `apps/web/modules/saas/payments/jobs/report-storage-usage.ts`
- Webhook handler for `v1.billing.meter.error_report_triggered`

### Step 9: Collaboration — Project Members

Create routes and UI for project member management:
- `apps/web/app/(saas)/app/.../projects/[projectId]/members/page.tsx`
- Invite by email with EDITOR/VIEWER role selection
- Member list with status badges (PENDING/ACCEPTED)
- Email notification via existing `packages/mail/` (React Email templates)
- Accept invitation flow (link lands on project page, creates ProjectMember record)

### Step 10: Analytics

Add lightweight analytics tracking:
- Server-side: increment `AnalyticsEvent` on project view and share actions
- Client-side: use `useEffect` to fire view events on public viewer load
- Share button tracks share events

## Verification

### User Story 1 — Project CRUD

1. `pnpm dev`
2. Log in as org member, navigate to Projects
3. Create project with title, description, address, price
4. Verify it appears in list, scoped to active org
5. Edit project, toggle status to PUBLISHED
6. Delete project — verify cascade removes media/tours

### User Story 2 — Media Library

1. Open project, navigate to Media tab
2. Upload a JPG with 2:1 aspect ratio — verify auto-classified as PANORAMA
3. Upload a .glb file — verify auto-classified as MODEL_3D
4. Upload a .pdf — verify auto-classified as FLOOR_PLAN
5. Upload a square JPG — verify auto-classified as GALLERY_IMAGE
6. Add rooms, drag files between rooms to reassign
7. Delete a file — verify S3 object removed, storage decremented

### User Story 3 — Virtual Tour Editor

1. Upload 2+ panoramas to a project
2. Create a tour, add 2 scenes with the panoramas
3. Place a hotspot on scene 1 pointing to scene 2
4. Save and preview — clicking hotspot transitions to scene 2
5. Reorder scenes — verify preview flow respects new order
6. Toggle edit/preview modes — hotspot controls show/hide correctly

### User Story 4 — Public Viewer

1. Publish a project with panoramas, 3D model, floor plan, and gallery images
2. Open `http://localhost:3000/en/project/[projectId]` without logging in
3. Verify tabs appear only for non-empty media types
4. Click hotspots — verify scene transitions
5. Switch to 3D Model tab — verify model loads with orbit controls
6. Toggle language to Arabic — verify labels, text, and direction switch

### User Story 5 — Billing

1. Verify billing page shows Free plan with 3 GB limit
2. Upload files until storage exceeds 3 GB — verify uploads blocked with upgrade prompt
3. Run storage usage cron job — verify meter event sent to Stripe

## Files to Modify

| File | Action |
|------|--------|
| `packages/database/prisma/schema.prisma` | Add models + enums |
| `packages/storage/provider/s3/index.ts` | Dynamic ContentType for presigned URLs |
| `packages/api/src/routes/uploads.ts` | Create (upload-init, upload-confirm) |
| `packages/payments/provider/stripe/index.ts` | Add meter event webhook handler |
| `apps/web/modules/saas/projects/` | Create (CRUD UI, media library, tours) |
| `apps/web/modules/saas/viewers/` | Create (public viewer components) |
| `apps/web/modules/saas/payments/` | Extend (billing page, usage cron) |
| `apps/web/app/(saas)` | Add project routes |
| `apps/web/app/(marketing)/[locale]/project/[id]/` | Create public viewer route |
| `apps/web/modules/saas/shared/lib/` | Add upload hook, type definitions |
