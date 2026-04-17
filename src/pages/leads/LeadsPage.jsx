import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Search, LayoutGrid, List } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import LeadTable from '../../components/leads/LeadTable';
import LeadForm from '../../components/leads/LeadForm';
import KanbanBoard from '../../components/leads/KanbanBoard';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useLeads, useCreateLead } from '../../hooks/useLeads';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export default function LeadsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table');

  const { data: leads, isLoading } = useLeads({ search });
  const createLead = useCreateLead();

  const handleCreate = async (data) => {
    await createLead.mutateAsync({ ...data, created_by: user?.id || null });
    setShowForm(false);
  };

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Leads</h1>
          <p className="text-sm text-text-secondary mt-1">
            Track and manage your sales pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-elevated rounded-xl border border-border p-1">
            <button
              onClick={() => setView('table')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                view === 'table' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                view === 'kanban' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button icon={Target} onClick={() => setShowForm(true)}>
            Add Lead
          </Button>
        </div>
      </div>

      {view === 'table' && (
        <>
          <div className="flex gap-3 mb-6">
            <Input
              placeholder="Search leads..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-72"
            />
          </div>
          <LeadTable
            data={leads}
            loading={isLoading}
            onRowClick={(row) => navigate(`/leads/${row.id}`)}
            emptyAction={
              <Button icon={Target} onClick={() => setShowForm(true)} size="sm">
                Add First Lead
              </Button>
            }
          />
        </>
      )}

      {view === 'kanban' && <KanbanBoard leads={leads || []} />}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Lead" size="lg">
        <LeadForm onSubmit={handleCreate} loading={createLead.isPending} />
      </Modal>
    </PageWrapper>
  );
}
