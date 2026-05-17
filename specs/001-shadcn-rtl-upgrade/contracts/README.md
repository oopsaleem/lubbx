# Contracts: Shadcn RTL Upgrade

**Branch**: `001-shadcn-rtl-upgrade` | **Date**: 2026-05-17

## Scope

This is a frontend-only UI upgrade. No external interfaces (API endpoints, database schemas, service contracts) are being added or modified.

## Component Interfaces

The 23 shadcn UI components' public interfaces (props) remain unchanged. The RTL upgrade is internal:

- Props and types: **unchanged**
- Export paths: **unchanged**
- Layout/behavior: **updated** to respond to document direction

### Components with Radix `data-[side]` behavior

These components use Radix's internal `DirectionProvider` to automatically swap `left`/`right` side positioning in RTL mode. No prop changes needed:

| Component | Radix Primitive | RTL Behavior |
|-----------|----------------|--------------|
| `DropdownMenu` | `@radix-ui/react-dropdown-menu` | Side auto-swaps via DirectionProvider |
| `Select` | `@radix-ui/react-select` | Side auto-swaps via DirectionProvider |
| `Tooltip` | `@radix-ui/react-tooltip` | Side auto-swaps via DirectionProvider |
| `Dialog` | `@radix-ui/react-dialog` | Positioning via CSS (manual update) |
| `AlertDialog` | `@radix-ui/react-alert-dialog` | Positioning via CSS (manual update) |
| `Sheet` | Custom (based on Dialog) | Side variants via CSS (manual update) |

## No Contract Changes

This feature does NOT modify:
- API request/response shapes
- Database schemas
- Service-to-service interfaces
- Authentication/authorization contracts
- Webhook payloads
- File formats

The only behavioral contract change is that all shadcn components now accept and respond to the document's text direction, which is determined by the application locale.
