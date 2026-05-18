# Implementation Plan: Shadcn UI RTL Support Upgrade

**Branch**: `002-shadcn-ui-rtl` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-shadcn-ui-rtl/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Upgrade all 23 shadcn UI components to support RTL (Right-to-Left) for the Arabic locale using the latest shadcn CLI tooling. This involves enabling `rtl: true` in components.json, running the `shadcn migrate rtl` command on existing components to convert physical CSS classes to logical equivalents, adding the DirectionProvider at the root layout level, and ensuring zero regressions in English LTR mode.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router), React 19.1  
**Primary Dependencies**: shadcn/ui (custom components under `modules/ui/components/`), @radix-ui/react-* (v1.x), tailwindcss 4.1.4, next-intl 4.0.2, fumadocs-ui 15.2.8  
**Storage**: N/A (frontend-only upgrade)  
**Testing**: Manual visual verification across both locales (en/ar)  
**Target Platform**: Web browser (Next.js SSR + SPA with App Router)  
**Project Type**: Web application (SaaS monorepo with pnpm workspaces)  
**Performance Goals**: N/A — no backend or data processing changes  
**Constraints**: Must not introduce visual regressions in English LTR mode; all existing component behavior preserved; Fumadocs components are out of scope  
**Scale/Scope**: 23 shadcn UI components, 2 locales (en/ar), 1 RTL language (Arabic)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is in template state with no actual principles or gates defined. No violations to evaluate. Gate passes trivially.

## Project Structure

### Documentation (this feature)

```text
specs/002-shadcn-ui-rtl/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
apps/web/
├── app/
│   ├── layout.tsx                              # App root layout (metadata + globals.css)
│   ├── globals.css                             # CSS entry point
│   ├── (marketing)/[locale]/layout.tsx          # Marketing locale layout (wraps Document)
│   ├── (saas)/layout.tsx                       # SaaS locale layout (wraps Document)
│   ├── (saas)/auth/layout.tsx                  # Auth layout (SessionProvider + AuthWrapper)
│   └── (saas)/app/layout.tsx                   # App root layout (session, org, providers)
├── modules/
│   ├── ui/
│   │   └── components/                         # 23 shadcn UI components to be upgraded
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── password-input.tsx
│   │       ├── progress.tsx
│   │       ├── select.tsx
│   │       ├── sheet.tsx
│   │       ├── skeleton.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       └── tooltip.tsx
│   │   └── lib/
│   │       └── index.ts                        # cn() utility (clsx + tailwind-merge)
│   ├── shared/
│   │   └── components/
│   │       └── Document.tsx                    # Root HTML wrapper (dir attribute target)
│   ├── i18n/
│   │   ├── routing.ts                          # next-intl routing (locales: en, ar)
│   │   ├── request.ts                          # next-intl request config
│   │   └── lib/
│   │       ├── locale-cookie.ts                # Locale cookie utilities
│   │       └── update-locale.ts                # Locale update server action
│   └── saas/
│       └── shared/components/AuthWrapper.tsx   # Has hardcoded dir="rtl" (broken)
├── components.json                             # shadcn config (rtl flag target)
└── middleware.ts                               # next-intl + auth middleware
packages/i18n/
├── index.ts
├── types.ts
└── translations/
    ├── en.json
    └── ar.json
tooling/tailwind/
├── theme.css                                   # Tailwind v4 theme
└── tailwind-animate.css                        # Animation utilities
config/
├── index.ts                                    # i18n config (locales: en, ar)
└── types.ts
```

**Structure Decision**: This is a frontend-only upgrade scoped to `apps/web/modules/ui/components/` (component files), `apps/web/modules/shared/components/Document.tsx` (root HTML/dir attribute), and `apps/web/components.json` (shadcn config). No backend, database, or other monorepo packages are affected.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations to justify.

## Phase 0: Research

All technical context is already known from project exploration. No NEEDS CLARIFICATION markers exist. The approach is well-documented:
- Latest shadcn RTL support via `components.json` `rtl: true` flag
- Automatic CLI transformation of physical CSS to logical properties
- DirectionProvider for Radix context
- Manual migration needed for Calendar, Pagination, Sidebar (if present)
- `rtl:rotate-180` for directional icons
- `dir` prop passed to portal elements (Popover, Tooltip)

No further research needed.

## Phase 1: Design & Contracts

Design artifacts to be created:
- `data-model.md` — Locale/direction mapping and component state
- `contracts/` — Interface contracts for DirectionProvider integration points
- `quickstart.md` — Implementation quick-start guide
- Update AGENTS.md to reference this plan

## Re-evaluation: Constitution Check (Post-Design)

No changes to constitution assessment. Gate passes.
