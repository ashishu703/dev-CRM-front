import React from 'react';
import usePermission from '../../../../../../src/hooks/usePermission';
import { Permissions } from '../../../../../../src/constants/permissions';

export function MaintenanceOrders() {
    const { can } = usePermission();
    const canCreate = can(Permissions.VIEW_PRODUCTION_SCHEDULE, 'production');
    const canComplete = can(Permissions.UPDATE_TASK_STATUS, 'production');
    return (
		<div style={{ display: 'grid', gap: 12 }}>
			<h2 style={{ margin: 0 }}>Maintenance Work Orders</h2>
			<div style={{ display: 'flex', gap: 8 }}>
                <button disabled={!canCreate}>Create Order</button>
                <button disabled={!canComplete}>Complete</button>
			</div>
			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<thead>
					<tr>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Order</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Type</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Asset</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Status</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style={{ padding: 8 }}>MO-001</td>
						<td style={{ padding: 8 }}>Preventive</td>
						<td style={{ padding: 8 }}>Press-01</td>
						<td style={{ padding: 8 }}>Planned</td>
					</tr>
					<tr>
						<td style={{ padding: 8 }}>MO-002</td>
						<td style={{ padding: 8 }}>Corrective</td>
						<td style={{ padding: 8 }}>Lathe-02</td>
						<td style={{ padding: 8 }}>InProgress</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
