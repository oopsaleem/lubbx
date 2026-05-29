# Contract: Public Property Viewer

## Purpose

Define the contract for the unauthenticated public viewer page at `/[locale]/project/[id]`.

## Route

```
/[locale]/project/[projectId]
```

- `locale`: `"en"` | `"ar"` (determined by next-intl routing)
- `projectId`: UUID of a PUBLISHED project
- **Auth**: None — fully public, no session required (FR-012)
- **Rendering**: Server-rendered with dynamic client components per tab

## Data Fetching (Server Component)

The page is a Next.js server component that fetches project data server-side:

```typescript
GET /api/public/projects/[projectId]
```

**Response (200)**:
```json
{
  "project": {
    "id": "proj_xxx",
    "title": "Modern Villa in Dubai Marina",
    "description": "A stunning 5-bedroom villa...",
    "address": "Dubai Marina, Dubai",
    "price": 3500000,
    "featuredImageUrl": "https://cdn.example.com/...",
    "locale": { "en": { "title": "...", "description": "..." }, "ar": { "title": "..." } }
  },
  "tabs": {
    "tour": { "available": true, "count": 2 },
    "model3d": { "available": true, "count": 1 },
    "floorPlan": { "available": true, "count": 3 },
    "gallery": { "available": true, "count": 12 }
  }
}
```

**Response (404)**:
```json
{ "error": "not_found", "message": "Project not found or not published." }
```
Returned when: project doesn't exist, project status is DRAFT, or project has been deleted.

## Tab Behavior

Only tabs with `available: true` are rendered (FR-013). If no tabs are available, show a "No content available" state.

| Tab | Component | Data Source | Requires |
|-----|-----------|-------------|----------|
| 360° Tour | `PanoramaViewer` (PSV) | `GET /api/public/projects/[id]/tours` | At least one tour with scenes |
| 3D Model | `ModelViewer` (model-viewer) | `GET /api/public/projects/[id]/models` | At least one MODEL_3D media |
| Floor Plan | `ImageViewer` or PDF viewer | `GET /api/public/projects/[id]/floor-plans` | At least one FLOOR_PLAN media |
| Gallery | `ImageGallery` | `GET /api/public/projects/[id]/gallery` | At least one GALLERY_IMAGE media |

## Tour Data API

```
GET /api/public/projects/[projectId]/tours/[tourId]?locale=en
```

**Response (200)**:
```json
{
  "tour": {
    "id": "tour_xxx",
    "name": "Main Villa Tour",
    "scenes": [
      {
        "id": "scene_xxx",
        "panoramaUrl": "https://cdn.example.com/panos/scene1.jpg",
        "initialPitch": 0,
        "initialYaw": 180,
        "initialZoom": 100,
        "hotspots": [
          {
            "id": "hot_001",
            "yaw": 45.5,
            "pitch": -10.2,
            "label": "Kitchen" // locale-sensitive
          }
        ]
      }
    ]
  }
}
```

Hotspots use locale-sensitive labels. The `locale` query parameter determines which label variant to return (`labelEn` or `labelAr` from the stored hotspot data).

## Language Toggle

The language toggle (FR-014) reloads the same project page with the opposite locale:

- English → Arabic: `/[locale]/project/[id]` where locale changes from `en` to `ar`
- The server component re-fetches data with the new locale
- All static UI text switches via next-intl
- Hotspot labels, tour names, and project description switch to their locale-specific variants
- `dir` attribute on `<html>` switches between `ltr` and `rtl`

## Accessibility (WCAG 2.1 AA)

- Skip-to-content link at top of viewer
- Proper heading hierarchy (h1 for project title, h2 for tab labels)
- Tabs are keyboard navigable (Arrow keys to switch, Enter/Space to activate)
- Panorama viewer: `keyboard: 'always'`, hotspots are focusable with tab
- 3D viewer: `aria-label` on model-viewer, keyboard orbit controls
- Images have `alt` text (project title or media filename)
- Focus management preserved on language toggle
- Color contrast: minimum 4.5:1 for text, 3:1 for large text and UI controls
- Dynamic content uses `aria-live="polite"` for screen reader announcements
