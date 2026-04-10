import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Mail, Phone, Building, MapPin } from 'lucide-react';
import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import ClientForm from '../../components/clients/ClientForm';
import { useClient, useUpdateClient, useDeleteClient } from '../../hooks/useClients';
import { formatDate } from '../../lib/utils';
import { STATUS_COLORS } from '../../constants';
import { motion } from 'framer-motion';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <PageWrapper>
        <Skeleton variant="heading" className="mb-6" />
        <Skeleton variant="card" className="h-64" />
      </PageWrapper>
    );
  }

  if (!client) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <p className="text-text-muted">Client not found</p>
          <Button variant="ghost" onClick={() => navigate('/clients')} className="mt-4">
            Back to Clients
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const handleUpdate = async (data) => {
    await updateClient.mutateAsync({ id: client.id, ...data });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this client?')) {
      await deleteClient.mutateAsync(client.id);
      navigate('/clients');
    }
  };

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card hover={false}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar name={client.name} size="xl" />
                <div>
                  <h1 className="text-xl font-bold text-text-primary">{client.name}</h1>
                  {client.company && (
                    <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                      <Building className="w-3.5 h-3.5" /> {client.company}
                    </p>
                  )}
                  <Badge color={STATUS_COLORS[client.status] || 'muted'} className="mt-2">
                    {client.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={Edit2} onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" icon={Trash2} onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.email && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-3 rounded-xl bg-elevated">
                  <Mail className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-text-muted">Email</p>
                    <p className="text-sm text-text-primary">{client.email}</p>
                  </div>
                </motion.div>
              )}
              {client.phone && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 p-3 rounded-xl bg-elevated">
                  <Phone className="w-4 h-4 text-secondary" />
                  <div>
                    <p className="text-xs text-text-muted">Phone</p>
                    <p className="text-sm text-text-primary">{client.phone}</p>
                  </div>
                </motion.div>
              )}
              {client.address && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 p-3 rounded-xl bg-elevated md:col-span-2">
                  <MapPin className="w-4 h-4 text-warning" />
                  <div>
                    <p className="text-xs text-text-muted">Address</p>
                    <p className="text-sm text-text-primary">{client.address}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {client.notes && (
              <div className="mt-4 p-3 rounded-xl bg-elevated">
                <p className="text-xs text-text-muted mb-1">Notes</p>
                <p className="text-sm text-text-secondary">{client.notes}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card hover={false}>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-muted">Source</p>
                <p className="text-sm text-text-primary capitalize">{client.source?.replace(/_/g, ' ') || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Created</p>
                <p className="text-sm text-text-primary">{formatDate(client.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Last Updated</p>
                <p className="text-sm text-text-primary">{formatDate(client.updated_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Client" size="lg">
        <ClientForm
          initialData={client}
          onSubmit={handleUpdate}
          loading={updateClient.isPending}
        />
      </Modal>
    </PageWrapper>
  );
}
