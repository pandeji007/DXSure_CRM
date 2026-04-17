import { useState } from 'react';
import { PhoneCall, Search, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import FollowUpForm from '../../components/followups/FollowUpForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useFollowUps, useCreateFollowUp, useUpdateFollowUp } from '../../hooks/useFollowUps';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../lib/utils';
import { STATUS_COLORS, FOLLOWUP_STATUSES } from '../../constants';
import { cn } from '../../lib/utils';

export default function FollowUpsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('scheduled');

  const { data: followups, isLoading } = useFollowUps({ status: filter || undefined });
  const createFollowUp = useCreateFollowUp();
  const updateFollowUp = useUpdateFollowUp();

  const handleCreate = async (data) => {
    await createFollowUp.mutateAsync({ ...data, created_by: user.id });
    setShowForm(false);
  };

  const handleComplete = async (id) => {
    await updateFollowUp.mutateAsync({ id, status: 'completed' });
  };

  const filters = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'missed', label: 'Missed' },
    { value: '', label: 'All' },
  ];

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Follow-Ups</h1>
          <p className="text-sm text-text-secondary mt-1">Schedule and track your follow-ups</p>
        </div>
        <Button icon={PhoneCall} onClick={() => setShowForm(true)}>Schedule Follow-Up</Button>
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
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-elevated rounded-card animate-shimmer shimmer-bg" />
          ))}
        </div>
      ) : !followups?.length ? (
        <Card hover={false} className="text-center py-16">
          <PhoneCall className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-base font-semibold text-text-primary mb-1">No follow-ups</h3>
          <p className="text-sm text-text-secondary mb-4">Schedule follow-ups to stay on top of your leads and clients.</p>
          <Button icon={PhoneCall} onClick={() => setShowForm(true)} size="sm">Schedule Now</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {followups.map((fu, i) => (
            <motion.div
              key={fu.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="flex items-center justify-between" hover={true}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                    fu.type === 'call' && 'bg-primary/10',
                    fu.type === 'email' && 'bg-secondary/10',
                    fu.type === 'meeting' && 'bg-warning/10',
                    fu.type === 'visit' && 'bg-success/10',
                    !['call', 'email', 'meeting', 'visit'].includes(fu.type) && 'bg-elevated'
                  )}>
                    {fu.type === 'call' ? '📞' : fu.type === 'email' ? '📧' : fu.type === 'meeting' ? '🤝' : fu.type === 'visit' ? '🏢' : '📋'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {fu.client?.name || fu.lead?.contact_name || fu.lead?.title || 'Unknown'}
                    </p>
                    <p className="text-xs text-text-muted capitalize">
                      {fu.type} · {formatDateTime(fu.scheduled_at)}
                    </p>
                    {fu.notes && <p className="text-xs text-text-secondary mt-0.5">{fu.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={STATUS_COLORS[fu.status] || 'muted'}>{fu.status}</Badge>
                  {fu.status === 'scheduled' && (
                    <Button variant="ghost" size="sm" icon={CheckCircle} onClick={() => handleComplete(fu.id)}>
                      Done
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Schedule Follow-Up" size="lg">
        <FollowUpForm onSubmit={handleCreate} loading={createFollowUp.isPending} />
      </Modal>
    </PageWrapper>
  );
}
