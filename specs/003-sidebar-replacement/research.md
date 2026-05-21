# Research: Sidebar Navigation Replacement

## Unknowns Resolved

### 1. Menu Item Definition Pattern

**Decision**: Keep inline menu definition in the sidebar component, matching the existing NavBar pattern.

**Rationale**: The old NavBar defines menu items inline with org slug context and role checks. Extracting to a config file adds complexity without benefit for ~6 items. The `showWhen` condition pattern from the data model can be expressed inline (spread conditionally).

- Existing NavBar uses conditionals: `...(activeOrganization ? [{...}] : [])` for org items and `...((user as any)?.role === "admin" ? [{...}] : [])` for admin items
- Menu items reference `activeOrganization.slug` for href construction
- The new `AppSidebar` will follow the same pattern

**Reference**: `apps/web/modules/saas/shared/components/NavBar.tsx:34-80`

### 2. Layout Integration Strategy

**Decision**: Modify `AppWrapper` to render the shadcn sidebar layout instead of the old NavBar layout. Keep `AppWrapper` as the integration point used by route group layouts.

**Rationale**: `AppWrapper` is already used by two route group layouts:
- `apps/web/app/(saas)/app/(account)/layout.tsx` — wraps `<AppWrapper>{children}</AppWrapper>`
- `apps/web/app/(saas)/app/(organizations)/[organizationSlug]/layout.tsx` — wraps `<AppWrapper>{children}</AppWrapper>`

By modifying `AppWrapper`, both layouts automatically get the new sidebar with no layout file changes.

**New structure**:
- `AppWrapper` renders `<SidebarProvider><AppSidebar /><SidebarInset><main>{children}</main></SidebarInset></SidebarProvider>`
- The `SidebarProvider` is local to `AppWrapper` (not in the top app layout) since only two route groups use the sidebar
- `SidebarProvider` is a client component wrapping Radix UI's sidebar context

### 3. Sidebar Provider Placement

**Decision**: `SidebarProvider` is placed inside `AppWrapper` (client component), not in the server layout.

**Rationale**: The shadcn sidebar provider uses React context. Placing it inside `AppWrapper` keeps it colocated with the sidebar component. Both route groups that need the sidebar already use `AppWrapper`. The provider tree above `AppWrapper` (`SessionProvider > ActiveOrganizationProvider > ConfirmationAlertProvider`) provides all the data contexts the sidebar needs.

### 4. Without-Org-Slug Route Group

**Decision**: Update `(without-organization-slug)/layout.tsx` to use `AppWrapper` instead of `AuthWrapper`.

**Rationale**: Per spec edge cases, users without an organization should still see the sidebar with core navigation items (Dashboard, Settings). The current `AuthWrapper` provides no sidebar — it's designed for auth pages (login/signup). The `(without-organization-slug)` route is for pages like `/app/settings` accessed without an org, which should have the sidebar.

### 5. RTL Implementation Approach

**Decision**: Standard shadcn sidebar + Tailwind `rtl:` variants + Radix `dir` prop. No custom ui-rtl wrappers.

**Rationale**: The existing app already handles direction at the `<html>` level via `Document.tsx` which wraps everything in Radix's `DirectionProvider`. The shadcn sidebar accepts a `dir` prop. Tailwind's `rtl:` variants handle mirrored spacing. The SidebarRtl.tsx reference showed custom ui-rtl wrappers, but the clarified requirement is to use standard components with CSS-based RTL.

- Sidebar gets `side={dir === "ltr" ? "left" : "right"}` and `dir={dir}`
- Chevron icons get `rtl:rotate-180` classes
- `SidebarTrigger` icon (PanelLeft) gets `rtl:rotate-180`

### 6. Organization Selector Placement

**Decision**: Current org name displayed in SidebarHeader; org-switching dropdown in SidebarFooter account menu.

**Rationale**: The existing `OrganizationSelect` component already provides a dropdown with org listing, personal account, and create-org options. In the new sidebar:
- The **current org name** appears in `SidebarHeader` alongside the logo (reusing `OrganizationSelect` trigger-style display)
- The **org-switching dropdown** is placed in `SidebarFooter` within the account dropdown, alongside Account/Billing/Logout

This matches the clarified requirement from spec.md (Session 2026-05-21).

### 7. Loading / Empty / Error States

**Decision**: Graceful fallback — show core navigation items (Dashboard, Settings) immediately while org/user-specific sections appear after data loads. On error, omit conditional sections.

**Rationale**: The existing NavBar already follows this pattern implicitly — it renders all items, and conditional items simply don't appear if data is missing. No skeleton loaders needed since the core items are always visible. The TanStack Query data is prefetched at the server level in `(saas)/app/layout.tsx`, so client-side loading states are typically instantaneous.
