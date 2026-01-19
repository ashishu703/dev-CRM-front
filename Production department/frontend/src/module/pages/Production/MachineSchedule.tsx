import React from 'react';
import usePermission from '../../../../../../src/hooks/usePermission';
import { Permissions } from '../../../../../../src/constants/permissions';

const assignments = [
	{ machine: 'MC-01', wo: 'WO-1001', op: 10, start: '08:00', end: '10:30' },
	{ machine: 'MC-02', wo: 'WO-1002', op: 20, start: '09:00', end: '12:00' },
	{ machine: 'MC-03', wo: 'WO-1003', op: 10, start: '10:00', end: '13:00' },
];

export function MachineSchedule() {
    const { can } = usePermission();
    const canSchedule = can(Permissions.VIEW_PRODUCTION_SCHEDULE, 'production');
    return (
		<div style={{ display: 'grid', gap: 12 }}>
			<h2 style={{ margin: 0 }}>Machine Schedule</h2>
			<ul style={{ padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
				{assignments.map((a, i) => (
					<li key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
						<div style={{ minWidth: 80, fontWeight: 600 }}>{a.machine}</div>
						<div style={{ minWidth: 80 }}>{a.wo}</div>
						<div>Op {a.op}</div>
						<div>{a.start} - {a.end}</div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                            <button disabled={!canSchedule}>Reassign</button>
                            <button>Details</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
