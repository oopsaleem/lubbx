# Quickstart: Sidebar Navigation Replacement

## Prerequisites

- Node.js 20+, pnpm
- Feature branch `003-sidebar-replacement` checked out
- shadcn sidebar not yet installed

## Setup

```bash
# 1. Install the shadcn sidebar component
pnpm dlx shadcn@latest add sidebar

# 2. Verify sidebar CSS variables were added to globals.css
```

## Implementation Steps

### Step 1: Install shadcn sidebar + Add CSS variables

Run the CLI command above. This creates `apps/web/modules/ui/components/sidebar.tsx` and updates `apps/web/app/globals.css` with sidebar theme variables.

### Step 2: Create AppSidebar component

Create `apps/web/modules/saas/shared/components/AppSidebar.tsx`:

```tsx
"use client";

// Import shadcn sidebar components from the installed CLI output
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@ui/components/sidebar";

// Use same menu item structure from old NavBar
// Reference: apps/web/modules/saas/shared/components/NavBar.tsx
```

Key implementation details:
- Use `useSession()` from `@saas/auth/hooks/use-session` for user data
- Use `useActiveOrganization()` from `@saas/organizations/hooks/use-active-organization` for org context
- Use `usePathname()` from `next/navigation` for active state
- Use `useTranslations()` from `next-intl` for i18n labels
- Import `OrganizationSelect` from `@saas/organizations/components/OrganizationSelect` for org switching
- Import `UserMenu` from `@saas/shared/components/UserMenu` for user menu
- Import `Logo` from `@shared/components/Logo` for branding
- Import icons from `lucide-react` (same set as NavBar)

### Step 3: Modify AppWrapper

Replace the old NavBar layout in `apps/web/modules/saas/shared/components/AppWrapper.tsx` with:

```tsx
"use client";

import { AppSidebar } from "@saas/shared/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@ui/components/sidebar";
import type { PropsWithChildren } from "react";

export function AppWrapper({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### Step 4: Update without-org-slug layout

Update `apps/web/app/(saas)/app/(organizations)/(without-organization-slug)/layout.tsx` to use `AppWrapper` instead of `AuthWrapper`:

```tsx
import { AppWrapper } from "@saas/shared/components/AppWrapper";
import type { PropsWithChildren } from "react";

export default function WithoutOrganizationSlugLayout({
  children,
}: PropsWithChildren) {
  return <AppWrapper>{children}</AppWrapper>;
}
```

### Step 5: Remove old NavBar + config

1. Delete `apps/web/modules/saas/shared/components/NavBar.tsx`
2. Remove `useSidebarLayout` from `config/types.ts`
3. Remove `useSidebarLayout` from `config/index.ts` defaults
4. Clean up any remaining `md:ml-[280px]` references

## Verification

### User Story 1 — Navigation

1. Start dev server: `pnpm dev`
2. Log in as a regular user
3. Verify sidebar renders with: Dashboard, AI Demo, AI Chatbot, Account Settings
4. Click each item — correct page loads, active state highlights
5. Log in as admin — verify Admin link appears
6. Navigate to an org route — verify Organization Settings appears

### User Story 2 — Collapse/Expand

1. Click sidebar collapse trigger — sidebar transitions to icon-only
2. Click expand trigger — returns to full width
3. Navigate between pages — collapsed state preserved
4. Press Cmd+B (Mac) / Ctrl+B (Windows) — sidebar toggles

### User Story 3 — Mobile Overlay

1. Resize browser to <768px viewport width
2. Click menu trigger — sidebar appears as overlay
3. Tap outside — overlay closes

### User Story 4 — RTL

1. Switch locale to Arabic
2. Verify sidebar appears on the right side
3. Verify icons and chevrons are mirrored (rtl:rotate-180 classes)
4. Collapse/expand works correctly in RTL

### Cleanup Verification

1. `useSidebarLayout` no longer exists in config types or defaults
2. `NavBar.tsx` file deleted
3. No `md:ml-[280px]` classes remain in the app
4. `pnpm build` passes with no broken imports

## Files to Modify

| File | Action |
|------|--------|
| `apps/web/modules/ui/components/sidebar.tsx` | Create (via CLI) |
| `apps/web/app/globals.css` | Modify (via CLI + review) |
| `apps/web/modules/saas/shared/components/AppSidebar.tsx` | Create |
| `apps/web/modules/saas/shared/components/AppWrapper.tsx` | Modify |
| `apps/web/app/(saas)/app/(organizations)/(without-organization-slug)/layout.tsx` | Modify |
| `apps/web/modules/saas/shared/components/NavBar.tsx` | Delete |
| `config/types.ts` | Modify |
| `config/index.ts` | Modify |
