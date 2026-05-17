# Implementation Plan: Shadcn RTL Upgrade

**Branch**: `001-shadcn-rtl-upgrade` | **Date**: 2026-05-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-shadcn-rtl-upgrade/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Upgrade shadcn UI components to support RTL (Right-to-Left) for Arabic locale. This involves configuring shadcn for RTL mode, adding Radix DirectionProvider, updating directional CSS classes to logical properties, and ensuring 23 existing shadcn components render correctly in both LTR and RTL modes without regressions.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router), React 19  
**Primary Dependencies**: shadcn/ui (custom components under `modules/ui/`), @radix-ui/react-\*, tailwindcss v4, next-intl, lucide-react  
**Storage**: N/A (frontend-only upgrade)  
**Testing**: Manual visual verification across locales  
**Target Platform**: Web browser (Next.js SSR + SPA)  
**Project Type**: Web application (SaaS monorepo)  
**Performance Goals**: N/A — no backend or data processing changes  
**Constraints**: Must not introduce visual regressions in English LTR mode; all existing component behavior preserved  
**Scale/Scope**: 23 shadcn UI components, 2 locales (en/ar), 1 RTL language (Arabic)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is in template state with no actual principles or gates defined. No violations to evaluate. Gate passes trivially.

## Project Structure

### Documentation (this feature)

```text
specs/001-shadcn-rtl-upgrade/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
saas/
├── apps/web/
│   ├── app/                           # Next.js App Router (layouts, pages)
│   │   ├── layout.tsx                 # Root layout
│   │   ├── (marketing)/[locale]/layout.tsx
│   │   ├── (saas)/auth/layout.tsx
│   │   ├── (saas)/app/layout.tsx
│   │   └── (saas)/app/(account)/layout.tsx
│   ├── modules/
│   │   ├── ui/components/             # 23 shadcn components to be upgraded
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── label.tsx
│   │   │   ├── password-input.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── toast.tsx
│   │   ├── ui/lib/index.ts            # cn() utility
│   │   ├── shared/components/         # Shared app components
│   │   │   └── Document.tsx           # Root HTML wrapper (dir attr target)
│   │   ├── i18n/                      # next-intl config
│   │   └── saas/                      # SaaS-specific modules
│   └── components.json                # shadcn config (rtl flag target)
└── tooling/tailwind/                  # Shared Tailwind v4 theme
```

**Structure Decision**: Web application monorepo (single app in `apps/web/`). Changes are scoped to `apps/web/modules/ui/components/` for component files, `apps/web/modules/shared/components/Document.tsx` for root HTML, and `apps/web/components.json` for shadcn config.

## Complexity Tracking

No constitution violations to justify.
