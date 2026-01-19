import React from 'react';
import { BrowserRouter, MemoryRouter, Route, Routes, Navigate, Link } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Plans } from './pages/PPC/Plans';
import { MachineSchedule } from './pages/Production/MachineSchedule';
import { ExecutionConsole } from './pages/Production/ExecutionConsole';
import { InspectionLots } from './pages/QC/InspectionLots';
import { MaintenanceOrders } from './pages/Maintenance/Orders';
import { Inventory } from './pages/Stock/Inventory';
// Use app-level permission guard and constants
// four levels up to reach ANODE_FRONTEND/src from this file's directory
// module -> src -> frontend -> Production department -> ANODE_FRONTEND
import PermissionGuard from '../../../../src/components/PermissionGuard';
import { Permissions } from '../../../../src/constants/permissions';

function Sidebar() {
	return (
		<nav style={{ width: 240, padding: 16, borderRight: '1px solid #eee' }}>
			<h3 style={{ marginTop: 0 }}>Production</h3>
			<ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
				<li><Link to="/">Dashboard</Link></li>
				<li><strong>PPC</strong></li>
				<li><Link to="/ppc/plans">Plans</Link></li>
				<li><strong>Production</strong></li>
				<li><Link to="/production/machine-schedule">Machine Schedule</Link></li>
				<li><Link to="/production/console">Execution Console</Link></li>
				<li><strong>Quality Control</strong></li>
				<li><Link to="/qc/inspection-lots">Inspection Lots</Link></li>
				<li><strong>Maintenance</strong></li>
				<li><Link to="/maintenance/orders">Work Orders</Link></li>
				<li><strong>Stock</strong></li>
				<li><Link to="/stock/inventory">Inventory</Link></li>
			</ul>
		</nav>
	);
}

function Topbar() {
	return (
		<header style={{ height: 56, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
			<div style={{ fontWeight: 600 }}>Production Department</div>
		</header>
	);
}

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ display: 'grid', gridTemplateRows: '56px 1fr', height: '100dvh' }}>
			<Topbar />
			<div style={{ display: 'grid', gridTemplateColumns: '240px 1fr' }}>
				<Sidebar />
				<main style={{ padding: 16, overflow: 'auto' }}>{children}</main>
			</div>
		</div>
	);
}

export type ProductionModuleAppProps = {
    useMemoryRouter?: boolean;
    basePath?: string; // when using BrowserRouter, acts as basename; for MemoryRouter, ignored
    initialPath?: string; // when using MemoryRouter, seed initial route (e.g., '/production/machine-schedule')
    renderShell?: boolean; // if false, do not render Topbar/Sidebar; just render route contents
};

export function ProductionModuleApp(props: ProductionModuleAppProps) {
    const basename = props.basePath || '/production';
    const routes = (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
                path="/ppc/plans"
                element={
                    <PermissionGuard anyOf={[Permissions.VIEW_PRODUCTION_SCHEDULE, Permissions.EDIT_PRODUCTION_REPORTS]} departmentType="production" fallback={<div className="p-6">Access denied.</div>}>
                        <Plans />
                    </PermissionGuard>
                }
            />
            <Route
                path="/production/machine-schedule"
                element={
                    <PermissionGuard anyOf={[Permissions.VIEW_PRODUCTION_SCHEDULE]} departmentType="production" fallback={<div className="p-6">Access denied.</div>}>
                        <MachineSchedule />
                    </PermissionGuard>
                }
            />
            <Route
                path="/production/console"
                element={
                    <PermissionGuard anyOf={[Permissions.VIEW_PRODUCTION_TASKS, Permissions.UPDATE_TASK_STATUS]} departmentType="production" fallback={<div className="p-6">Access denied.</div>}>
                        <ExecutionConsole />
                    </PermissionGuard>
                }
            />
            <Route
                path="/qc/inspection-lots"
                element={
                    <PermissionGuard anyOf={[Permissions.VIEW_PRODUCTION_TASKS]} departmentType="production" fallback={<div className="p-6">Access denied.</div>}>
                        <InspectionLots />
                    </PermissionGuard>
                }
            />
            <Route
                path="/maintenance/orders"
                element={
                    <PermissionGuard anyOf={[Permissions.VIEW_PRODUCTION_SCHEDULE]} departmentType="production" fallback={<div className="p-6">Access denied.</div>}>
                        <MaintenanceOrders />
                    </PermissionGuard>
                }
            />
            <Route
                path="/stock/inventory"
                element={
                    <PermissionGuard anyOf={[Permissions.VIEW_PRODUCTION_TASKS]} departmentType="production" fallback={<div className="p-6">Access denied.</div>}>
                        <Inventory />
                    </PermissionGuard>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );

    const content = props.renderShell === false ? routes : (
        <Shell>
            {routes}
        </Shell>
    );

    if (props.useMemoryRouter) {
        const initial = props.initialPath || '/';
        const initialEntries = [initial];
        return (
            <MemoryRouter initialEntries={initialEntries}>
                {content}
            </MemoryRouter>
        );
    }
    return (
        <BrowserRouter basename={basename}>
            {content}
        </BrowserRouter>
    );
}
