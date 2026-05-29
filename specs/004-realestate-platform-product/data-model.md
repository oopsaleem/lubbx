# Data Model — Real Estate Platform Product

> Phase 1 output. Extends existing Prisma schema in `packages/database/prisma/schema.prisma`.

## Entity: Organization (modified)

Existing model. New fields to add:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `plan` | Enum(FREE, FLEX, PRO) | Required, default FREE | Subscription plan |
| `storageUsedBytes` | BigInt | Required, default 0 | Current storage used |
| `storageLimitBytes` | BigInt | Required | Free=3GB, Flex=unlimited DB-side, Pro=custom |
| `billingPeriod` | Enum(MONTHLY, YEARLY) | Required, default MONTHLY | Billing cycle (Flex/Pro only) |
| `stripeCustomerId` | String? | Unique, nullable | Stripe customer for billing |

## Entity: Project

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | PK, @default(uuid()) | |
| `organizationId` | String | FK → Organization, required | Org scope |
| `createdById` | String | FK → User, required | Creator |
| `title` | String | Required, min 1 char | Property title |
| `description` | String? | Text field | Property description |
| `address` | String? | | Property address |
| `price` | Decimal? | | Listing price |
| `status` | Enum(DRAFT, PUBLISHED) | Required, default DRAFT | Visibility |
| `featuredImageKey` | String? | S3 object key | Featured image |
| `createdAt` | DateTime | @default(now()) | |
| `updatedAt` | DateTime | @updatedAt | |

**Relations**:
- Organization → Project (1:N)
- User (createdBy) → Project (1:N)
- Project → Room (1:N, cascade delete)
- Project → MediaFile (1:N, cascade delete)
- Project → VirtualTour (1:N, cascade delete)
- Project → ProjectMember (1:N, cascade delete)
- Project → AnalyticsEvent (1:N, cascade delete)

**Indexes**: `(organizationId, status)` for scoped listing queries; `(organizationId, createdAt)` for sorted list queries.

## Entity: Room

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | PK, @default(uuid()) | |
| `projectId` | String | FK → Project, required | Parent project |
| `name` | String | Required | Room label (e.g. "Living Room") |
| `sortOrder` | Int | Required, default 0 | Display order |
| `createdAt` | DateTime | @default(now()) | |
| `updatedAt` | DateTime | @updatedAt | |

**Relations**: Project → Room (1:N), Room → MediaFile (1:N, optional).

**Indexes**: `(projectId, sortOrder)` for ordered room listing.

## Entity: MediaFile

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | PK, @default(uuid()) | |
| `projectId` | String | FK → Project, required | Parent project |
| `roomId` | String? | FK → Room, nullable | Room assignment |
| `uploadedById` | String | FK → User, required | Uploader |
| `filename` | String | Required | Original filename |
| `s3Key` | String | Required, unique | S3 object key |
| `type` | Enum(PANORAMA, MODEL_3D, FLOOR_PLAN, GALLERY_IMAGE) | Required | Auto-detected type |
| `size` | BigInt | Required | File size in bytes |
| `mimeType` | String | Required | MIME content type |
| `width` | Int? | Nullable | Image width (for panorama ratio check) |
| `height` | Int? | Nullable | Image height |
| `createdAt` | DateTime | @default(now()) | |
| `updatedAt` | DateTime | @updatedAt | |

**Relations**: Project → MediaFile (1:N), Room → MediaFile (1:N), User → MediaFile (1:N), MediaFile → PanoramaScene (1:1? — multiple scenes could reference same panorama but typically 1:1 per tour context).

**Indexes**: `(projectId, roomId, type)` for filtered media library queries; `(s3Key)` unique.

**Validation rules**:
- Max file size: 100 MB (FR-023)
- Allowed types per extension: `.glb` → MODEL_3D, `.jpg`/`.png` (aspect ≥ 2:1) → PANORAMA, `.tiff`/`.pdf` → FLOOR_PLAN, other → GALLERY_IMAGE (FR-005)

## Entity: VirtualTour

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | PK, @default(uuid()) | |
| `projectId` | String | FK → Project, required | Parent project |
| `createdById` | String | FK → User, required | Creator |
| `name` | String | Required | Tour name |
| `description` | String? | | Tour description |
| `sortOrder` | Int | Required, default 0 | Display order |
| `createdAt` | DateTime | @default(now()) | |
| `updatedAt` | DateTime | @updatedAt | |

**Relations**: Project → VirtualTour (1:N), VirtualTour → PanoramaScene (1:N, cascade delete).

## Entity: PanoramaScene

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | PK, @default(uuid()) | |
| `tourId` | String | FK → VirtualTour, required | Parent tour |
| `mediaFileId` | String | FK → MediaFile, required | Reference panorama |
| `initialPitch` | Float | Required, default 0 | Initial view pitch |
| `initialYaw` | Float | Required, default 0 | Initial view yaw |
| `initialZoom` | Float | Required, default 100 | Initial zoom level |
| `hotspots` | JSON | Required, default [] | Array of hotspot objects |
| `sortOrder` | Int | Required, default 0 | Scene order in tour |
| `createdAt` | DateTime | @default(now()) | |
| `updatedAt` | DateTime | @updatedAt | |

**Relations**: VirtualTour → PanoramaScene (1:N), MediaFile → PanoramaScene (N:1 — one panorama can be used in multiple scenes across tours).

**Indexes**: `(tourId, sortOrder)` for ordered scene loading.

**Hotspot JSON schema**:
```typescript
type Hotspot = {
  id: string;           // UUID
  yaw: number;          // Horizontal position (degrees or radians)
  pitch: number;        // Vertical position
  labelEn: string;      // English label text
  labelAr?: string;     // Arabic label text (optional)
  targetSceneId?: string | null; // Target scene UUID (null if external)
  externalUrl?: string | null;   // External URL (null if scene link)
};
```

At least one of `targetSceneId` or `externalUrl` must be set.

## Entity: ProjectMember

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | PK, @default(uuid()) | |
| `projectId` | String | FK → Project, required | Project |
| `userId` | String? | FK → User, nullable | Accepted user (null before accept) |
| `invitedEmail` | String | Required | Email of invited person |
| `role` | Enum(EDITOR, VIEWER) | Required | Access level |
| `status` | Enum(PENDING, ACCEPTED) | Required, default PENDING | Invitation status |
| `createdAt` | DateTime | @default(now()) | |
| `updatedAt` | DateTime | @updatedAt | |

**Relations**: Project → ProjectMember (1:N), User → ProjectMember (1:N, optional).

**Indexes**: `(projectId, status)` for member list queries; `(userId)` for user's project lookups.

## Entity: AnalyticsEvent

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | PK, @default(uuid()) | |
| `projectId` | String | FK → Project, required | Project |
| `eventType` | Enum(VIEW, SHARE) | Required | Event type |
| `metadata` | JSON? | Nullable | Additional context |
| `createdAt` | DateTime | @default(now()) | |

**Relations**: Project → AnalyticsEvent (1:N).

**Indexes**: `(projectId, eventType, createdAt)` for analytics aggregation queries.

## State Transitions

```
Project:
  DRAFT ──[publish]──→ PUBLISHED
  PUBLISHED ──[unpublish]──→ DRAFT

ProjectMember:
  PENDING ──[accept invitation]──→ ACCEPTED

Organization storage:
  Upload: storageUsedBytes += fileSize
  Delete:  storageUsedBytes -= fileSize
  (Clamped to min 0; negative treated as 0 w/ warning per Edge Cases)
```

## New Prisma Enums

```prisma
enum OrganizationPlan {
  FREE
  FLEX
  PRO
}

enum BillingPeriod {
  MONTHLY
  YEARLY
}

enum ProjectStatus {
  DRAFT
  PUBLISHED
}

enum MediaType {
  PANORAMA
  MODEL_3D
  FLOOR_PLAN
  GALLERY_IMAGE
}

enum ProjectMemberRole {
  EDITOR
  VIEWER
}

enum ProjectMemberStatus {
  PENDING
  ACCEPTED
}

enum AnalyticsEventType {
  VIEW
  SHARE
}
```

## Uniqueness & Identity

- Organization IDs: existing UUID pattern
- Project IDs: UUID, unique across all orgs
- Room uniqueness: no name uniqueness constraint per project (users may have duplicate room labels)
- MediaFile S3 keys: unique across all projects (UUID-based key generation)
- ProjectMember: unique on (projectId, invitedEmail) for pending invites; unique on (projectId, userId) for accepted members
- AnalyticsEvent: append-only, no uniqueness constraint

## Data Volume Assumptions

- ~1,000 projects per organization
- ~500 media files per project (avg ~5 MB each = ~2.5 GB total)
- ~50 panorama scenes per tour
- ~5 tours per project
- Analytics events: ~10,000 per project over its lifetime
