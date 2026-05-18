# Research: Shadcn UI RTL Support Upgrade

**Phase**: Phase 0 — Outline & Research
**Date**: 2026-05-18
**Status**: Complete

## Summary

Research conducted on latest shadcn RTL support, Tailwind v4 logical property compatibility, and existing project structure. All unknowns resolved — no NEEDS CLARIFICATION markers remain.

## Findings

### 1. shadcn RTL CLI Migration

- **Decision**: Use `pnpm dlx shadcn@latest migrate rtl [path]` for automatic migration
- **Rationale**: The shadcn CLI now supports automatic transformation of physical CSS classes to logical equivalents. This is the official recommended approach per the documentation.
- **Alternatives considered**: Manual refactoring of each component — rejected due to high effort and error-prone nature
- **Details**: The migration command converts `left-*` → `start-*`, `right-*` → `end-*`, `ml-*` → `ms-*`, `mr-*` → `me-*`, `pl-*` → `ps-*`, `pr-*` → `pe-*`, `border-l-*` → `border-s-*`, `border-r-*` → `border-e-*`. Animation classes `slide-in-from-right` → `slide-in-from-end`, etc.

### 2. DirectionProvider Integration

- **Decision**: Use the shadcn `direction` component (`pnpm dlx shadcn@latest add direction`), then wrap the app with `DirectionProvider` from `@radix-ui/react-direction`
- **Rationale**: Official shadcn RTL guidance recommends this approach for Radix-based component positioning
- **Alternatives considered**: CSS-only RTL via `html[dir="rtl"]` selectors — rejected because Radix primitives need direction context for portal positioning

### 3. Locale-to-Direction Mapping

- **Decision**: Map `en` → `ltr`, `ar` → `rtl` in the Document component
- **Rationale**: Project already has two locales (`en`, `ar`) configured in `config/index.ts`. The `Document.tsx` component receives `locale` but does not currently set `dir` attribute.
- **Implementation**: Set `dir={locale === "ar" ? "rtl" : "ltr"}` on `<html>` tag in `Document.tsx`

### 4. components.json Configuration

- **Decision**: Add `"rtl": true` to `components.json`
- **Rationale**: This flag enables automatic RTL class transformation by the shadcn CLI for newly added components
- **Note**: The existing `components.json` references outdated paths (`tailwind.config.ts`, `styles/globals.css`) — these should be corrected to match the actual Tailwind v4 CSS-based setup

### 5. Tailwind v4 Logical Property Support

- **Decision**: Use logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `border-s-*`, `border-e-*`)
- **Rationale**: Tailwind CSS v4 has full support for logical properties. The project already uses Tailwind v4.1.4.
- **Note**: No config changes needed — Tailwind v4 supports these out of the box

### 6. Icons Directional Flip

- **Decision**: Add `rtl:rotate-180` class to directional icons (arrows, chevrons, carets)
- **Rationale**: Per shadcn RTL docs, icons need explicit `rtl:rotate-180` to flip in RTL mode
- **Note**: This may need to be applied in consuming components, not in the UI component library itself

### 7. Portal Component dir Prop

- **Decision**: Pass `dir` prop to portal-based components (Popover, Tooltip, Dialog, DropdownMenu)
- **Rationale**: Known issue with `tw-animate-css` where logical slide utilities don't work correctly. The `dir` prop ensures correct portal positioning.
- **Implementation**: `dir={locale === "ar" ? "rtl" : "ltr"}` on the portal content components

### 8. Existing RTL Handling Cleanup

- **Decision**: Fix AuthWrapper's broken RTL and remove hardcoded div-level dir attributes
- **Rationale**: AuthWrapper (`AuthWrapper.tsx`) has a non-functional `dir` attribute (locale not passed). OnboardingForm has a hardcoded `dir` check. Both should be cleaned up once DirectionProvider handles direction globally.
- **Details**: AuthWrapper line 16: `<div dir={'ar' === locale ? 'rtl' : 'ltr'}></div>` — locale is undefined at call site

## Manual Migration Candidates

Based on shadcn documentation, the following components may need manual attention after CLI migration:

| Component | Reason |
|-----------|--------|
| Calendar | Not auto-migrated by CLI — needs manual RTL handling |
| Pagination | Not auto-migrated by CLI — needs manual RTL handling |
| Sidebar | Not auto-migrated by CLI — needs manual RTL handling |

None of these three are currently in the project's component set (no `calendar.tsx`, `pagination.tsx`, or `sidebar.tsx` found). If added later, manual migration will be required.

## Font Recommendation

- **Decision**: Add Noto Sans Arabic font for RTL Arabic text
- **Rationale**: shadcn RTL docs recommend Noto fonts for RTL language support. Pairs well with the existing Geist font used for Latin text.
- **Implementation**: Import from `next/font/google` and apply in Document.tsx alongside GeistSans
