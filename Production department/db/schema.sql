-- PostgreSQL schema for Production Department Module

-- Core reference tables
CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
	id UUID PRIMARY KEY,
	name TEXT NOT NULL
);

-- Items and master data
CREATE TABLE IF NOT EXISTS items (
	id UUID PRIMARY KEY,
	item_code TEXT UNIQUE NOT NULL,
	description TEXT NOT NULL,
	item_type TEXT NOT NULL CHECK (item_type IN ('RM','WIP','FG','SPARE')),
	uom TEXT NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS boms (
	id UUID PRIMARY KEY,
	item_id UUID NOT NULL REFERENCES items(id),
	revision TEXT NOT NULL,
	is_current BOOLEAN NOT NULL DEFAULT FALSE,
	UNIQUE (item_id, revision)
);

CREATE TABLE IF NOT EXISTS bom_components (
	id UUID PRIMARY KEY,
	bom_id UUID NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
	component_item_id UUID NOT NULL REFERENCES items(id),
	quantity NUMERIC(18,6) NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS routings (
	id UUID PRIMARY KEY,
	item_id UUID NOT NULL REFERENCES items(id),
	revision TEXT NOT NULL,
	is_current BOOLEAN NOT NULL DEFAULT FALSE,
	UNIQUE (item_id, revision)
);

CREATE TABLE IF NOT EXISTS routing_operations (
	id UUID PRIMARY KEY,
	routing_id UUID NOT NULL REFERENCES routings(id) ON DELETE CASCADE,
	sequence INT NOT NULL,
	work_center TEXT NOT NULL,
	std_setup_mins INT NOT NULL DEFAULT 0,
	std_run_mins_per_unit NUMERIC(18,6) NOT NULL DEFAULT 0
);

-- Machines and capacity
CREATE TABLE IF NOT EXISTS machines (
	id UUID PRIMARY KEY,
	code TEXT UNIQUE NOT NULL,
	description TEXT NOT NULL,
	work_center TEXT NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS calendars (
	id UUID PRIMARY KEY,
	name TEXT NOT NULL,
	timezone TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS machine_calendars (
	id UUID PRIMARY KEY,
	machine_id UUID NOT NULL REFERENCES machines(id),
	calendar_id UUID NOT NULL REFERENCES calendars(id)
);

-- PPC: demand and plan
CREATE TABLE IF NOT EXISTS demands (
	id UUID PRIMARY KEY,
	source TEXT NOT NULL CHECK (source IN ('Order','Forecast')),
	account_id UUID REFERENCES accounts(id),
	item_id UUID NOT NULL REFERENCES items(id),
	quantity NUMERIC(18,6) NOT NULL,
	due_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS ppc_plans (
	id UUID PRIMARY KEY,
	name TEXT NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('Draft','Approved','Closed')),
	planned_by UUID REFERENCES users(id),
	approved_by UUID REFERENCES users(id),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS plan_lines (
	id UUID PRIMARY KEY,
	ppc_plan_id UUID NOT NULL REFERENCES ppc_plans(id) ON DELETE CASCADE,
	demand_id UUID REFERENCES demands(id),
	item_id UUID NOT NULL REFERENCES items(id),
	quantity NUMERIC(18,6) NOT NULL,
	due_date DATE NOT NULL
);

-- Work Orders
CREATE TABLE IF NOT EXISTS work_orders (
	id UUID PRIMARY KEY,
	ppc_plan_id UUID REFERENCES ppc_plans(id),
	item_id UUID NOT NULL REFERENCES items(id),
	quantity NUMERIC(18,6) NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('Planned','Released','InProgress','Hold','Completed','Closed')),
	due_date DATE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_order_operations (
	id UUID PRIMARY KEY,
	work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
	operation_seq INT NOT NULL,
	machine_id UUID REFERENCES machines(id),
	status TEXT NOT NULL CHECK (status IN ('Planned','Ready','InProgress','Completed','Skipped')),
	start_time TIMESTAMPTZ,
	end_time TIMESTAMPTZ,
	scrap_qty NUMERIC(18,6) NOT NULL DEFAULT 0
);

-- Material Reservations and Backflush
CREATE TABLE IF NOT EXISTS material_reservations (
	id UUID PRIMARY KEY,
	work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
	item_id UUID NOT NULL REFERENCES items(id),
	required_qty NUMERIC(18,6) NOT NULL,
	reserved_qty NUMERIC(18,6) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS completions (
	id UUID PRIMARY KEY,
	work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
	good_qty NUMERIC(18,6) NOT NULL,
	scrap_qty NUMERIC(18,6) NOT NULL DEFAULT 0,
	completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quality Control
CREATE TABLE IF NOT EXISTS inspection_plans (
	id UUID PRIMARY KEY,
	name TEXT NOT NULL,
	item_id UUID REFERENCES items(id),
	inspection_type TEXT NOT NULL CHECK (inspection_type IN ('Incoming','Inline','Final'))
);

CREATE TABLE IF NOT EXISTS inspection_lots (
	id UUID PRIMARY KEY,
	source TEXT NOT NULL CHECK (source IN ('Receipt','WOOperation','Shipment')),
	item_id UUID NOT NULL REFERENCES items(id),
	work_order_id UUID REFERENCES work_orders(id),
	quantity NUMERIC(18,6) NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('Open','Accepted','Rejected')),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspection_results (
	id UUID PRIMARY KEY,
	inspection_lot_id UUID NOT NULL REFERENCES inspection_lots(id) ON DELETE CASCADE,
	characteristic TEXT NOT NULL,
	result_value TEXT,
	is_pass BOOLEAN
);

CREATE TABLE IF NOT EXISTS ncrs (
	id UUID PRIMARY KEY,
	inspection_lot_id UUID REFERENCES inspection_lots(id),
	description TEXT NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('Open','UnderReview','Closed')),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS capas (
	id UUID PRIMARY KEY,
	ncr_id UUID NOT NULL REFERENCES ncrs(id) ON DELETE CASCADE,
	action TEXT NOT NULL,
	owner_id UUID REFERENCES users(id),
	status TEXT NOT NULL CHECK (status IN ('Open','InProgress','Verified','Closed'))
);

-- Maintenance
CREATE TABLE IF NOT EXISTS assets (
	id UUID PRIMARY KEY,
	code TEXT UNIQUE NOT NULL,
	description TEXT NOT NULL,
	machine_id UUID REFERENCES machines(id)
);

CREATE TABLE IF NOT EXISTS maintenance_plans (
	id UUID PRIMARY KEY,
	asset_id UUID NOT NULL REFERENCES assets(id),
	schedule_rule TEXT NOT NULL, -- e.g., cron or meter-based
	active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS maintenance_orders (
	id UUID PRIMARY KEY,
	asset_id UUID NOT NULL REFERENCES assets(id),
	order_type TEXT NOT NULL CHECK (order_type IN ('Preventive','Corrective')),
	status TEXT NOT NULL CHECK (status IN ('Planned','InProgress','Completed','Closed')),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS downtimes (
	id UUID PRIMARY KEY,
	machine_id UUID NOT NULL REFERENCES machines(id),
	maintenance_order_id UUID REFERENCES maintenance_orders(id),
	start_time TIMESTAMPTZ NOT NULL,
	end_time TIMESTAMPTZ,
	reason TEXT
);

-- Stock and Warehousing
CREATE TABLE IF NOT EXISTS warehouses (
	id UUID PRIMARY KEY,
	code TEXT UNIQUE NOT NULL,
	description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bins (
	id UUID PRIMARY KEY,
	warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
	code TEXT NOT NULL,
	UNIQUE (warehouse_id, code)
);

CREATE TABLE IF NOT EXISTS stock_items (
	id UUID PRIMARY KEY,
	item_id UUID NOT NULL REFERENCES items(id),
	lot TEXT,
	serial TEXT,
	warehouse_id UUID NOT NULL REFERENCES warehouses(id),
	bin_id UUID REFERENCES bins(id),
	quantity NUMERIC(18,6) NOT NULL,
	cost NUMERIC(18,6) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stock_movements (
	id UUID PRIMARY KEY,
	item_id UUID NOT NULL REFERENCES items(id),
	source TEXT NOT NULL, -- e.g., Receipt, Issue, Completion
	quantity NUMERIC(18,6) NOT NULL,
	warehouse_id UUID REFERENCES warehouses(id),
	bin_id UUID REFERENCES bins(id),
	lot TEXT,
	serial TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	reference_id UUID -- links to WO/PO/Shipment etc.
);

-- Job Work (Subcontracting)
CREATE TABLE IF NOT EXISTS subcontract_orders (
	id UUID PRIMARY KEY,
	vendor_account_id UUID NOT NULL REFERENCES accounts(id),
	description TEXT NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('Open','Dispatched','Received','Closed')),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gate_passes (
	id UUID PRIMARY KEY,
	subcontract_order_id UUID REFERENCES subcontract_orders(id),
	item_id UUID NOT NULL REFERENCES items(id),
	quantity NUMERIC(18,6) NOT NULL,
	issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Costing (simplified)
CREATE TABLE IF NOT EXISTS item_costs (
	id UUID PRIMARY KEY,
	item_id UUID NOT NULL REFERENCES items(id) UNIQUE,
	standard_cost NUMERIC(18,6) NOT NULL DEFAULT 0,
	landed_cost NUMERIC(18,6) NOT NULL DEFAULT 0,
	last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices (examples)
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_inspection_lots_status ON inspection_lots(status);
CREATE INDEX IF NOT EXISTS idx_stock_items_item_id ON stock_items(item_id);

-- Views (examples)
CREATE OR REPLACE VIEW v_oee_candidates AS
SELECT m.id AS machine_id,
       wo.id AS work_order_id,
       wop.start_time,
       wop.end_time
FROM machines m
JOIN work_order_operations wop ON wop.machine_id = m.id
JOIN work_orders wo ON wo.id = wop.work_order_id;
