import { useState } from 'react';
import { Store, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Card from '../../components/ui/Card';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '../../hooks/useVendors';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

function VendorForm({ initialData, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company: initialData?.company || '',
      address: initialData?.address || '',
      notes: initialData?.notes || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" {...register('email')} />
        <Input label="Phone" {...register('phone')} />
        <Input label="Company" {...register('company')} />
      </div>
      <Input label="Address" {...register('address')} />
      <Textarea label="Notes" rows={3} {...register('notes')} />
      <div className="flex justify-end"><Button type="submit" loading={loading}>{initialData ? 'Update' : 'Add Vendor'}</Button></div>
    </form>
  );
}

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company' },
  {
    key: 'created_at',
    label: 'Added',
    render: (v) => <span className="text-xs text-text-muted">{formatDate(v)}</span>,
  },
];

export default function VendorsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editVendor, setEditVendor] = useState(null);

  const { data: vendors, isLoading } = useVendors({ search });
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const handleCreate = async (data) => {
    await createVendor.mutateAsync({ ...data, created_by: user?.id || null });
    setShowForm(false);
  };

  const handleUpdate = async (data) => {
    await updateVendor.mutateAsync({ id: editVendor.id, ...data });
    setEditVendor(null);
  };

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Vendors</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your vendor relationships</p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm(true)}>Add Vendor</Button>
      </div>

      <div className="mb-6">
        <Input placeholder="Search vendors..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} className="sm:w-72" />
      </div>

      <Table
        columns={columns}
        data={vendors}
        loading={isLoading}
        onRowClick={(row) => setEditVendor(row)}
        emptyTitle="No vendors"
        emptyDescription="Add vendors to track your business partners."
        emptyAction={<Button icon={Plus} onClick={() => setShowForm(true)} size="sm">Add Vendor</Button>}
      />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Vendor" size="lg">
        <VendorForm onSubmit={handleCreate} loading={createVendor.isPending} />
      </Modal>

      <Modal isOpen={!!editVendor} onClose={() => setEditVendor(null)} title="Edit Vendor" size="lg">
        {editVendor && <VendorForm initialData={editVendor} onSubmit={handleUpdate} loading={updateVendor.isPending} />}
      </Modal>
    </PageWrapper>
  );
}
