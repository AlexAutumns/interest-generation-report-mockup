# Interest Generation – Report Generator (Mockup)

High-fidelity mockup of an Interest Generation Report Generator built with React Router v7 (framework mode) using the Netlify template. The goal is to simulate a real internal reporting app experience (navigation, previews, charts, toasts, loading pipeline) while backend/database work is still pending.

## Brand styling

- Midnight Blue: #193E6B
- Green Gold: #B3A125
- White: #FFFFFF
- Neutral Gray (optional): #F5F5F5
- Target ratio: 60% neutral, 30% blue, 10% gold


## What this app does (current mockup scope)
### ✅ Core UX and layout

- Fixed Navbar + Sidebar layout with consistent styling.
- Sidebar “Report Preview” navigation.
- Consistent “premium” interactions:
  - subtle hover lift (Framer Motion)
  - toast notifications (Sonner)
  - consistent helper utilities / formatting across pages

### ✅ Data approach (mock today, real later)

**Mock report data lives in app/data/:**
  - mockReportsFull.ts — full GeneratedReport[]
  - mockReportSummaries.ts — summary ReportSummary[]

**Separate sample dataset:**
  - interest_generation_300_leads.csv (300 lead rows; used later for generation logic)

## ✅ Pages implemented

**Home**

- Recent reports table (links into preview)
- Latest snapshot charts (Recharts)
- Generate CTA

**Report Archive**

- Search + filtering + sorting upgrades
- Table + UX upgrades for browsing reports

**Report Preview Pages**

- Executive Summary (charts + channel breakdown + actions)
- KPI Overview
- Campaign & Channel Analysis (updated to include campaign-related breakdowns)
- Conversion & Funnel (funnel model + insights)
- Closed Lost Analysis (lost reason + improvements)
- Interest Aging & SLA Compliance
- Team Performance
- Geographic View (Leaflet map)

**Generate Report**

- Configuration form (weekly/monthly/quarterly)
- “What this will generate” confirmation panel
- Filter settings + advanced filters UI
- Export selection UI (PDF/Excel as exports; JSON is the internal report object)

**Generation Loading page**

- Pipeline-style loading steps (compile → compute → package → publish)
- Designed to later run real generation logic via services

## Tech stack
### Framework + styling

- React Router v7 (framework mode)
- TypeScript
- Tailwind CSS (already included in the template)

### UI/UX + visualization

- lucide-react (icons)
- recharts (charts)
- framer-motion (hover + entrance animations)
- sonner (toast notifications)

### Form + validation + state

- react-hook-form + zod (form validation)
- zustand (store for generation settings + future “reports store”)

### Data + utilities

- papaparse (planned for CSV parsing)
- date-fns (date utilities, where needed)
- leaflet / react-leaflet (geographic view)

**Note:** We can add shadcn/ui, @tanstack/react-table, clsx + tailwind-merge later if the UI needs more standard components. For now, we’re keeping things consistent and stable.


## Project structure (key folders)

Typical structure we’re using (high-level):

- `app/routes/` React Router route modules (framework mode). 
  - Example: `preview.executive_summary.tsx`, `generate.loading.tsx`
- `app/pages/` Page implementations broken into subfolders to reduce file size. 
  - Example: `pages/preview/executive-summary/*`, `pages/home/*`, `pages/archive/*`
- `app/components/` Shared UI like Navbar, Sidebar, etc.
- `app/data/` Temporary mock data sources: full reports + report summaries
- `app/state/` Zustand stores (generation settings + future reports store)
- `app/types/` Types for GeneratedReport, ReportSummary, etc.


## Getting Started

### Install
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```
App runs at `http://localhost:5173`


### Build
```bash
npm run build
```

### Preview Production Build (Optional)
```bash
npm netlify-cli serve
```

## Deployment (current mockup)
This project started from the Netlify React Router template, so it’s already set up for Netlify deployment.

---
---

# TODO / Next Steps

## Generation Logic (Planned staged rollout)
**Implement real generation logic inside the Generation Loading page:**

- **Stage 1: generate reports using interest_generation_300_leads.csv**

  - parse CSV (PapaParse)
  - compute KPIs + breakdowns
  - output a new GeneratedReport JSON object + derived summary

- **Stage 2: generate reports using a local database (not just CSV)**

  - decide DB + schema
  - implement query layer + aggregation

- **Stage 3: integrate with company database (Dataverse / Azure SQL / etc.)**

  - pending meeting decision: hosting + auth + access strategy
  - implement secure API/service integration
  - production-ready generation pipeline + audit/logging


## Mockup polish / UX

- Ensure sidebar navigation always preserves selected reportId (carry query params across preview links)
- Optional: persist “last generation settings” across refresh (zustand persist)
- Optional: add “data coverage” mini cards on Generate page (latest available date, total leads in period, etc.)
- Add “Export & Distribution” page UI (email list, recipients, schedule)
- Add “Report Archive” export/download actions (mock + later real)


## Architecture / readiness

- Move pages to read reports from a reports store instead of static mock arrays (so new generated reports appear everywhere immediately)
- Create services/ layer:
- report_generation_service.ts
- csv_lead_repository.ts
- dataverse_report_repository.ts (later)
- Add basic error boundary / fallback screens for missing data