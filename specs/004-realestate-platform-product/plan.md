# Implementation Plan: Real Estate Platform Product

**Branch**: `004-realestate-platform-product` | **Date**: 2026-05-29 | **Spec**: `specs/004-realestate-platform-product/spec.md`
**Input**: Feature specification from `/specs/004-realestate-platform-product/spec.md`

## Summary

Build a real estate property management platform within the existing SaaS app. Organization members can create projects with media (panoramas, 3D models, floor plans, gallery images), build linked 360° virtual tours with hotspots, and share them via a public bilingual viewer. Billing tracks storage usage with Free/Flex/Pro tiers.

## Technical Context

**Language/Version**: TypeScript 5.8.3, Node >=20  
**Primary Dependencies**: Next.js 16.2 (React 19.2), Hono 4.7 (API), Prisma 6.6 (ORM), Better Auth 1.6 (auth), Stripe 18 (billing), AWS SDK S3 (storage), next-intl 4.12 (i18n)  
**Storage**: PostgreSQL (via Prisma), AWS S3/MinIO (media files)  
**Testing**: Playwright 1.52 (E2E)  
**Target Platform**: Web (modern browsers: Chrome, Firefox, Safari, Edge), Node.js server  
**Project Type**: Web application (monorepo with Next.js frontend + Hono API)  
**Performance Goals**: 20 MB upload <10s, tour editor <3s load, public viewer <2s load, storage usage reflects within 5s  
**Constraints**: WCAG 2.1 AA, 100 MB max file size, rate-limited uploads (50/min/org), invites (20/hr/org), XSS sanitization  
**Scale/Scope**: ~1,000 projects/org, ~500 media files/project, ~50 scenes/tour, medium scale — pagination and indexed queries required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file (`.specify/memory/constitution.md`) contains template placeholders — no concrete principles, constraints, or gates have been defined. Therefore no violations are present. **Gate: PASS** (pre-Phase 0). **Gate: PASS** (post-Phase 1 re-evaluation) — no design decisions violated constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/004-realestate-platform-product/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
packages/database/prisma/
└── schema.prisma        # + Project, Room, MediaFile, VirtualTour, PanoramaScene, ProjectMember, AnalyticsEvent models

packages/database/drizzle/schema/
└── [mirror new models for Drizzle]

packages/payments/
└── provider/stripe/     # + Usage-based billing for Flex plan

packages/storage/
└── provider/s3/         # + Media file uploads (not just avatars)

apps/web/modules/saas/
└── projects/                        # Project CRUD UI (org-scoped)
│   ├── components/                  # ProjectForm, ProjectList, ProjectDetail, RoomManager
│   ├── lib/                         # use-media-upload, media-utils
│   └── media/                       # MediaGrid, RoomSidebar, UploadDialog, FileCard
│   └── tours/                       # TourList, TourEditor, SceneList, PanoramaPreview, HotspotForm
└── viewers/                         # Public property viewer (TourTab, ModelTab, FloorPlanTab, GalleryTab)

apps/web/app/
├── (saas)/app/(organizations)/[organizationSlug]/projects/  # Dashboard project routes (org-scoped)
└── (marketing)/[locale]/project/[id]/                       # Public viewer route (no auth)
```

**Structure Decision**: Follow existing monorepo layout — reusable domain logic in `packages/*`, UI and pages in `apps/web/modules/saas/`. New Prisma models in `packages/database/prisma/`. New Stripe usage billing logic in `packages/payments/`. Public viewer route under `(marketing)` since it requires no auth.

## Complexity Tracking

> No Constitution violations — not applicable.
