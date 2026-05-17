# Quickstart: Shadcn RTL Upgrade

**Branch**: `001-shadcn-rtl-upgrade` | **Date**: 2026-05-17

## Prerequisites

- Node.js 20+, pnpm installed
- Git branch `001-shadcn-rtl-upgrade` checked out

## Implementation Steps

### Step 1: Configure shadcn for RTL

Edit `apps/web/components.json` — add `"rtl": true`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "rtl": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@ui/components",
    "utils": "@ui/lib",
    "ui": "@ui/components"
  }
}
```

### Step 2: Install Radix Direction

```bash
pnpm --filter web add @radix-ui/react-direction
```

### Step 3: Create DirectionProvider component

Create `apps/web/modules/ui/components/direction.tsx` — re-export `DirectionProvider` from `@radix-ui/react-direction`:

```tsx
export { DirectionProvider } from "@radix-ui/react-direction"
```

### Step 4: Update Document.tsx

In `apps/web/modules/shared/components/Document.tsx`:
- Import `DirectionProvider` from `@ui/components/direction`
- Import `useLocale` from `next-intl`
- Add `dir` attribute to `<html>` tag
- Wrap children with `DirectionProvider`

Key logic:
```tsx
const locale = useLocale()
const direction = locale === "ar" ? "rtl" : "ltr"
```

### Step 5: Update directional CSS classes in shadcn components

Replace hardcoded directional classes with logical property equivalents in these files (see `research.md` for full audit):

| File | Changes |
|------|---------|
| `sheet.tsx` | `left-0`→`start-0`, `right-0`→`end-0`, `border-l`→`border-s`, `border-r`→`border-e`, `text-left`→`text-start`, `space-x`→`gap` |
| `dropdown-menu.tsx` | `pl-8`→`ps-8`, `pr-3`/`pr-8`→`pe-3`/`pe-8`, `left-2`→`start-2`, `right-2`→`end-2`, `ml-auto`→`ms-auto` |
| `dialog.tsx` | `left-[50%]`→`start-1/2`, `right-4`→`end-4`, `text-left`→`text-start`, `space-x-2`→`gap-2` |
| `alert-dialog.tsx` | `left-[50%]`→`start-1/2`, `text-left`→`text-start`, `space-x-2`→`gap-2` |
| `select.tsx` | `pr-8`→`pe-8`, `pl-2`→`ps-2`, `right-2`→`end-2` |
| `button.tsx` | `mr-1.5`→`me-1.5` |
| `alert.tsx` | `[&>svg]:left-4`→`[&>svg]:start-4`, `[&>svg~*]:pl-6`→`[&>svg~*]:ps-6` |
| `password-input.tsx` | `right-0`→`end-0`, `pr-10`→`pe-10`, `pr-4`→`pe-4` |
| `table.tsx` | `text-left`→`text-start`, `[&:has([role=checkbox])]:pr-0`→`[&:has([role=checkbox])]:pe-0` |
| `input-otp.tsx` | `border-r`→`border-e`, `first:rounded-l-md`→`first:rounded-s-md`, `first:border-l`→`first:border-s`, `last:rounded-r-md`→`last:rounded-e-md` |
| `tooltip.tsx` | No CSS changes needed (Radix handles side swapping via DirectionProvider) |

### Step 6: Update Toaster position

In `Document.tsx`, make the sonner Toaster position locale-aware:
```tsx
<Toaster position={direction === "rtl" ? "top-left" : "top-right"} />
```

### Step 7: Add Arabic font (optional, for full RTL experience)

In the locale-specific layout or Document.tsx:
```tsx
import { Noto_Sans_Arabic } from "next/font/google"

const fontArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
})
```

### Step 8: Verify

- Switch to Arabic locale — verify all components render correctly
- Switch back to English — verify no visual regressions
- Test dialog, sheet, dropdown-menu, select, tooltip positioning in both modes

## Verification

```bash
cd apps/web && pnpm dev
# Visit /en and /ar routes
# Manually test all shadcn components in each locale
```
