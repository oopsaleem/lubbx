# Real Estate Marketing Platform — Design Spec

## Overview

A platform for property owners to upload and showcase 2D floor plans, 3D models, 
360° panoramic tours, and image galleries in a unified public viewer.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Storage | MinIO S3 (local), AWS S3 (prod) |
| File upload | react-dropzone + S3 presigned URLs |
| 360° Viewer | Photo Sphere Viewer |
| 3D Viewer | @google/model-viewer |
| Floor Plan | Leaflet + react-leaflet |
| Payments | Stripe |

### Existing Models (KEEP as-is)

| Model | Purpose |
|-------|---------|
| `User` | Already has Better Auth fields, `paymentsCustomerId`, `locale`, `role`. Add: `theme` (String, 'light'\|'dark'), `onboardingComplete` already exists |
| `Session` | Better Auth session management |
| `Account` | Better Auth account linking |
| `Verification` | Email verification codes |
| `Passkey` | Passkey auth support |
| `TwoFactor` | 2FA support |
| `Invitation` | Org invitations (by email) |
| `Purchase` | Stripe subscriptions — has `subscriptionId`, `productId`, `customerId`, handles SUBSCRIPTION/ONE_TIME types |
| `Member` | Org membership with role — maps user to organization |

### Organization (MODIFY — add plan & storage fields)

Existing fields: `id`, `name`, `slug`, `logo`, `paymentsCustomerId`, `metadata`
Add fields:

| Column | Type | Notes |
|--------|------|-------|
| `plan` | Enum (FREE, FLEX, PRO) | Default: FREE |
| `storageUsedBytes` | BigInt | Current usage |
| `storageLimitBytes` | BigInt | Plan limit |
| `billingPeriod` | Enum (MONTHLY, YEARLY) | Default: MONTHLY |

### Project (ADD)
| Column | Type | Notes |
|--------|------|-------|
| id | String @id @default(cuid()) | |
| title | String | |
| description | String? | |
| address | String? | |
| price | Float? | |
| status | String | 'DRAFT' \| 'PUBLISHED', default 'DRAFT' |
| featuredImageKey | String? | S3 key |
| organizationId | String | FK → Organization |
| createdById | String | FK → User |
| createdAt | DateTime @default(now()) | |
| updatedAt | DateTime @updatedAt | |

### Room (ADD)
| Column | Type | Notes |
|--------|------|-------|
| id | String @id @default(cuid()) | |
| name | String | e.g. "Living Room" |
| sortOrder | Int | Display order |
| projectId | String | FK → Project |

### MediaFile (ADD)
| Column | Type | Notes |
|--------|------|-------|
| id | String @id @default(cuid()) | |
| filename | String | Original filename |
| key | String | S3 object key |
| type | String | 'PANORAMA' \| 'MODEL_3D' \| 'FLOOR_PLAN' \| 'GALLERY_IMAGE' |
| size | Int | Bytes |
| mimeType | String | |
| roomId | String? | FK → Room (nullable) |
| projectId | String | FK → Project |
| uploadedById | String | FK → User |
| createdAt | DateTime @default(now()) | |

### VirtualTour (ADD)
| Column | Type | Notes |
|--------|------|-------|
| id | String @id @default(cuid()) | |
| name | String | e.g. "Main Tour" |
| description | String? | |
| sortOrder | Int | Display order within project |
| projectId | String | FK → Project |
| createdById | String | FK → User |
| createdAt | DateTime @default(now()) | |
| updatedAt | DateTime @updatedAt | |

### PanoramaScene (ADD)
| Column | Type | Notes |
|--------|------|-------|
| id | String @id @default(cuid()) | |
| tourId | String | FK → VirtualTour |
| mediaFileId | String | FK → MediaFile, unique (each panorama belongs to one scene) |
| sortOrder | Int | Scene order within the tour |
| initialPitch | Float? | Default view pitch in degrees |
| initialYaw | Float? | Default view yaw in degrees |
| initialZoom | Int? | Default zoom level (0-100) |
| hotspots | Json? | Array of hotspot objects — each has `id`, `yaw`, `pitch`, `text` (bilingual `{en, ar}`), `targetSceneId` (logical ref to another PanoramaScene in the same tour), optional `url` for external links |

### ProjectMember (ADD — per-project collaboration)
| Column | Type | Notes |
|--------|------|-------|
| id | String @id @default(cuid()) | |
| projectId | String | FK → Project |
| userId | String? | FK → User (null if pending) |
| invitedEmail | String | |
| role | String | 'EDITOR' \| 'VIEWER' |
| status | String | 'PENDING' \| 'ACCEPTED' |
| createdAt | DateTime @default(now()) | |

### AnalyticsEvent (ADD)
| Column | Type | Notes |
|--------|------|-------|
| id | String @id @default(cuid()) | |
| projectId | String | FK → Project |
| event | String | 'VIEW' \| 'SHARE' |
| metadata | Json? | |
| createdAt | DateTime @default(now()) | |


## Pricing Plans

| Feature | Free | Flex (PAYG) | Pro |
|---------|------|-------------|-----|
| Storage | 3 GB | Pay as you go per GB | Custom contract |
| Organizations | 1 | Unlimited | Unlimited |
| Monthly price | $0 | Base fee + storage usage | Arranged |
| Yearly price | $0 | Yearly discount applied | Arranged |

- Plans are per-organization (each org selects its own plan)
- Free: auto-assigned on org creation. Upgraded to Flex or Pro via billing.
- Flex: Stripe usage-based billing. Track storage in GB-months.
- Pro: manual setup via contract. Stripe Products/Prices with `metered` usage or flat fee.
- Billing period (monthly/yearly) applies to Flex and Pro plans.


## Dashboard Structure
- Organization selector switches the active org (changes all scoped data)
- Overview shows org-level stats (projects count, storage used, views)
- Projects are scoped to the active organization
- Team lists members of the active organization (not project-level team)

### Media Library
Two-panel layout: room sidebar (left) + file grid (right).
- "All files" shows everything; click a room to filter
- Upload button opens file picker with auto-type detection by file extension:
  - `.glb` → 3D Model
  - `.jpg`, `.png` with aspect ratio ≥ 2:1 → Panorama
  - `.tiff`, `.pdf` → Floor Plan
  - other images → Gallery
- Files can be dragged between rooms, deleted, re-labeled

### Virtual Tour Editor

Inside the project detail page (dashboard), a dedicated "Tour Editor" tab for creating linked 360° experiences:

- **Tour management**: create, rename, reorder, delete tours within a project
- **Scene management**: add panoramas from the media library as scenes. Each scene picks a single PANORAMA-type MediaFile. Set initial view direction (pitch/yaw/zoom) for each scene.
- **Hotspot placement**: click on the Photo Sphere Viewer preview to place a hotspot. Each hotspot stores:
  - Position (`yaw`, `pitch`) on the panorama sphere
  - Bilingual label (`{ en: "...", ar: "..." }`)
  - Target: link to another scene in the same tour (`targetSceneId`) or an external URL
- **Tour preview**: playable embedded Photo Sphere Viewer within the editor to test the full tour flow
- **i18n**: hotspot labels, tooltips, and viewer UI controls are translatable. Static controls use `next-intl` keys; hotspot text uses the bilingual JSON structure stored in the scene.
- Changes save per-scene (auto-save or explicit save button)

## Project CRUD

Single form with:
- Title (required), Description, Address, Price
- Status toggle: Draft / Published
- Featured image upload with preview
- Dynamic room list: add/remove rooms by name
- Creates project + rooms in one transaction
- On save → redirect to project detail

## Public Viewer

Route: `/[locale]/project/[id]`
- Four tabs: 360° Tour | 3D Model | Floor Plan | Gallery
- Tabs only render if data exists for that type
- **360° Tour tab**: loads Photo Sphere Viewer with the first tour's first scene. If multiple tours exist, a tour selector appears (dropdown or tabs). Hotspots are rendered as interactive links — clicking navigates to the linked scene (same viewer, smooth transition) or opens an external URL.
- Dynamic imports with SSR disabled for viewer libraries
- Language toggle navigates to the same page under a different `/[locale]` prefix (full page reload)
- Theme toggle respects user/system preference
- No auth required — fully public

## Billing

- **Billing page** at `/dashboard/settings/billing`:
  - Current plan display with usage stats (storage used / limit)
  - "Upgrade" button → Stripe Checkout or Customer Portal
  - Plan comparison table
  - Invoice history (from Stripe)
- **Storage tracking**: update `organization.storageUsedBytes` on file upload/delete. For Flex plans, report usage to Stripe via `stripe.usageRecords`.
- **Usage limits**: block uploads if storage exceeds plan limit. Show upgrade prompt.

**Project-level team** (inside project detail tabs):
- Invite members to collaborate on a specific project
- Roles: Editor, Viewer

## Analytics

Per-project counts: views, shares, views over time (last 30 days).
Data from AnalyticsEvent table. Simple bar chart for timeline.


## Route Map

```
/dashboard                           → Overview (protected, org-scoped)
/dashboard/[org-slug]/projects                     → Projects list (protected)
/dashboard/[org-slug]/projects/new                 → Create project (protected)
/dashboard/[org-slug]/projects/[id]                → Project detail with tabs (protected)
/dashboard/[org-slug]/projects/[id]/tours          → Tour list (protected)
/dashboard/[org-slug]/projects/[id]/tours/[tourId] → Tour editor with scene/hotspot management (protected)
/dashboard/[org-slug]/settings                     → Org settings (protected)
```
