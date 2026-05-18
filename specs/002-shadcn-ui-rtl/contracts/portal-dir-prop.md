# Contract: Portal dir Prop

## Purpose

Pass the `dir` prop to portal-based components to ensure correct RTL positioning.

## Problem

The `tw-animate-css` library has a known issue where logical slide utilities may not work correctly in portal elements. Passing `dir` explicitly ensures correct positioning.

## Components Affected

Each of these components renders content via Radix portals:

| Component | File | Portal Element |
|-----------|------|----------------|
| Dialog | `dialog.tsx` | DialogContent |
| DropdownMenu | `dropdown-menu.tsx` | DropdownMenuContent |
| Popover | (not present currently) | PopoverContent |
| Select | `select.tsx` | SelectContent |
| Sheet | `sheet.tsx` | SheetContent |
| Tooltip | `tooltip.tsx` | TooltipContent |
| AlertDialog | `alert-dialog.tsx` | AlertDialogContent |

## Solution

The `dir` prop is automatically handled by the `DirectionProvider` wrapping the app. No per-component changes are needed for components wrapped in DirectionProvider.

However, for Safety, each portal component should explicitly pass `dir` to its content element where the prop surface allows it. The migration CLI handles this automatically for supported components.
