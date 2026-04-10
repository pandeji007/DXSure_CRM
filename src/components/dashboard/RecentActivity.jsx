import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatRelative } from '../../lib/utils';
import { STATUS_COLORS } from '../../constants';
import { useRecentActivity } from '../../hooks/useActivityLogs';
import Skeleton from '../ui/Skeleton';
import { Activity } from 'lucide-react';

const actionIcons = {
  created_client: '👤',
  updated_client: '✏️',
  created_lead: '🎯',
  converted_lead: '🔄',
  created_ticket: '🎫',
  completed_ticket: '✅',
  created_followup: '📞',
  completed_followup: '✅',
  recorded_payment: '💰',
  user_login: '🔐',
  created_day_plan: '📋',
  submitted_day_plan: '📤',
  approved_day_plan: '✅',
};

export default function RecentActivity() {
  const { data: activities, isLoading } = useRecentActivity(10);

  if (isLoading) {
    return (
      <Card hover={false}>
        <h3 className="text-base font-semibold text-text-primary mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <Skeleton variant="text" count={5} className="h-12 mb-2" />
        </div>
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Recent Activity
        </h3>
      </div>
      <div className="space-y-1">
        {(!activities || activities.length === 0) ? (
          <p className="text-sm text-text-muted text-center py-8">No recent activity</p>
        ) : (
          activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-elevated transition-colors"
            >
              <span className="text-lg shrink-0">{actionIcons[activity.action] || '📝'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">
                  {activity.description || activity.action.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-text-muted">
                  {activity.profile?.name} · {formatRelative(activity.created_at)}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}
