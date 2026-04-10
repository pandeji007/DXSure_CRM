import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-elevated border border-border rounded-xl px-3 py-2 shadow-card">
        <p className="text-sm text-text-primary font-medium mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: ₹{entry.value?.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FinanceChart({ data, loading }) {
  if (loading) {
    return <Card hover={false}><Skeleton variant="card" className="h-64" /></Card>;
  }

  const monthlyData = {};
  (data || []).forEach((entry) => {
    const month = entry.entry_date?.slice(0, 7);
    if (!month) return;
    if (!monthlyData[month]) monthlyData[month] = { month, income: 0, expense: 0 };
    if (entry.type === 'payment') monthlyData[month].income += entry.amount || 0;
    else monthlyData[month].expense += entry.amount || 0;
  });

  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);

  return (
    <Card hover={false}>
      <h3 className="text-base font-semibold text-text-primary mb-4">Income vs Expenses</h3>
      {chartData.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-16">No data to display</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8888aa' }} />
            <YAxis tick={{ fontSize: 12, fill: '#8888aa' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
            />
            <Bar dataKey="income" fill="#2ed573" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ff4757" name="Expense" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
