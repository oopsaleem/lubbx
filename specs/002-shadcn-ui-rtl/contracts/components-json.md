# Contract: components.json Configuration

## Purpose

Define the shadcn configuration that controls CLI behavior and RTL support.

## Current State

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
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

## Changes Required

1. **Add** `"rtl": true` — enables automatic RTL class transformation
2. **Remove** `tailwind.config` — project uses Tailwind v4 (CSS-based, no config file)
3. **Fix** `css` path — should point to `"app/globals.css"` instead of `"styles/globals.css"`
