import React from 'react';
import usePermission from '../../../../../../src/hooks/usePermission';
import { Permissions } from '../../../../../../src/constants/permissions';

export function InspectionLots() {
    const { can } = usePermission();
    const canCreate = can(Permissions.VIEW_PRODUCTION_TASKS, 'production');
    const canRecord = can(Permissions.UPDATE_TASK_STATUS, 'production');
    return (
		<div style={{ display: 'grid', gap: 12 }}>
			<h2 style={{ margin: 0 }}>Inspection Lots</h2>
			<div style={{ display: 'flex', gap: 8 }}>
                <button disabled={!canCreate}>Create Lot</button>
                <button disabled={!canRecord}>Record Results</button>
                <button disabled={!canRecord}>Create NCR</button>
			</div>
			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<thead>
					<tr>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Lot</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Item</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Qty</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Status</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style={{ padding: 8 }}>LOT-0001</td>
						<td style={{ padding: 8 }}>FG-100</td>
						<td style={{ padding: 8 }}>100</td>
						<td style={{ padding: 8 }}>Open</td>
					</tr>
					<tr>
						<td style={{ padding: 8 }}>LOT-0002</td>
						<td style={{ padding: 8 }}>RM-200</td>
						<td style={{ padding: 8 }}>50</td>
						<td style={{ padding: 8 }}>Accepted</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
