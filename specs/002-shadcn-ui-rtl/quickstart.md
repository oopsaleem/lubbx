# Quickstart: Shadcn UI RTL Support Upgrade

## Prerequisites

- Node.js 20+
- pnpm
- Access to the project repo on branch `002-shadcn-ui-rtl`

## Implementation Steps

### Step 1: Configure components.json

1. Open `apps/web/components.json`
2. Add `"rtl": true` at the top level
3. Remove the `tailwind.config` property (not needed for Tailwind v4)
4. Fix `"css": "styles/globals.css"` → `"css": "app/globals.css"`

### Step 2: Add Direction component

```bash
cd apps/web
pnpm dlx shadcn@latest add direction
```

This adds the DirectionProvider component from `@radix-ui/react-direction`.

### Step 3: Wrap app with DirectionProvider

Edit `apps/web/modules/shared/components/Document.tsx`:

1. Import `DirectionProvider` from `@radix-ui/react-direction`
2. Set `dir` attribute on `<html>` tag: `dir={locale === "ar" ? "rtl" : "ltr"}`
3. Wrap the content inside `Document` with `<DirectionProvider dir={...}>`

### Step 4: Run CLI migration on existing components

```bash
cd apps/web
pnpm dlx shadcn@latest migrate rtl
```

This converts all physical CSS classes in `modules/ui/components/` to logical equivalents.

### Step 5: Add RTL font

In `Document.tsx`, import Noto Sans Arabic:

```tsx
import { GeistSans } from "geist/font/sans"
import localFont from "next/font/local"

const notoSansArabic = localFont({
  src: "path-to-noto-sans-arabic.woff2",
  variable: "--font-noto-sans-arabic",
})
```

Apply the font variable conditionally based on locale.

### Step 6: Handle directional icons

Search the codebase for directional icons (ArrowRight, ChevronLeft, etc.) and add `rtl:rotate-180` class where they appear.

### Step 7: Fix AuthWrapper RTL

Update `modules/saas/shared/components/AuthWrapper.tsx` to use DirectionProvider instead of its hardcoded dir div.

### Step 8: Verify

- Test all pages in English LTR mode — no visual changes
- Switch to Arabic RTL mode — all components render correctly
- Test portal components (dialogs, dropdowns, tooltips) in RTL
- Test locale switching at runtime
