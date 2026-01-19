import React from 'react';

export function Inventory() {
	return (
		<div style={{ display: 'grid', gap: 12 }}>
			<h2 style={{ margin: 0 }}>Inventory</h2>
			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<thead>
					<tr>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Item</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Warehouse</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Qty</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style={{ padding: 8 }}>RM-100</td>
						<td style={{ padding: 8 }}>MAIN</td>
						<td style={{ padding: 8 }}>1200.00</td>
					</tr>
					<tr>
						<td style={{ padding: 8 }}>FG-200</td>
						<td style={{ padding: 8 }}>FG-STORE</td>
						<td style={{ padding: 8 }}>340.00</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
