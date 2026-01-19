# Production Department Module for CRM

This repository contains the initial architecture, data model, API specification, and UI blueprint for a Production Department module within a CRM. It covers the following departments:

- PPC (Production Planning and Control): planning, design, job work, RM planning, RM costing
- Production: machine-wise plan allotment and assignment
- Quality Control: inspection plans, sampling, non-conformance, CAPA
- Maintenance: electrical and mechanical, preventive/corrective work orders
- Stock: inventory, RM/FG/Spare parts, movements, valuation

## What’s included
- `docs/production-module.md`: End-to-end workflows, roles, SLAs, and KPIs
- `db/schema.sql`: Normalized PostgreSQL schema (can adapt to other RDBMS)
- `api/openapi.yaml`: OpenAPI 3.0 spec for core endpoints
- `ui/wireframes.md`: Dashboard design, navigation, and component plan

## Getting started
1. Review `docs/production-module.md` for processes and KPIs
2. Load `db/schema.sql` into your database (PostgreSQL recommended)
3. Scaffold backend from `api/openapi.yaml` using your preferred framework
4. Implement UI per `ui/wireframes.md`

## Notes
- Designed to integrate with CRM objects: Accounts, Contacts, Opportunities, Orders
- Follows practical manufacturing CRM patterns with dashboards and workflow automation
- Extend with role-based permissions and audit logging as needed
