# Research — Real Estate Platform Product

> Phase 0 output. Resolves all NEEDS CLARIFICATION items from Technical Context.

## 1. 360° Panorama Viewer

**Decision**: `@photo-sphere-viewer/core` + `react-photo-sphere-viewer` + MarkersPlugin + VirtualTourPlugin  
**Rationale**:
- Full TypeScript support across all packages
- Built-in virtual tour (scene-to-scene navigation) with the `virtual-tour-plugin`
- MarkersPlugin provides hotspot API (yaw/pitch positioning, click handlers, bilingual tooltips)
- React 19 compatible wrapper (`react-photo-sphere-viewer`) with ref-based viewer access
- Keyboard navigation built-in (`keyboard: 'always'`)
- MIT license, actively maintained (latest Jan 2026)
- Bundle: ~151 KB gzipped (core + markers + three.js + react wrapper)

**Alternatives considered**:
- **Pannellum** — 10x smaller bundle (~18 KB) but no dynamic hotspot CRUD, no scene-to-scene navigation, static config-only hotspot API
- **Marzipano** — unmaintained since 2020; wrappers archived or have < 3 stars
- **Three.js custom** — months of dev work to replicate PSV features; not worth it

**Integration pattern**: React client component wrapping `ReactPhotoSphereViewer` with MarkersPlugin and VirtualTourPlugin. Hotspots stored as scene-level data containing yaw, pitch, bilingual labels (en/ar), target scene ID, and optional external URL.

**Arabic/RTL**: PSV supports custom `lang` prop for UI translations; pass Arabic labels in hotspot data, render `dir="rtl"` on container when Arabic.

**Accessibility**: PSV provides `keyboard: 'always'` for keyboard navigation, plus `keyboardActions` for custom key mapping. WCAG 2.1 AA: ensure focus management on hotspot selection, provide aria-labels on container.

---

## 2. 3D Model Viewer

**Decision**: `@google/model-viewer` v4.2+ (web component)  
**Rationale**:
- Purpose-built for single .glb display with zero-config orbit controls
- Built-in loading/poster, environment lighting, lazy loading
- Accessibility via `aria-label`, keyboard orbit controls
- ~68 KB minzip, loaded via dynamic import with `ssr: false`
- Google-maintained, 230K weekly downloads, 69 releases
- Trivial to show/hide alongside other viewer tabs (component swap)

**Alternatives considered**:
- **@react-three/fiber** + drei — ~275 KB+ tree-shaken, overkill for single-model display; canvas lifecycle management needed
- **Three.js directly** — ~200 KB, manual setup for every feature model-viewer gives for free

**Integration pattern**: Client component with `'use client'` directive, dynamically imported via `next/dynamic` with `ssr: false` (web component requires browser DOM).

```tsx
const ModelViewer = dynamic(() => import('./model-viewer'), { ssr: false });
```

---

## 3. Drag & Drop for Media Library

**Decision**: `@dnd-kit/react` (pre-v1 but actively developed, 2.8M weekly downloads)  
**Rationale**:
- React 19 supported (peer `^18 || ^19`)
- Native touch support via pointer sensor (no separate backend)
- Cross-container drag (file grid → room sidebar) built-in via multiple `SortableContext`s
- ~15-20 KB gzipped total (core ~6KB + sortable ~8KB)
- First-class TypeScript
- Tailwind-compatible (framework-agnostic)

**Alternatives considered**:
- **@hello-pangea/dnd** v18 — React 19 supported, but ~31 KB gzipped, list-oriented API not ideal for grid layouts
- **react-dnd** — React 19 support is community-patch-level, touch support requires separate backends, ~30 KB gzipped

**Integration pattern**: Wrap media library grid and room sidebar in `DragDropProvider`. On `onDragEnd`, determine source/target containers and move file assignment. `"use client"` wrapper needed for Next.js App Router.

---

## 4. Stripe Usage-Based Billing (Flex Plan)

**Decision**: Stripe **Meter Events API** with `last` aggregation, reported via **daily cron job**  
**Rationale**:
- `last` aggregation correctly handles storage levels that go up and down (uploads + deletions)
- Daily cron avoids per-upload API spam; the last report before invoice finalization = billed amount
- No `subscription_item` ID needed (unlike legacy UsageRecord API) — only Stripe customer ID
- Meter Events API is Stripe's recommended approach (replaces legacy UsageRecords)
- Yearly billing: separate Price with `interval: "year"` and discounted `unit_amount`; same meter

**Concrete objects**:
```typescript
const meter = await stripe.billing.meters.create({
  display_name: "Storage Usage (GB)",
  event_name: "storage_usage_gb",
  default_aggregation: { formula: "last" },
  customer_mapping: { type: "by_id", event_payload_key: "stripe_customer_id" },
  value_settings: { event_payload_key: "value" },
});

const price = await stripe.prices.create({
  currency: "usd",
  unit_amount: 20, // $0.20
  billing_scheme: "per_unit",
  recurring: { usage_type: "metered", interval: "month", meter: meter.id },
  product: product.id,
});
```

**Cron job**: Daily snapshot that queries all FLEX-plan orgs, converts `storageUsedBytes` to GB, and calls `stripe.billing.meterEvents.create()` with idempotency key.

**Edge cases**:
- Deletions: `last` aggregation naturally uses the final snapshot value — correct
- Mid-cycle start: cron picks up new orgs on next run; meter events before subscription creation are ignored
- Invoice finalization race: run cron every 24h; optionally also report on `invoice.finalized` webhook
- Error monitoring: add webhook handler for `v1.billing.meter.error_report_triggered`

**Impacted files**: `packages/payments/provider/stripe/index.ts` (webhook handler), new cron job in `apps/web/modules/saas/payments/jobs/report-storage-usage.ts`.

---

## 5. Presigned URL Upload Flow

**Decision**: **Two-endpoint pattern** (upload-init + upload-confirm) with **XMLHttpRequest for progress**  
**Rationale**:
- `upload-init` (POST): validates permissions, file types, sizes, rate limits — returns one presigned URL per file (bulk, single round-trip)
- `upload-confirm` (POST): called after successful S3 PUT — atomically stores media record + updates `storageUsedBytes` in DB transaction (eliminates race condition)
- XHR upload progress: `XMLHttpRequest.upload.onprogress` provides reliable progress across all browsers (~10 lines of code, no extra dependency)
- Single PUT presigned URLs suffice (max 100 MB < 5 GB single PUT limit; multipart adds unnecessary complexity)
- Client-side concurrency: semaphore of 3 parallel uploads per organization
- Rate limiting via Hono `hono-rate-limiter` middleware (50/min/org)

**Client-side panorama detection**: Use `Image()` / `OffscreenCanvas` on the client to detect aspect ratio ≥ 2:1; pass dimensions in `upload-confirm` payload (avoids server-side download).

**Key design decisions**:
- File type validation on both client (instant UX feedback) and server (security boundary)
- `upload-confirm` runs in a DB transaction: INSERT media rows + UPDATE `organizations.storageUsedBytes` + COMMIT
- Stale `upload-init` records cleaned up by background job (no confirm after N minutes)

**Impacted files**: `packages/api/src/routes/uploads.ts` (new routes + rate limiter), `packages/storage/provider/s3/index.ts` (dynamic ContentType), `apps/web/modules/saas/shared/lib/use-media-upload.ts` (new hook), media library components.

---

## 6. File Type Auto-Detection

**Decision**: File extension-based (server) + client-side aspect ratio (for panoramas)  
**Rationale**: Spec already defines rules:
- `.glb` → MODEL_3D
- `.jpg`/`.png` with aspect ratio ≥ 2:1 → PANORAMA
- `.tiff`/`.pdf` → FLOOR_PLAN
- Other images → GALLERY_IMAGE

Server validates extension + MIME type. Client provides image dimensions in `upload-confirm` payload for panorama classification. No content-based MIME detection for v1 (per spec assumption).

---

## 7. Accessibility (WCAG 2.1 AA)

**Key considerations for each component**:
- **Dashboard UI**: shadcn/ui components built on Radix primitives already handle ARIA roles, focus management, keyboard nav
- **Panorama Viewer**: PSV `keyboard: 'always'`, focus on hotspots via tab navigation, aria-labels on viewer container
- **3D Viewer**: model-viewer `aria-label` attribute, keyboard orbit controls built-in
- **Media Library**: dnd-kit supports keyboard sortable (Space/Enter to pick, Arrow keys to move)
- **Public Viewer**: language toggle preserves focus position, proper heading hierarchy, skip-to-content link
- **Color contrast**: minimum 4.5:1 (standard foreground/background), 3:1 for large text
- **Screen readers**: all icons have aria-labels, form inputs have associated labels, dynamic content uses aria-live regions
