# Contract: DirectionProvider Integration

## Purpose

Provide a single source of truth for text direction (`ltr`/`rtl`) to all Radix-based shadcn UI components in the application.

## Contract

### Input

- **`locale`**: A string (`"en"` | `"ar"`) representing the active locale
- **Source**: Provided by next-intl's `useLocale()` hook or server-side `getLocale()`

### Processing

1. Map locale to direction:
   - `"en"` → `"ltr"`
   - `"ar"` → `"rtl"`
2. Set `dir` attribute on `<html>` element in `Document.tsx`
3. Wrap app in `DirectionProvider` from `@radix-ui/react-direction` with the resolved direction

### Output

| Artifact | Description | Location |
|----------|-------------|----------|
| `dir` attribute | Set on `<html>` tag | `modules/shared/components/Document.tsx` |
| `DirectionProvider` | Wraps app content inside Document | `modules/shared/components/Document.tsx` |
| Rendered components | All Radix components auto-detect direction | Every shadcn UI component |
