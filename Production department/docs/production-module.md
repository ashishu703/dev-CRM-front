Production Department Module: Architecture, Workflows, and KPIs

## Scope and Departments
1. PPC (Production Planning & Control)
   - Planning: demand intake, MPS, MRP/RM plan
   - Design: BoM, routing, revisions, ECOs
   - Job Work: subcontracting, gate pass, receipt
   - RM Plan: availability check, purchase reqs, reservations
   - RM Costing: standard cost, landed cost, variance
2. Production
   - Work orders: create, schedule, dispatch
   - Machine-wise plan: capacity planning, assignment, re-allocation
   - Execution: start/stop, WIP, scrap, completion booking
3. Quality Control
   - Incoming/Inline/Final inspections, sampling plans
   - Non-conformance (NCR), deviations, CAPA
4. Maintenance
   - Assets and machines registry
   - Preventive schedules and corrective work orders
   - Spare parts consumption and downtime tracking
5. Stock
   - Items, lots/serials, bins/warehouses
   - RM/FG/Spare inventory, reservations, movements, valuation

## Core Entities (high-level)
- Item, BoM (multi-level), Routing (operations), WorkOrder
- Machine, WorkCenter, Shift, Calendar, Capacity
- Plan (PPC), Demand (Sales/Forecast), Reservation
- PurchaseReq, SubcontractOrder (Job Work), GatePass
- InspectionPlan, InspectionLot, Result, NCR, CAPA
- Asset, MaintenancePlan, MaintenanceOrder, Downtime
- Warehouse, Bin, StockItem, StockMovement, Lot, Serial

## High-Level Workflow
- Demand intake → PPC Plan → BoM/Routing selection → RM plan (availability/MRP) → Work orders
- Production scheduling → Machine-wise allotment → Execution (WIP) → QC gates → Completion/Backflush
- Maintenance PM schedule → Work orders → Execution → Spares → Closeout and downtime logs
- Stock updates at each step → Traceability by lot/serial → Costing and variances

## Roles and Permissions
- PPC Planner, Production Supervisor, Operator, QC Engineer, Maintenance Engineer, Stores, Procurement, Finance
- Enforce role-based access for create/approve/execute/close actions

## SLAs and Controls
- Plan approval lead times, WO release windows, QC resolution SLA, MTTR/MTBF targets, Inventory accuracy, Cycle counts

## KPIs and Dashboards
- PPC: plan adherence, capacity utilization, RM availability, plan vs actual cost
- Production: throughput, OEE, WIP age, on-time completion, scrap rate
- QC: defect density, FPY, NCR cycle time, CAPA effectiveness
- Maintenance: MTTR, MTBF, schedule compliance, downtime %, spare consumption
- Stock: inventory turns, stock-out rate, aging, accuracy, valuation variance

## Automation & Integrations
- Auto-create Purchase Reqs for RM shortages
- Auto-reserve stock to WOs; backflush on completion
- Alerts on plan deviations, overdue inspections, downtime thresholds
- Optional: integrate with MES/PLC for machine data; with accounting for costing

## Data Governance
- Audit trails for plan changes and approvals
- Lot/serial traceability through QC and production
- Attachments for drawings, SOPs, and inspection records

## Sequence Diagrams (condensed)
- Plan to Production: Demand → Plan → RM Check → WO → Schedule → Execute → QC → Close
- Maintenance PM: Schedule → WO → Execute → Spares → Close → Metrics

Refer to `db/schema.sql` and `api/openapi.yaml` for concrete structures.
