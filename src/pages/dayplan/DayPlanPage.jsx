import { useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import DayPlanForm from '../../components/dayplan/DayPlanForm';
import DayPlanCard from '../../components/dayplan/DayPlanCard';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useDayPlans, useCreateDayPlan, useUpdateDayPlan } from '../../hooks/useDayPlan';
import { useAuth } from '../../hooks/useAuth';
import { DAYPLAN_STATUSES } from '../../constants';
import { cn } from '../../lib/utils';

export default function DayPlanPage() {
  const { user, isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');

  const { data: plans, isLoading } = useDayPlans({ status: filter || undefined, user_id: !isAdmin ? user?.id : undefined });
  const createPlan = useCreateDayPlan();
  const updatePlan = useUpdateDayPlan();

  const handleCreate = async (data) => {
    await createPlan.mutateAsync({ ...data, user_id: user.id, status: 'draft' });
    setShowForm(false);
  };

  const handleSubmitPlan = async (id) => {
    await updatePlan.mutateAsync({ id, status: 'submitted' });
  };

  const handleApprove = async (id) => {
    await updatePlan.mutateAsync({ id, status: 'approved' });
  };

  const handleReject = async (id) => {
    await updatePlan.mutateAsync({ id, status: 'rejected' });
  };

  const filters = [{ value: '', label: 'All' }, ...DAYPLAN_STATUSES];

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Day Plans</h1>
          <p className="text-sm text-text-secondary mt-1">
            {isAdmin ? 'Review and manage employee day plans' : 'Plan and track your daily tasks'}
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm(true)}>Create Plan</Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
              filter === f.value ? 'bg-primary text-white border-primary' : 'bg-transparent text-text-secondary border-border hover:text-text-primary'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-elevated rounded-card animate-shimmer shimmer-bg" />
          ))}
        </div>
      ) : !plans?.length ? (
        <Card hover={false} className="text-center py-16">
          <CalendarDays className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-base font-semibold text-text-primary mb-1">No day plans</h3>
          <p className="text-sm text-text-secondary mb-4">Start planning your day to stay productive.</p>
          <Button icon={Plus} onClick={() => setShowForm(true)} size="sm">Create Plan</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <DayPlanCard
              key={plan.id}
              plan={plan}
              index={i}
              isAdmin={isAdmin}
              onSubmit={handleSubmitPlan}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Day Plan" size="md">
        <DayPlanForm onSubmit={handleCreate} loading={createPlan.isPending} />
      </Modal>
    </PageWrapper>
  );
}
