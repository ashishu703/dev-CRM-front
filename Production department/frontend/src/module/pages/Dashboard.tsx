import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const lineData = [
	{ name: 'Mon', value: 120 },
	{ name: 'Tue', value: 140 },
	{ name: 'Wed', value: 160 },
	{ name: 'Thu', value: 180 },
	{ name: 'Fri', value: 150 },
];

const barData = [
	{ name: 'WC-1', value: 75 },
	{ name: 'WC-2', value: 62 },
	{ name: 'WC-3', value: 88 },
];

const pieData = [
	{ name: 'Available', value: 70 },
	{ name: 'Short', value: 30 },
];

export function Dashboard() {
	return (
		<div style={{ display: 'grid', gap: 16 }}>
			<h2 style={{ margin: 0 }}>Dashboard</h2>
			<div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
				<section style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
					<h3 style={{ marginTop: 0 }}>Throughput (units/day)</h3>
					<div style={{ height: 200 }}>
						<ResponsiveContainer>
							<LineChart data={lineData}>
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</section>
				<section style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
					<h3 style={{ marginTop: 0 }}>Capacity Utilization by Work Center (%)</h3>
					<div style={{ height: 200 }}>
						<ResponsiveContainer>
							<BarChart data={barData}>
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="value" fill="#10b981" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</section>
				<section style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
					<h3 style={{ marginTop: 0 }}>RM Availability</h3>
					<div style={{ height: 200, display: 'grid', placeItems: 'center' }}>
						<ResponsiveContainer>
							<PieChart>
								<Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80}>
									{pieData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#f97316'} />
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</section>
			</div>
		</div>
	);
}
