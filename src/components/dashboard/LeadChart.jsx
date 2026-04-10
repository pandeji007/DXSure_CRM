import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Card from '../ui/Card';
import { useLeads } from '../../hooks/useLeads';
import Skeleton from '../ui/Skeleton';

const STATUS_COLORS_MAP = {
  new: '#6c63ff',
  contacted: '#ffa502',
  in_progress: '#ff6348',
  qualified: '#a855f7',
  converted: '#2ed573',
  lost: '#ff4757',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-elevated border border-border rounded-xl px-3 py-2 shadow-card">
        <p className="text-sm text-text-primary font-medium">{payload[0].name}</p>
        <p className="text-xs text-text-secondary">{payload[0].value} leads</p>
      </div>
    );
  }
  return null;
};

export default function LeadChart() {
  const { data: leads, isLoading } = useLeads();

  if (isLoading) {
    return (
      <Card hover={false}>
        <h3 className="text-base font-semibold text-text-primary mb-4">Lead Overview</h3>
        <Skeleton variant="card" className="h-64" />
      </Card>
    );
  }

  const statusCounts = (leads || []).reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
    color: STATUS_COLORS_MAP[name] || '#8888aa',
  }));

  return (
    <Card hover={false}>
      <h3 className="text-base font-semibold text-text-primary mb-4">Lead Status Distribution</h3>
      {pieData.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-16">No lead data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-text-secondary">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
