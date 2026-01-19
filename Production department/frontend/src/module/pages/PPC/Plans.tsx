import React from 'react';
import usePermission from '../../../../../../src/hooks/usePermission';
import { Permissions } from '../../../../../../src/constants/permissions';

export function Plans() {
    const { can } = usePermission();
    const canEdit = can(Permissions.EDIT_PRODUCTION_REPORTS, 'production');
    const canSchedule = can(Permissions.VIEW_PRODUCTION_SCHEDULE, 'production');
    return (
		<div style={{ display: 'grid', gap: 12 }}>
			<h2 style={{ margin: 0 }}>PPC Plans</h2>
			<div style={{ display: 'flex', gap: 8 }}>
                <button disabled={!canEdit}>Create Plan</button>
                <button disabled={!canEdit}>Approve</button>
                <button disabled={!canSchedule}>Generate Work Orders</button>
			</div>
			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<thead>
					<tr>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Name</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Status</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Lines</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style={{ padding: 8 }}>Week-44 Plan</td>
						<td style={{ padding: 8 }}>Draft</td>
						<td style={{ padding: 8 }}>12</td>
					</tr>
					<tr>
						<td style={{ padding: 8 }}>Week-45 Plan</td>
						<td style={{ padding: 8 }}>Approved</td>
						<td style={{ padding: 8 }}>9</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
