# Research: Shadcn RTL Upgrade

**Branch**: `001-shadcn-rtl-upgrade` | **Date**: 2026-05-17 | **Plan**: [plan.md](plan.md)

## Overview

Research findings for upgrading 23 shadcn UI components to support RTL (Right-to-Left) in a Next.js 15 SaaS project with Arabic locale support.

## Research Topics

### 1. Shadcn RTL Configuration

**Decision**: Add `rtl: true` to `components.json`

**Rationale**: The shadcn CLI reads the `rtl` flag from `components.json` to generate RTL-aware Tailwind classes when adding new components. This ensures all future components automatically support RTL without manual intervention.

**Source**: https://ui.shadcn.com/docs/rtl/next

**Details**:
- Add `"rtl": true` to `apps/web/components.json`
- Current file: line 18 already ends the JSON; insert before the closing brace

### 2. DirectionProvider Implementation

**Decision**: Install `@radix-ui/react-direction` and create a `DirectionProvider` wrapper

**Rationale**: Radix UI components (dialog, dropdown-menu, sheet, select, tooltip, alert-dialog) use `DirectionProvider` context to determine positioning (which side menus/dialogs open from, animation directions). Without it, these components ignore the document `dir` attribute.

**Source**: https://ui.shadcn.com/docs/rtl/next

**Implementation**:
1. Install `@radix-ui/react-direction` (currently only a transitive dep in lockfile)
2. Create `apps/web/modules/ui/components/direction.tsx` — re-export from `@radix-ui/react-direction`
3. In `apps/web/modules/shared/components/Document.tsx`:
   - Derive direction from locale: `locale === "ar" ? "rtl" : "ltr"`
   - Add `dir` attribute to `<html>` tag
   - Wrap `{children}` with `<DirectionProvider direction={direction}>`

### 3. CSS Directional Class Audit

**Decision**: Replace hardcoded directional CSS classes with logical property equivalents

**Rationale**: Tailwind v4 supports logical properties (`start`/`end`, `ms`/`me`, `ps`/`pe`, `border-s`/`border-e`) that automatically flip based on the `dir` attribute. Using these eliminates the need for manual per-component RTL overrides.

**Summary of changes needed**:

| Replacement Pattern | Current Classes | New Classes | Files Affected |
|---|---|---|---|
| Positioning | `left-*` / `right-*` | `start-*` / `end-*` | sheet, dialog, alert-dialog, dropdown-menu, select, password-input |
| Padding | `pl-*` / `pr-*` | `ps-*` / `pe-*` | dropdown-menu, select, alert, table, password-input |
| Margin | `ml-*` / `mr-*` | `ms-*` / `me-*` | dropdown-menu, button |
| Border | `border-l` / `border-r` | `border-s` / `border-e` | sheet, input-otp |
| Radius | `rounded-l-*` / `rounded-r-*` | `rounded-s-*` / `rounded-e-*` | input-otp |
| Text align | `text-left` / `text-right` | `text-start` / `text-end` | sheet, dialog, alert-dialog, table |
| Transform | `translate-x-*` | N/A (centering) | dialog, alert-dialog — update to use `start-1/2` + `-translate-x-1/2` or equivalent |
| Flex | `space-x-*` | `space-x-*` → `gap-*` or use `flex-row` directionally | dialog, alert-dialog, sheet |

### 4. Animation / Side-Specific Classes

**Decision**: Update slide animations to use RTL-aware direction

**Rationale**: Components like Sheet and Dialog use `slide-in-from-left` / `slide-out-to-left` animations. These need to be mirrored in RTL mode.

**Components affected**: sheet.tsx (left/right variants), dialog.tsx, alert-dialog.tsx

**Approach options**:
- **Option A (Recommended)**: Use `data-[side]` attributes with RTL-aware animation classes. For Sheet with `side="left"`/`side="right"`, add RTL overrides that swap left ⇄ right when `[dir="rtl"]` is present.
- **Option B**: Use CSS `[dir="rtl"]` selectors to flip animations via Tailwind's `max-[*]` or custom CSS.

### 5. Radix `data-[side]` Animations

**Decision**: Keep `data-[side=left]` / `data-[side=right]` as-is for Radix components

**Rationale**: Radix automatically swaps `left`/`right` sides based on DirectionProvider context. When DirectionProvider is set to `rtl`, a `side="left"` prop actually renders on the right side. Therefore:
- The `data-[side=left]` CSS selector correctly targets the visual right-side position in RTL mode
- The slide animation classes (`slide-in-from-right-2` when `data-[side=left]`) correctly animate from the visual right side

**Components affected**: dropdown-menu.tsx, select.tsx, tooltip.tsx

### 6. Toaster Position

**Decision**: Make sonner Toaster position locale-aware

**Rationale**: The `Toaster` in `Document.tsx` has `position="top-right"`. In RTL mode, notifications should appear on the left side.

### 7. Arabic Font Selection

**Decision**: Use `Noto_Sans_Arabic` font for Arabic locale

**Rationale**: The Noto font family provides comprehensive Arabic (and RTL language) support and pairs well with the existing Inter font used for Latin text. From shadcn RTL docs: https://ui.shadcn.com/docs/rtl/next

**Implementation**:
- Import `Noto_Sans_Arabic` from `next/font/google` when Arabic locale is detected
- Apply as a CSS variable to the `<html>` tag
- Use `--font-sans` variable in the existing Tailwind v4 theme to switch fonts

## Alternatives Considered

### CSS-Only Approach vs. DirectionProvider
- **Rejected**: Using CSS `[dir="rtl"]` selectors exclusively without DirectionProvider
- **Reason**: Radix components read direction from React context, not DOM attributes. Without DirectionProvider, Radix positioning (dropdown menus, tooltips, select dropdowns) would not respond to RTL. DirectionProvider is mandatory per shadcn docs.

### Per-Component RTL Classes vs. Logical Properties
- **Rejected**: Adding `rtl:` prefixed Tailwind classes to each component
- **Reason**: Logical properties (`start`/`end`, `ms`/`me`) are cleaner, automatically handle both directions, and are the recommended approach in Tailwind v4. This eliminates hundreds of `rtl:` override classes.

### Manual direction.tsx vs. Re-export
- **Decision**: Simple re-export of `@radix-ui/react-direction`'s `DirectionProvider`
- **Rationale**: No custom logic needed; the radix provider handles all direction context propagation.

## Conclusion

All research topics resolved. No NEEDS CLARIFICATION markers remain. The upgrade path is well-understood:

1. Configure → 2. Install deps → 3. Wrap with DirectionProvider → 4. Update CSS classes → 5. Verify both locales
