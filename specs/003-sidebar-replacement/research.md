# Phase 0: Research & Unknowns Resolution

## Unknowns from Technical Context

No NEEDS CLARIFICATION markers remained from the specification. All technical decisions can be derived from the existing project context.

## Technology Decisions

### Decision: Sidebar Component Library

**Decision**: shadcn/ui Sidebar (Radix UI variant)
**Rationale**: The project already uses shadcn/ui for all UI components (23 components installed). The shadcn sidebar provides the required features out-of-the-box: collapsible (icon/offcanvas/none), mobile Sheet overlay, RTL support via `dir` prop, keyboard shortcut, sticky header/footer sections, menu sub-items, badges, and skeleton loading states.
**Alternatives considered**: Custom implementation (higher maintenance), other Radix-based sidebars (shadcn's is the most mature with RTL support)

### Decision: Sidebar State Persistence

**Decision**: Jotai atom (same pattern as existing `sidebarExpanded` atom)
**Rationale**: The project already uses Jotai for client-side state. The sidebar's open/closed state across navigation is naturally handled by Jotai's atomic state. TanStack Query is for server state only and not appropriate here.
**Alternatives considered**: React context (already used for sidebar in shadcn's `SidebarProvider` — uses internal context), localStorage (adds sync complexity)

### Decision: Menu Item Configuration

**Decision**: Extract menu items from inlined NavBar array into a shared config/hook
**Rationale**: The current NavBar defines menu items inline as an array with conditional visibility. For the sidebar, these should be extracted into a dedicated hook or constant that both the sidebar and any future navigation components can consume.
**Alternatives considered**: Keep inline in AppSidebar component (works for now but harder to maintain)

### Decision: RTL Implementation

**Decision**: Use shadcn sidebar's built-in `dir` prop + existing DirectionProviderWrapper
**Rationale**: The shadcn sidebar natively supports RTL via the `dir` prop, which flips positioning, animations, and trigger icon direction. The project already has `DirectionProviderWrapper` for Radix direction context. Passing the locale-based direction is consistent with the existing pattern in `Document.tsx`.
**Alternatives considered**: Manual CSS flipping (fragile, duplicates shadcn's built-in support)

### Decision: Old NavBar Removal

**Decision**: Remove NavBar.tsx, AppWrapper.tsx adaptations, remove `useSidebarLayout` config
**Rationale**: Confirmed in clarifications — the old NavBar and its config toggle are removed entirely. The sidebar becomes the sole navigation for authenticated pages.
**Alternatives considered**: Keeping both (rejected — maintenance burden, contradictory to spec)
