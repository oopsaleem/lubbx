# Quickstart: Sidebar Navigation

## Prerequisites

- Node.js + pnpm installed
- Project initialized (`pnpm install` completed)
- On branch `003-sidebar-replacement`

## Step 1: Install shadcn sidebar component

```sh
pnpm dlx shadcn@latest add sidebar
```

This creates `apps/web/modules/ui/components/sidebar.tsx` with all the sidebar primitives.

## Step 2: Add sidebar CSS variables

Add the sidebar theme variables to `apps/web/app/globals.css`:

```css
@layer base {
  :root {
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 0 0% 98%;
    --sidebar-primary-foreground: 240 5.9% 10%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}
```

## Step 3: Create AppSidebar component

Create `apps/web/modules/saas/shared/components/AppSidebar.tsx`:

- Import sidebar primitives from `@ui/components/sidebar`
- Import Logo, UserMenu, OrganizationSelect from existing paths
- Define menu items as a constant or hook (extracted from old NavBar)
- Render using the shadcn sidebar composition (SidebarHeader → SidebarContent with SidebarGroups → SidebarFooter)
- Pass `dir` prop based on locale for RTL support

## Step 4: Integrate SidebarProvider into layout

In `apps/web/app/(saas)/app/layout.tsx`:
- Wrap the return tree with `<SidebarProvider>` and `<SidebarInset>` using the shadcn sidebar pattern
- Render `<AppSidebar>` inside the provider

## Step 5: Update AppWrapper

In `apps/web/modules/saas/shared/components/AppWrapper.tsx`:
- Remove the `<NavBar />` invocation
- Remove the `md:ml-[280px]` style (sidebar handles its own margin via SidebarInset)

## Step 6: Clean up

- Delete `apps/web/modules/saas/shared/components/NavBar.tsx`
- Remove `useSidebarLayout` from config definition
- Update any imports referencing NavBar

## Verification

1. `pnpm dev` — app starts without errors
2. Navigate to any authenticated page — sidebar appears on the left (LTR) or right (RTL)
3. Click menu items — correct pages load, active state highlights properly
4. Click collapse trigger — sidebar transitions to icon-only mode
5. Press Cmd+B — sidebar toggles
6. Switch to Arabic locale — sidebar mirrors to the right side
7. Resize to mobile — sidebar becomes an overlay drawer
8. Verify admin users see Admin menu, regular users do not
