import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Search } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import TicketTable from '../../components/tickets/TicketTable';
import TicketForm from '../../components/tickets/TicketForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useTickets, useCreateTicket } from '../../hooks/useTickets';
import { useAuth } from '../../hooks/useAuth';
import { TICKET_STATUSES } from '../../constants';
import { cn } from '../../lib/utils';

export default function TicketsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('');

  const { data: tickets, isLoading } = useTickets({ search, status: statusTab || undefined });
  const createTicket = useCreateTicket();

  const handleCreate = async (data) => {
    await createTicket.mutateAsync(data);
    setShowForm(false);
  };

  const tabs = [{ value: '', label: 'All' }, ...TICKET_STATUSES];

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Tickets</h1>
          <p className="text-sm text-text-secondary mt-1">Track and manage task assignments</p>
        </div>
        {isAdmin && (
          <Button icon={Ticket} onClick={() => setShowForm(true)}>Create Ticket</Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusTab(tab.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
              statusTab === tab.value
                ? 'bg-primary text-white border-primary'
                : 'bg-transparent text-text-secondary border-border hover:text-text-primary hover:border-border-hover'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <Input placeholder="Search tickets..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} className="sm:w-72" />
      </div>

      <TicketTable
        data={tickets}
        loading={isLoading}
        onRowClick={(row) => navigate(`/tickets/${row.id}`)}
        emptyAction={isAdmin && <Button icon={Ticket} onClick={() => setShowForm(true)} size="sm">Create First Ticket</Button>}
      />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Ticket" size="lg">
        <TicketForm onSubmit={handleCreate} loading={createTicket.isPending} />
      </Modal>
    </PageWrapper>
  );
}
