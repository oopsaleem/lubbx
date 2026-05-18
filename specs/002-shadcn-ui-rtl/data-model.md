# Data Model: Shadcn UI RTL Support Upgrade

**Phase**: Phase 1 — Design & Contracts
**Date**: 2026-05-18

## Entities

### Locale Direction Mapping

Represents the mapping between locale identifiers and their corresponding text direction.

| Field | Type | Description |
|-------|------|-------------|
| `locale` | string | IETF BCP 47 language tag (e.g., `"en"`, `"ar"`) |
| `direction` | `"ltr"` \| `"rtl"` | Text direction for the locale |

**Values**:
- `en` → `ltr`
- `ar` → `rtl`

**Source**: Defined in `config/index.ts` (`config.i18n.locales`)

### Direction Context

The runtime state that propagates text direction to all Radix-based shadcn components.

| Field | Type | Description |
|-------|------|-------------|
| `direction` | `"ltr"` \| `"rtl"` | Current text direction from active locale |
| `source` | `"DirectionProvider"` | Provided by `@radix-ui/react-direction` wrapping the app |

**Lifecycle**:
- Initialized at app boot from the detected locale
- Updated when locale changes (via cookie or URL prefix)
- Does NOT require page reload for update

### Component Migration State

The set of all shadcn UI components and their RTL migration status.

| Field | Type | Description |
|-------|------|-------------|
| `componentName` | string | Name of the shadcn UI component file |
| `filePath` | string | Path relative to `apps/web/modules/ui/components/` |
| `migrationStatus` | `"pending"` \| `"migrated"` \| `"manual"` | Whether CLI migration was applied or needs manual handling |
| `isRadixBased` | boolean | Whether component uses Radix primitives requiring DirectionProvider |
| `hasDirectionalCSS` | boolean | Whether component contains physical CSS classes needing conversion |

**All 23 components**: accordion, alert, alert-dialog, avatar, badge, button, card, dialog, dropdown-menu, form, input, input-otp, label, password-input, progress, select, sheet, skeleton, table, tabs, textarea, toast, tooltip

### `dir` Attribute State

The `dir` attribute on the root `<html>` element.

| Attribute | Value | When |
|-----------|-------|------|
| `dir` | `"ltr"` | Locale is `en` |
| `dir` | `"rtl"` | Locale is `ar` |

**Location**: Set on `<html>` tag in `Document.tsx`

### Icon Flip Configuration

Directional icons that need RTL rotation.

| Entity | Property | Description |
|--------|----------|-------------|
| Directional Icons | `rtl:rotate-180` | Tailwind utility applied to icons like ArrowRight, ChevronLeft, ChevronRight, etc. |

## State Transitions

### Locale Change Flow

```
User selects Arabic locale
  → updateLocale(locale="ar") server action
  → NEXT_LOCALE cookie set to "ar"
  → Document.tsx re-renders with locale="ar"
  → dir attribute changes from "ltr" to "rtl"
  → DirectionProvider propagates direction="rtl"
  → All Radix components re-position
  → Icons with rtl:rotate-180 flip
```

### Component Migration Flow

```
components.json updated with "rtl": true
  → Run `pnpm dlx shadcn@latest migrate rtl`
  → Physical CSS classes converted to logical equivalents
  → Animation classes converted to logical equivalents
  → Verify no LTR regressions
  → Mark component as "migrated"
```

## Validation Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| Locale Must Be Supported | Only `en` and `ar` are valid locales | Config validation |
| Direction Must Be Consistent | `dir` attribute must match locale mapping | Visual verification |
| Zero LTR Regression | All components must render identically in LTR mode | Visual comparison |
