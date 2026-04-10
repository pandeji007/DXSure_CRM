import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Edit2, Trash2, UserCheck, DollarSign, Calendar, Briefcase, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import LeadForm from '../../components/leads/LeadForm';
import { useLead, useUpdateLead, useDeleteLead, useConvertLead } from '../../hooks/useLeads';
import { formatDate, formatCurrency } from '../../lib/utils';
import { STATUS_COLORS } from '../../constants';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLead();
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <PageWrapper>
        <Skeleton variant="heading" className="mb-6" />
        <Skeleton variant="card" className="h-64" />
      </PageWrapper>
    );
  }

  if (!lead) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <p className="text-text-muted">Lead not found</p>
          <Button variant="ghost" onClick={() => navigate('/leads')} className="mt-4">Back to Leads</Button>
        </div>
      </PageWrapper>
    );
  }

  const handleUpdate = async (data) => {
    await updateLead.mutateAsync({ id: lead.id, ...data });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await deleteLead.mutateAsync(lead.id);
      navigate('/leads');
    }
  };

  const handleConvert = async () => {
    if (confirm('Convert this lead to a client?')) {
      await convertLead.mutateAsync(lead.id);
      navigate('/clients');
    }
  };

  const infoItems = [
    { icon: Mail, label: 'Email', value: lead.contact_email, color: 'text-primary' },
    { icon: Phone, label: 'Phone', value: lead.contact_phone, color: 'text-secondary' },
    { icon: Briefcase, label: 'Company', value: lead.company, color: 'text-warning' },
    { icon: DollarSign, label: 'Deal Value', value: lead.value ? formatCurrency(lead.value) : null, color: 'text-success' },
    { icon: Calendar, label: 'Expected Close', value: formatDate(lead.expected_close_date), color: 'text-primary' },
  ].filter(item => item.value && item.value !== '—');

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card hover={false}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-text-primary">{lead.title}</h1>
                <p className="text-sm text-text-secondary mt-1">{lead.contact_name}</p>
                <div className="flex gap-2 mt-2">
                  <Badge color={STATUS_COLORS[lead.status] || 'muted'}>{lead.status?.replace(/_/g, ' ')}</Badge>
                  <Badge color={STATUS_COLORS[lead.priority] || 'muted'} variant="outline">{lead.priority}</Badge>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {lead.status !== 'converted' && lead.status !== 'lost' && (
                  <Button variant="secondary" size="sm" icon={UserCheck} onClick={handleConvert} loading={convertLead.isPending}>
                    Convert
                  </Button>
                )}
                <Button variant="ghost" size="sm" icon={Edit2} onClick={() => setEditing(true)}>Edit</Button>
                <Button variant="danger" size="sm" icon={Trash2} onClick={handleDelete}>Delete</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {infoItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-elevated"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <div>
                    <p className="text-xs text-text-muted">{item.label}</p>
                    <p className="text-sm text-text-primary">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {lead.notes && (
              <div className="mt-4 p-3 rounded-xl bg-elevated">
                <p className="text-xs text-text-muted mb-1">Notes</p>
                <p className="text-sm text-text-secondary">{lead.notes}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card hover={false}>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-muted">Source</p>
                <p className="text-sm text-text-primary capitalize">{lead.source?.replace(/_/g, ' ') || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Assigned To</p>
                <p className="text-sm text-text-primary">{lead.assigned_to_profile?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Created</p>
                <p className="text-sm text-text-primary">{formatDate(lead.created_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Lead" size="lg">
        <LeadForm initialData={lead} onSubmit={handleUpdate} loading={updateLead.isPending} />
      </Modal>
    </PageWrapper>
  );
}
