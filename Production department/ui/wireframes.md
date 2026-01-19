# UI and Dashboard Wireframes (Text Spec)

## Global Navigation
- Dashboard
- PPC
  - Plans
  - Design (BoM, Routing)
  - Job Work
- Production
  - Work Orders
  - Machine Schedule
  - Execution Console
- Quality Control
  - Inspection Lots
  - NCR & CAPA
- Maintenance
  - Assets & Plans
  - Work Orders
  - Downtime
- Stock
  - Items & Costs
  - Inventory
  - Movements

## Dashboard Widgets
- PPC
  - Plan Adherence (gauge)
  - RM Availability (donut)
  - Capacity Utilization by Work Center (bar)
- Production
  - OEE by Machine (cards)
  - Throughput & WIP (line/area)
  - On-Time Completion (bar)
- Quality
  - FPY and Defect Rate (combo)
  - NCR Cycle Time (trend)
- Maintenance
  - MTTR/MTBF (cards)
  - Schedule Compliance (gauge)
  - Downtime by Reason (bar)
- Stock
  - Inventory Turns (card)
  - Stock-outs & Aging (table + alerts)

## Key Screens
1. PPC Plan Editor
   - Header: Plan name, status, approvers
   - Lines table: item, qty, due date, demand link
   - Actions: Approve, Generate WOs, Export
2. Machine Schedule
   - Timeline/Gantt by machine with drag-and-drop
   - Filters: work center, status, date range
3. Production Execution Console
   - Operator view: Start/Stop, quantities, scrap reason, attachments
   - QR/Barcode support
4. QC Lot Processing
   - Lot header + sampling plan
   - Record results, auto-disposition rules
   - Create NCR/CAPA
5. Maintenance Order
   - Checklist, spare parts picker, time booking
   - Downtime capture and closeout
6. Inventory
   - Item card with lots/serials, movements, valuation

## Component Notes
- Use role-based visibility on actions
- Inline validations; optimistic UI for fast scanning
- Export CSV/PDF where needed
