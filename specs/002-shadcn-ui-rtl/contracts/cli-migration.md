# Contract: CLI Migration

## Purpose

Automatically convert existing shadcn UI components from physical CSS classes to logical equivalents.

## Command

```bash
pnpm dlx shadcn@latest migrate rtl
```

## Scope

All files in `modules/ui/components/` (default behavior when no path is provided).

## Transformation Mapping

| Before | After |
|--------|-------|
| `left-*` | `start-*` |
| `right-*` | `end-*` |
| `ml-*` | `ms-*` |
| `mr-*` | `me-*` |
| `pl-*` | `ps-*` |
| `pr-*` | `pe-*` |
| `border-l-*` | `border-s-*` |
| `border-r-*` | `border-e-*` |
| `slide-in-from-left` | `slide-in-from-start` |
| `slide-in-from-right` | `slide-in-from-end` |
| `slide-out-to-left` | `slide-out-to-start` |
| `slide-out-to-right` | `slide-out-to-end` |

## Post-Migration Verification

1. Run `git diff` to inspect all transformed classes
2. Verify no physical directional classes remain in any component file
3. Test each component visually in both LTR and RTL modes
