# Contract: AppSidebar Component

## Location

`apps/web/modules/saas/shared/components/AppSidebar.tsx`

## Purpose

Replaces `NavBar.tsx` as the primary navigation component for authenticated app pages. Renders a shadcn sidebar with sticky header (branding), scrollable content (menu groups), and sticky footer (user menu).

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `organizationId` | string | No | — | When on an org-specific page, passed for org-scoped menu links |

## Composition Structure

```
SidebarProvider (wraps layout in app/layout.tsx)
└── AppSidebar
    ├── SidebarHeader
    │   ├── Logo (Link to /app)
    │   └── OrganizationSelect (conditional)
    ├── SidebarContent
    │   ├── SidebarGroup: "Platform"
    │   │   ├── SidebarMenuItem: Dashboard
    │   │   ├── SidebarMenuItem: AI Demo
    │   │   └── SidebarMenuItem: AI Chatbot
    │   ├── SidebarGroup: "Organization" (conditional)
    │   │   └── SidebarMenuItem: Organization Settings
    │   └── SidebarGroup: "Account"
    │       ├── SidebarMenuItem: Account Settings
    │       └── SidebarMenuItem: Admin (conditional)
    ├── SidebarFooter
    │   └── UserMenu (with showUserName)
    └── SidebarRail (resize handle)
```

## Consumed Sub-Components

| Component | Path | Usage |
|-----------|------|-------|
| Logo | `@shared/components/Logo` | Branding in SidebarHeader |
| UserMenu | `@saas/shared/components/UserMenu` | User avatar + actions in SidebarFooter |
| OrganizationSelect | `@saas/organizations/components/OrganizationSelect` | Org switcher in SidebarHeader (conditional) |

## SidebarProvider Integration

The `SidebarProvider` must wrap the authenticated app layout tree. It is placed in the root app layout (`apps/web/app/(saas)/layout.tsx` or `apps/web/app/(saas)/app/layout.tsx`).

```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

## RTL Contract

The `dir` prop on `<Sidebar>` must match the current locale direction:
- `dir="ltr"` for English and other LTR locales
- `dir="rtl"` for Arabic

Passed from the existing `locale` → `direction` mapping in the layout.

## Removal Contract

The following files/patterns are removed:
- `apps/web/modules/saas/shared/components/NavBar.tsx` — entire file deleted
- `config.ui.saas.useSidebarLayout` — key removed from config
- `AppWrapper.tsx` — remove `md:ml-[280px]` and NavBar usage; replace with sidebar layout
