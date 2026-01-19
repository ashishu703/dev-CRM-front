import React, { useState } from 'react';
import usePermission from '../../../../../../src/hooks/usePermission';
import { Permissions } from '../../../../../../src/constants/permissions';

export function ExecutionConsole() {
	const { can } = usePermission();
	const canControl = can(Permissions.UPDATE_TASK_STATUS, 'production') || can(Permissions.VIEW_PRODUCTION_TASKS, 'production');
	const [running, setRunning] = useState(false);
	const [good, setGood] = useState(0);
	const [scrap, setScrap] = useState(0);
	return (
		<div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
			<h2 style={{ margin: 0 }}>Execution Console</h2>
			<div style={{ display: 'grid', gap: 8 }}>
				<label>Work Order: <strong>WO-1002</strong></label>
				<label>Operation: <strong>20</strong></label>
			</div>
			<div style={{ display: 'flex', gap: 8 }}>
				<button onClick={() => setRunning(true)} disabled={!canControl || running}>Start</button>
				<button onClick={() => setRunning(false)} disabled={!canControl || !running}>Stop</button>
			</div>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
				<div>
					<label>Good Qty</label>
					<input type="number" value={good} onChange={e => setGood(Number(e.target.value))} style={{ width: '100%' }} />
				</div>
				<div>
					<label>Scrap Qty</label>
					<input type="number" value={scrap} onChange={e => setScrap(Number(e.target.value))} style={{ width: '100%' }} />
				</div>
			</div>
			<div>
				<button disabled={!canControl || (!running && good + scrap === 0)}>Book Completion</button>
			</div>
		</div>
	);
}
