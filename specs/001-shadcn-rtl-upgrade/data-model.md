# Data Model: Shadcn RTL Upgrade

**Branch**: `001-shadcn-rtl-upgrade` | **Date**: 2026-05-17 | **Plan**: [plan.md](plan.md)

## Overview

This feature is a frontend-only UI upgrade. There are no new data entities, persistence, or API changes. The only "data" involved is the locale-to-direction mapping used by the DirectionProvider.

## Entities

### LocaleDirection

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| locale | string | `"en"`, `"ar"` | Application locale code |
| direction | string | `"ltr"`, `"rtl"` | Text direction for the locale |

**Mapping**:
- `en` (English) → `ltr`
- `ar` (Arabic) → `rtl`

**Derived from**: `config/index.ts` → `i18n.locales` keys
**Used by**: `Document.tsx` → `DirectionProvider` → shadcn/Radix components

## State Transitions

- **Locale change**: When user switches from `en` to `ar`, direction transitions from `ltr` to `rtl`. DirectionProvider re-renders child components, Radix re-positions menus/popovers accordingly.
- **Initial load**: Direction is derived from the current locale (from next-intl) during server-side rendering and client hydration.

## Design Decisions

- No database storage needed — direction is derived entirely from locale
- No API contracts — direction is a client-side concern only
- Existing locale detection (next-intl middleware + routing) handles direction determination
