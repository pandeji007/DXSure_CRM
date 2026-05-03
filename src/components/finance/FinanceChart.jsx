import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import { buildFinanceMonthlySeries } from '../../lib/finance';
import { formatCurrency } from '../../lib/utils';

const chartPalette = {
  inflow: '#2ed573',
  outflow: '#ff6b6b',
  net: '#4dabf7',
};

function formatAxisCurrency(value) {
  if (value == null) {
    return '₹0';
  }

  return formatCurrency(value)
    .replace('.00', '')
    .replace('₹', '')
    .trim();
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-elevated border border-border rounded-xl px-3 py-2 shadow-card">
      <p className="text-sm text-text-primary font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function FinanceChart({ data, loading }) {
  if (loading) {
    return (
      <Card hover={false}>
        <Skeleton variant="card" className="h-64" />
      </Card>
    );
  }

  const chartData = buildFinanceMonthlySeries(data || []);

  return (
    <Card hover={false}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary">Cash Flow Overview</h3>
        <p className="text-xs text-text-muted mt-1">
          Separate inflow, outflow, and net movement by month.
        </p>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-16">No data to display</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 12, fill: '#8888aa' }} />
            <YAxis
              tick={{ fontSize: 12, fill: '#8888aa' }}
              tickFormatter={formatAxisCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
            />
            <Bar dataKey="inflow" fill={chartPalette.inflow} name="Inflow" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" fill={chartPalette.outflow} name="Outflow" radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="net"
              stroke={chartPalette.net}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Net"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
