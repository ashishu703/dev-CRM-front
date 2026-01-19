# Production Department UI (Frontend Only)

This package provides a React UI module for Production (PPC, Production, QC, Maintenance, Stock) to embed into an existing CRM frontend.

## Quick start (standalone)
- Install: `npm install`
- Dev: `npm run dev` (Vite)
- Build: `npm run build`
- Preview: `npm run preview`

## Embed in an existing React app
1. Install as a subfolder or package and ensure React 18+ and React Router v6+ are available.
2. Mount the router component where you want the module to live:

```tsx
import { ProductionModuleApp } from './frontend/src';

// Within your app router
<Route path="/production/*" element={<ProductionModuleApp />} />
```

3. Optionally replace placeholder data sources by providing props or context in `ProductionModuleApp` (TODO hooks are scaffolded in code).

## Features
- Dashboard with placeholder widgets for KPIs
- Sections: PPC, Production, QC, Maintenance, Stock
- Client-side routing and responsive layout

## Notes
- No backend required; pages render with placeholders ready to be wired to your APIs.
