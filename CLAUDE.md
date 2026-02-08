# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run ESLint (eslint)
```

No test framework is configured yet.

## Architecture

AccuBooks is a client-side-only accounting application built with **Next.js 16 (App Router)** and **React 19**. All data lives in React state—there is no backend, database, or API layer. Refreshing the browser resets to initial sample data.

### State Management

A single React Context (`src/context/AppContext.js`) holds all application state and exposes computed values (balances, payables, receivables, net balance) plus mutation functions. Every page and modal consumes this context. There is no Redux or other state library.

### Routing & Pages

Next.js App Router with file-based routing under `src/app/`. All page components use `'use client'` (fully client-side). Routes: `/` (dashboard), `/transactions`, `/suppliers`, `/customers`, `/purchases`, `/sales`, `/creditors`, `/debtors`, `/reports`.

### Component Patterns

- **AppModal** (`src/components/AppModal.js`) — a single modal component that handles 7 different form types (supplier, customer, purchase, sale, creditor, debtor, transaction). The `modalType` from context determines which form renders.
- **PaymentModal** (`src/components/PaymentModal.js`) — handles payment/receipt entries for suppliers, customers, creditors, and debtors.
- **AccountView** (`src/components/AccountView.js`) — master-detail ledger view used by supplier/customer pages to show transaction history.
- Both modals are rendered globally in `src/app/layout.js`, controlled via context state.

### Internationalization

Bilingual support (English and Gujarati) via a translations object in `src/lib/translations.js`. Language is toggled in the Sidebar and stored in context. All user-facing strings should go through this translation layer.

### Styling

Tailwind CSS v4 with a dark theme (gray-900 background, gray-800 cards). Entity-specific color coding: orange=suppliers, cyan=customers, purple=purchases, blue=sales, emerald=income, red=expenses.

### Path Aliases

`@/*` maps to `./src/*` (configured in `jsconfig.json`). Use `@/components`, `@/context`, `@/lib` for imports.

### Key Data Entities

Transactions, Suppliers, Customers, Purchases (with line items), Sales (with line items), Creditors, Debtors, and their associated Payments/Receipts — all stored as arrays in AppContext state.
