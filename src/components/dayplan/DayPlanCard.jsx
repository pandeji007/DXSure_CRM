import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { CheckCircle, Circle, Calendar, User } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { STATUS_COLORS } from '../../constants';
import { cn } from '../../lib/utils';

export default function DayPlanCard({ plan, onApprove, onReject, onSubmit, isAdmin, index = 0 }) {
  const tasks = plan.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-text-primary">{formatDate(plan.plan_date)}</span>
            </div>
            {plan.profile?.name && (
              <p className="text-xs text-text-muted flex items-center gap-1">
                <User className="w-3 h-3" /> {plan.profile.name}
              </p>
            )}
          </div>
          <Badge color={STATUS_COLORS[plan.status] || 'muted'}>{plan.status}</Badge>
        </div>

        <div className="space-y-1.5 mb-3">
          {tasks.map((task, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {task.completed ? (
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-text-muted shrink-0" />
              )}
              <span className={cn(task.completed && 'line-through text-text-muted', 'text-text-secondary')}>
                {task.title}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">{completedCount}/{tasks.length} completed</span>
          <div className="flex gap-2">
            {plan.status === 'draft' && onSubmit && (
              <Button size="sm" variant="secondary" onClick={() => onSubmit(plan.id)}>Submit</Button>
            )}
            {isAdmin && plan.status === 'submitted' && (
              <>
                <Button size="sm" variant="secondary" onClick={() => onApprove(plan.id)}>Approve</Button>
                <Button size="sm" variant="danger" onClick={() => onReject(plan.id)}>Reject</Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
