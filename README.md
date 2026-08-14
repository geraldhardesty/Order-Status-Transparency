# Order Status Transparency

A dashboard for tracking orders end-to-end, from PO entry to shipment. It gives Sales,
Customer Service, and Order Management a single, filterable view of order status pulled
from SAP and — until an order exists in SAP — from a manually maintained Excel sheet, with
one-click actions (Expedite, Release Credit Hold, add a note) that log to an auditable
history per order.

## Columns shown

Sales Order Number, Linkage Number, Customer Name, Customer ID, Rep, MS Code, Status,
Original Promised Shipping Date, Planned Shipping Date, Credit Hold (Yes/No), plus a
computed schedule variance (days slipped vs. the original promise) and the record's source
(SAP or Excel).

## Getting started

```bash
npm install
npm run dev      # local dev server with hot reload
npm run build    # type-check + production build to dist/
npm run lint     # oxlint
```

The app ships with realistic sample data (`src/data/mockOrders.ts`) so the UI, filters,
and actions are demoable with no backend connected.

## Architecture

- **React + TypeScript + Vite**, no UI framework — plain CSS with design tokens
  (`src/styles/tokens.css`) so branding is a one-file change.
- **State**: `src/hooks/useOrders.ts` holds the order list in a reducer. All mutations
  (import, expedite, release hold, add note) go through this one hook.
- **Data model**: `src/types/order.ts`.

### SAP integration point

There is no live SAP connection in this build. `mockOrders.ts` stands in for what a real
SAP pull would return (VBAK/VBAP sales order header/line data plus credit management
status). To wire up a real feed:

1. Replace the `mockOrders` import in `useOrders.ts` with a fetch against your SAP
   OData service / middleware (e.g. an integration layer exposing sales orders as JSON),
   mapped into the `Order` shape.
2. The "Refresh from SAP" button in `App.tsx` is already wired to a handler — point it at
   that fetch instead of the demo toast.
3. "Expedite" and "Release Credit Hold" currently only log to local state
   (`useOrders.ts`). To make them actually write back to SAP (e.g. call a BAPI, raise a
   workflow task, or notify a Teams/email channel), that's the only file that needs a new
   call — the UI, modals, and history log stay the same.

### Excel import

Some orders are tracked in Excel before they exist in SAP. Click **Import Excel** and
upload a `.xlsx` workbook. The first row must contain headers (case-insensitive) for at
least **Sales Order Number**, **Customer Name**, and **Status** — the rest of the
dashboard's columns are recognized too (Linkage Number, Customer ID, Rep, MS Code,
Original/Planned Shipping Date, Credit Hold as Yes/No). See
`src/services/excelImport.ts` for the exact header aliases accepted.

Imported rows are merged into the table by Sales Order Number: a new number is added, an
existing one is updated in place (its expedite/notes history is preserved). This is a
client-side parse (via `exceljs`, lazy-loaded only when the button is used) — no file is
uploaded anywhere.

### Actions

Expedite and Release Credit Hold open a confirmation dialog, then log a timestamped entry
to that order's action history (visible by expanding the row). This is a **local
simulation** — nothing is sent to SAP or a ticketing system yet. It exists so the actual
backend call can be dropped into `useOrders.ts` without changing any UI.

## Branding note

Colors and type in `src/styles/tokens.css` follow Yokogawa's public brand identity
(signature red, near-black header, restrained neutral grays) from general knowledge —
live access to yokogawa.com was not available while building this, so exact hex values
were not pulled from the site's CSS. If your internal brand guideline specifies different
hex codes, update `--brand-red`, `--brand-ink`, etc. in that one file.
