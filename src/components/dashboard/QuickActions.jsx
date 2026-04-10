import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Target, Ticket, CalendarPlus } from 'lucide-react';
import Card from '../ui/Card';

const actions = [
  {
    label: 'Add Client',
    icon: UserPlus,
    to: '/clients',
    color: 'bg-primary/10 text-primary hover:bg-primary/20',
  },
  {
    label: 'Add Lead',
    icon: Target,
    to: '/leads',
    color: 'bg-secondary/10 text-secondary hover:bg-secondary/20',
  },
  {
    label: 'Create Ticket',
    icon: Ticket,
    to: '/tickets',
    color: 'bg-warning/10 text-warning hover:bg-warning/20',
  },
  {
    label: 'Day Plan',
    icon: CalendarPlus,
    to: '/day-plans',
    color: 'bg-success/10 text-success hover:bg-success/20',
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card hover={false}>
      <h3 className="text-base font-semibold text-text-primary mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.to)}
            className={`flex items-center gap-3 p-4 rounded-xl border border-border transition-all duration-200 ${action.color}`}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}
