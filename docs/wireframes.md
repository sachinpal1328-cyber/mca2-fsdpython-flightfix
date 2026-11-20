# FlightFix — UI/UX Wireframes & Navigation Design

## 1. Visual Design System
- **Primary Brand:** Dark Navy (`#0b192c`) sidebar & login backdrop
- **Accents:** Aviation Blue (`#1d4ed8`) primary actions, Emerald Green (`#10b981`) operational/active indicators
- **Surfaces:** Light Slate (`#f1f5f9`) canvas, Crisp White (`#ffffff`) cards with `1px solid #e2e8f0` borders
- **Responsive Breakpoints:** Desktop persistent sidebar (`>= 992px`), collapsible off-canvas drawer (`< 992px`), mobile-first card stack on `/technician-mobile`.

## 2. Application Shell Layout
```text
+-------------------------------------------------------------------+
| [Sidebar #0b192c]   | [Topbar: Breadcrumb | Bell Notifs | Logout] |
| - FlightFix Logo    |---------------------------------------------|
| - Dashboard         |                                             |
| - Maint. Planning   |   [KPI Row: 4 Cards]                        |
| - Work Orders       |   [Charts / Breakdowns Row: 2 Cards]        |
| - Aircraft & Equip  |   [Highlights Tables Row: 2 Cards]          |
| - Inventory         |                                             |
| - Execution         |                                             |
| - Compliance        |                                             |
| - Supply Chain      |                                             |
| - Tech Mobile View  |                                             |
| - Analytics         |                                             |
| - User Management   |                                             |
| - Settings          |                                             |
+-------------------------------------------------------------------+
```

## 3. Mobile Technician Screen (`/technician-mobile`)
```text
+----------------------------------+
| FIELD TECHNICIAN MOBILE          |
| Arjun Nair  [3 WOs]              |
+----------------------------------+
| WO-2026-0001  [VT-IND] [CRITICAL]|
| Replace Hydraulic Pump A         |
| [x] Lock-out / tag-out           |
| [ ] Component removal            |
| [Field Note Input...]            |
| [Optional Part v] [Log Work]     |
| [   Complete Work Order   ]      |
+----------------------------------+
```
