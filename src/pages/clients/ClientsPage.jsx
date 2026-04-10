import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import ClientTable from '../../components/clients/ClientTable';
import ClientForm from '../../components/clients/ClientForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useClients, useCreateClient } from '../../hooks/useClients';
import { CLIENT_STATUSES } from '../../constants';

export default function ClientsPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: clients, isLoading } = useClients({ search, status: statusFilter });
  const createClient = useCreateClient();

  const handleCreate = async (data) => {
    await createClient.mutateAsync(data);
    setShowForm(false);
  };

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Clients</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your client relationships
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => setShowForm(true)}>
          Add Client
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search clients..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-72"
        />
        <Select
          options={[{ value: '', label: 'All Statuses' }, ...CLIENT_STATUSES]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      <ClientTable
        data={clients}
        loading={isLoading}
        onRowClick={(row) => navigate(`/clients/${row.id}`)}
        emptyAction={
          <Button icon={UserPlus} onClick={() => setShowForm(true)} size="sm">
            Add First Client
          </Button>
        }
      />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Client"
        size="lg"
      >
        <ClientForm onSubmit={handleCreate} loading={createClient.isPending} />
      </Modal>
    </PageWrapper>
  );
}
