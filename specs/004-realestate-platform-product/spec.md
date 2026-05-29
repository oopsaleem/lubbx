# Feature Specification: Real Estate Platform Product

**Feature Branch**: `004-realestate-platform-product`  
**Created**: 2026-05-29  
**Status**: Draft  
**Input**: User description: "we want to add this product to organization @2026-05-27-real-estate-platform-design.md"

## Clarifications

### Session 2026-05-29

- Q: Should the spec include an explicit out-of-scope declaration? → A: Yes, add an explicit "Out of Scope" section listing features deliberately excluded.
- Q: What is the expected data volume scale? → A: Medium scale (~1,000 projects per org, ~500 media files per project).
- Q: What accessibility compliance level is targeted? → A: WCAG 2.1 Level AA.
- Q: How should empty and loading states be handled across views? → A: Adopt a consistent pattern — skeleton loaders for list/detail views + empty-state illustrations with CTA for each view.
- Q: What security measures beyond auth are required? → A: Standard security — rate limiting on uploads/invites, input sanitization, file type + size validation on upload.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Project CRUD & Organization Scoping (Priority: P1)

Organization owners and members can create, edit, list, and delete real estate property projects scoped to their active organization. Projects always belong to an organization — the organization is the master entity, projects are details. Each project contains title, description, address, price, status (draft/published), and a featured image.

**Why this priority**: Project CRUD is the foundational building block — no other feature (media, tours, viewer) is usable without a project to attach to.

**Independent Test**: An organization member can log in, navigate to the projects list, create a new project with title and description, see it appear in the list, edit it, and delete it. All operations respect organization scoping — only projects belonging to the active organization are visible.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an active organization, **When** they navigate to the projects list, **Then** they see only projects belonging to that organization
2. **Given** the projects list is empty, **When** the user clicks "New Project" and fills in title, description, address, and price, **Then** a new project is created in DRAFT status and they are redirected to the project detail page
3. **Given** a project in DRAFT status, **When** the user toggles the status to PUBLISHED, **Then** the project becomes visible on the public viewer
4. **Given** a project with multiple rooms, **When** the user edits the project and removes or reorders rooms, **Then** the changes are reflected in the next view
5. **Given** a project has associated media and tours, **When** the user deletes the project, **Then** all associated media files and tours are also removed

---

### User Story 2 - Media Library with Room Navigation (Priority: P1)

Organization members can upload property media files (panoramas, 3D models, floor plans, gallery images) and organize them across rooms within a project. File type is auto-detected from extension. Uploads use S3 presigned URLs.

**Why this priority**: Media files are the core content — panoramas feed the tour editor, floor plans and 3D models feed the public viewer, and gallery images are the first visual impression.

**Independent Test**: A user opens a project, navigates to the media library, uploads a `.jpg` image (aspect ratio ≥ 2:1), sees it auto-classified as a Panorama and appearing under the "All files" view, then drags it to a room to assign it.

**Acceptance Scenarios**:

1. **Given** the media library view, **When** the user clicks a room in the left sidebar, **Then** only files assigned to that room are shown
2. **Given** the upload dialog, **When** the user selects a `.glb` file, **Then** it is auto-classified as MODEL_3D and uploaded via presigned S3 URL
3. **Given** an uploaded panorama file, **When** the user views it in the library, **Then** it shows a preview thumbnail and the correct type badge
4. **Given** a file in one room, **When** the user drags it to another room, **Then** the file's room assignment is updated
5. **Given** a file in the library, **When** the user deletes it, **Then** the file is removed from S3 and the organization's storage usage is decremented

---

### User Story 3 - Virtual Tour Editor (Priority: P2)

Organization members can create linked 360° tours within a project by adding panorama scenes, setting initial view directions, and placing interactive hotspots that link scenes together.

**Why this priority**: Virtual tours are the most differentiated feature of the platform — they provide a unique immersive experience that sets the product apart from basic image galleries.

**Independent Test**: A user creates a tour, adds two panorama scenes, places a hotspot on the first scene pointing to the second, saves, then previews the tour — clicking the hotspot transitions smoothly to the second scene.

**Acceptance Scenarios**:

1. **Given** a project with at least two panoramas uploaded, **When** the user creates a new tour and adds a scene with a panorama, **Then** the scene appears in the tour's scene list with the panorama preview
2. **Given** a scene is selected in the tour editor, **When** the user clicks on the Photo Sphere Viewer preview at a specific position, **Then** a hotspot is created at that yaw/pitch with a default label
3. **Given** a hotspot is selected, **When** the user sets its target to another scene in the same tour and saves, **Then** clicking the hotspot in preview mode navigates to the target scene
4. **Given** a tour with multiple scenes, **When** the user reorders scenes, **Then** the new order is reflected in the preview flow
5. **Given** the tour editor is open, **When** the user toggles between edit and preview modes, **Then** edit mode shows hotspot placement controls and preview mode hides them

---

### User Story 4 - Public Property Viewer (Priority: P2)

Unauthenticated visitors can view published projects via a public route. The viewer has four tabs: 360° Tour, 3D Model, Floor Plan, and Gallery. Tabs only render if data exists. Language and theme toggles are available.

**Why this priority**: The public viewer is the end-user delivery mechanism — it's what property buyers and tenants actually use to explore listings.

**Independent Test**: A visitor opens a published project URL with three panoramas in a tour — they see the 360° Tour tab active, can click hotspots to navigate between scenes, switch to the Gallery tab to see images, and toggle the language between English and Arabic.

**Acceptance Scenarios**:

1. **Given** a published project URL, **When** an unauthenticated visitor opens it, **Then** the viewer loads with tabs for each non-empty media type
2. **Given** the 360° Tour tab is active and multiple tours exist, **When** the visitor selects a different tour, **Then** the first scene of that tour loads in the Photo Sphere Viewer
3. **Given** a scene with hotspots, **When** the visitor clicks a hotspot, **Then** the view transitions to the linked scene or opens the external URL
4. **Given** the visitor views a project in English, **When** they toggle the language to Arabic, **Then** the page reloads with all static UI text in Arabic and hotspot labels switch to their Arabic content
5. **Given** a project with no 3D models, **When** the viewer loads, **Then** the 3D Model tab is not rendered

---

### User Story 5 - Billing & Usage Tracking (Priority: P3)

Organizations have a billing page showing current plan (Free/Flex/Pro), storage usage vs. limit, and upgrade options. Flex plans charge based on storage consumed. Uploads are blocked when storage exceeds the plan limit.

**Why this priority**: Billing enables monetization but is not required for the initial feature rollout — organizations can start on the Free plan while the billing integration is built.

**Independent Test**: An organization on the Free plan (3 GB limit) uploads files until storage exceeds 3 GB, at which point uploads are blocked with an upgrade prompt. The billing page shows current usage as a progress bar.

**Acceptance Scenarios**:

1. **Given** an organization on the Free plan, **When** the billing page loads, **Then** it shows 3 GB storage limit, current usage, and an "Upgrade" button
2. **Given** an organization on the Flex plan, **When** storage is reported via usage records, **Then** Stripe billing reflects the correct usage amount
3. **Given** storage usage exceeds the plan limit, **When** a user attempts to upload a file, **Then** the upload is rejected with a message to upgrade
4. **Given** an organization upgrades from Free to Flex, **When** the Stripe checkout completes, **Then** the organization's plan field is updated and storage limit increases

---

### Edge Cases

- What happens when a user uploads a file while on the Free plan and storage is at 99%? The upload should succeed if under the limit; the storage check is exact (usedBytes + fileSize < limitBytes)
- What happens when a project is deleted with active tours? All scenes, hotspots, and associated media files are cascading-deleted
- How does the system handle a file that was manually deleted from S3? The database record should still exist but the viewer should gracefully show a "file unavailable" state
- What happens when two users edit the same tour simultaneously? Last-save-wins with an optimistic concurrency model — no locking for v1
- How does the public viewer handle a project that was published and then switched back to draft? The viewer should return a 404 or "not available" state immediately
- What happens when storage tracking reports a negative value (e.g., after a file delete that was uploaded before tracking was implemented)? Treat as 0, log a warning
- How are empty and loading states displayed across all views? All list/detail views use skeleton loaders during data fetch. Empty states show contextual illustrations with a primary CTA (e.g., "Create your first project", "Upload media", "Add a tour")

## Out of Scope

The following are explicitly out of scope for this feature:

- **Native mobile applications** (iOS/Android) — the platform is web-only for v1
- **MLS/IDX integration** — no automated listing sync with real estate databases
- **AI-generated property descriptions or virtual staging** — no AI content generation
- **Public user accounts / buyer personas** — only organization members have accounts; the public viewer requires no login
- **Offline viewing or PWA support** — the viewer requires an active internet connection
- **Third-party listing syndication** (e.g., Zillow, Realtor.com feeds) — no outbound listing distribution
- **Automated valuation models (AVM)** — no automated property price estimation
- **In-app messaging or lead capture forms** — no communication features between visitors and agents

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Organization owners MUST be able to create projects with title (required), description, address, price, and featured image
- **FR-002**: Projects MUST be scoped to the active organization — users only see projects belonging to their current organization context
- **FR-003**: Projects MUST support two statuses: DRAFT (editable, not publicly visible) and PUBLISHED (visible on the public viewer)
- **FR-004**: Users MUST be able to add, remove, and reorder rooms within a project
- **FR-005**: The system MUST auto-detect media file type from the file extension using the rules: `.glb` → MODEL_3D, `.jpg`/`.png` with aspect ratio ≥ 2:1 → PANORAMA, `.tiff`/`.pdf` → FLOOR_PLAN, other images → GALLERY_IMAGE
- **FR-006**: Media uploads MUST use S3 presigned URLs and MUST update `organization.storageUsedBytes` on success
- **FR-007**: Deleting a media file MUST decrement the storage usage and remove the S3 object
- **FR-008**: Users MUST be able to create virtual tours within a project with multiple named scenes
- **FR-009**: Each tour scene MUST reference a single PANORAMA-type media file and store initial view direction (pitch, yaw, zoom)
- **FR-010**: Hotspots MUST store position (yaw, pitch), bilingual label (English/Arabic), and target (another scene ID or external URL)
- **FR-011**: Changes to scenes and hotspots MUST persist per-scene (explicit save or auto-save)
- **FR-012**: The public viewer MUST be accessible without authentication at route `/[locale]/project/[id]`
- **FR-013**: The public viewer MUST render only tabs for media types that have data (no empty tabs)
- **FR-014**: Language toggle in the public viewer MUST switch between English and Arabic, reloading the same project page
- **FR-015**: The billing page MUST display current plan name, storage usage (used/limit), and an upgrade action
- **FR-016**: Uploads MUST be blocked when `storageUsedBytes + fileSize > storageLimitBytes`, with a clear upgrade prompt
- **FR-017**: Organization storage limits MUST be: Free = 3 GB, Flex = pay-as-you-go (no hard limit), Pro = custom contract
- **FR-018**: Flex plan pricing: No base monthly fee; usage-based billing at $0.20/GB/month for storage consumed. Yearly billing period applies a discount (to be defined in Stripe product configuration).
- **FR-019**: The system MUST track per-project analytics events including page views and share actions
- **FR-020**: Project owners MUST be able to invite collaborators by email with EDITOR or VIEWER role
- **FR-021**: Invited project members MUST receive an email notification with a link to accept the invitation
- **FR-022**: Organization admins MUST be able to manage team members at the organization level (invite, remove, change role)
- **FR-023**: Upload endpoints MUST validate file type against the allowed extensions and reject files exceeding 100 MB
- **FR-024**: Upload and invitation endpoints MUST implement rate limiting — max 50 uploads per minute per organization, max 20 invitations per hour per organization
- **FR-025**: All user-supplied text input (title, description, address, room names, tour names) MUST be sanitized to prevent XSS

### Key Entities *(include if feature involves data)*

- **Organization** (modified): Already exists. Add fields for `plan` (FREE|FLEX|PRO), `storageUsedBytes`, `storageLimitBytes`, `billingPeriod` (MONTHLY|YEARLY)
- **Project**: Core container for a property listing, scoped under an Organization. Has title, description, address, price, status (DRAFT|PUBLISHED), featured image key. Organization is the master — Project is a detail. Belongs to one Organization (required), created by one User.
- **Room**: Named section within a project (e.g., "Living Room", "Bedroom"). Has a sort order. Belongs to one Project.
- **MediaFile**: Uploaded property media. Has filename, S3 key, type (PANORAMA|MODEL_3D|FLOOR_PLAN|GALLERY_IMAGE), size, mime type. Optionally assigned to a Room. Belongs to one Project, uploaded by one User.
- **VirtualTour**: An ordered collection of panorama scenes forming a navigable tour. Has name, description, sort order. Belongs to one Project, created by one User.
- **PanoramaScene**: A single panorama within a tour, referencing a MediaFile. Has initial view direction (pitch/yaw/zoom) and hotspot JSON (array of hotspot objects with yaw, pitch, bilingual text, target scene ID, optional URL).
- **ProjectMember**: Per-project collaboration. Has role (EDITOR|VIEWER), status (PENDING|ACCEPTED), invited email. Links User to Project (nullable user ID for pending invitations).
- **AnalyticsEvent**: Tracks views and shares per-project. Has event type (VIEW|SHARE), optional metadata JSON. Belongs to one Project.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An organization member can create a project with title and featured image, add 3 rooms, and publish it in under 3 minutes
- **SC-002**: A 20 MB panorama upload completes in under 10 seconds on a standard broadband connection
- **SC-003**: The virtual tour editor loads and is ready for interaction within 3 seconds of opening
- **SC-004**: The public viewer page loads initial content within 2 seconds on a standard broadband connection
- **SC-005**: Storage usage is correctly reflected in the billing page within 5 seconds of a file upload or deletion
- **SC-006**: 95% of published projects render without JavaScript errors across modern browsers (Chrome, Firefox, Safari, Edge)
- **SC-007**: The public viewer displays bilingual content correctly in both English and Arabic locales
- **SC-008**: All dashboard and public viewer UI meets WCAG 2.1 Level AA standards — keyboard navigable, screen reader compatible, minimum 4.5:1 color contrast, focus indicators visible

## Assumptions

- The existing authentication and organization system (Better Auth) will be reused — users authenticate and select an active organization before accessing dashboard features
- The existing S3 storage integration (MinIO for local, AWS S3 for production) will be reused for media file storage
- The existing Stripe billing integration (Checkout Sessions, Customer Portal, webhooks) will be extended to support the new Flex and Pro pricing plans
- File type auto-detection is based on file extension only — no content-based MIME detection for v1
- The Free plan has a hard storage limit of 3 GB; Flex has no hard limit but charges per GB per month; Pro is a manual contract
- Panorama images are expected to be equirectangular (2:1 aspect ratio) — the system uses this ratio for auto-detection but does not validate the actual image content
- Virtual tour projections assume single-scene transitions with a cross-fade or instant switch (smooth transitional animations are a polish item)
- Billing periods (monthly/yearly) only apply to Flex and Pro plans — Free is always free
- The public viewer supports the two configured locales (English and Arabic) and respects the system/browser language preference
- Storage tracking counters are eventually consistent — there may be a brief delay between upload/delete and the displayed usage value
- Expected data volume is medium scale: up to ~1,000 projects per organization, ~500 media files per project, and ~50 panorama scenes per tour. Schema and queries must support pagination and indexed lookups on organization+status
