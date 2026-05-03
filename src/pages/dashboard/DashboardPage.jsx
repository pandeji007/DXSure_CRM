import { Users, Target, Ticket, DollarSign, PhoneCall, UserCheck } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/dashboard/StatCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import LeadChart from '../../components/dashboard/LeadChart';
import QuickActions from '../../components/dashboard/QuickActions';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useClients } from '../../hooks/useClients';
import { useLeads } from '../../hooks/useLeads';
import { useTickets } from '../../hooks/useTickets';
import { useFollowUps } from '../../hooks/useFollowUps';
import { useEmployees } from '../../hooks/useEmployees';
import { useFinanceStats } from '../../hooks/useFinance';
import { formatCurrency, formatDate, isSameLocalDate } from '../../lib/utils';
import { STATUS_COLORS } from '../../constants';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { isAdmin, profile } = useAuth();
  const { data: clients } = useClients();
  const leadFilters = { assigned_to: isAdmin ? undefined : profile?.id };
  const { data: leads } = useLeads(leadFilters);
  const { data: tickets } = useTickets();
  const { data: followups } = useFollowUps({ created_by: isAdmin ? undefined : profile?.id });
  const { data: employees } = useEmployees();
  const { data: financeStats } = useFinanceStats({ created_by: isAdmin ? undefined : profile?.id });

  const activeLeads = leads?.filter(l => !['converted', 'lost'].includes(l.status))?.length || 0;
  const openTickets = tickets?.filter(t => t.status !== 'completed' && t.status !== 'cancelled')?.length || 0;
  const pendingFollowUps = followups?.filter(f => f.status === 'scheduled')?.length || 0;
  const todayFollowUps =
    followups?.filter((followUp) => followUp.status === 'scheduled' && isSameLocalDate(followUp.scheduled_at)) || [];

  const adminStats = [
    { title: 'Total Clients', value: clients?.length || 0, icon: Users, color: 'primary' },
    { title: 'Active Leads', value: activeLeads, icon: Target, color: 'secondary' },
    { title: 'Open Tickets', value: openTickets, icon: Ticket, color: 'warning' },
    { title: 'Total Revenue', value: formatCurrency(financeStats?.income || 0), icon: DollarSign, color: 'success' },
    { title: 'Pending Follow-Ups', value: pendingFollowUps, icon: PhoneCall, color: 'danger' },
    { title: 'Active Employees', value: employees?.length || 0, icon: UserCheck, color: 'primary' },
  ];

  const myLeads = leads?.filter(l => l.assigned_to === profile?.id)?.length || 0;
  const myTickets = tickets?.filter(t => t.assigned_to === profile?.id && t.status !== 'completed')?.length || 0;
  const myClients = clients?.length || 0;

  const employeeStats = [
    { title: 'My Leads', value: myLeads, icon: Target, color: 'primary' },
    { title: 'My Tickets', value: myTickets, icon: Ticket, color: 'warning' },
    { title: "Today's Follow-Ups", value: todayFollowUps.length, icon: PhoneCall, color: 'secondary' },
    { title: 'My Clients', value: myClients, icon: Users, color: 'success' },
  ];

  const stats = isAdmin ? adminStats : employeeStats;

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Welcome back, {profile?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Here's what's happening with your CRM today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts + Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <LeadChart filters={leadFilters} />

          {/* Upcoming Follow-Ups */}
          <Card hover={false}>
            <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-secondary" />
              Upcoming Follow-Ups
            </h3>
            <div className="space-y-2">
              {(!followups || followups.filter(f => f.status === 'scheduled').length === 0) ? (
                <p className="text-sm text-text-muted text-center py-6">No upcoming follow-ups</p>
              ) : (
                followups
                  .filter(f => f.status === 'scheduled')
                  .slice(0, 5)
                  .map((fu, i) => (
                    <motion.div
                      key={fu.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-elevated transition-colors"
                    >
                      <div>
                        <p className="text-sm text-text-primary">
                          {fu.client?.name || fu.lead?.contact_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-text-muted capitalize">{fu.type} · {formatDate(fu.scheduled_at)}</p>
                      </div>
                      <Badge color={STATUS_COLORS[fu.status] || 'info'}>{fu.status}</Badge>
                    </motion.div>
                  ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </PageWrapper>
  );
}
