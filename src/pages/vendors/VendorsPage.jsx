import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '../../hooks/useVendors';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const VENDOR_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const VENDOR_STATUS_COLORS = {
  active: 'success',
  inactive: 'muted',
};

const vendorSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  contact_person: z.string().optional(),
  email: z.string().trim().email('Invalid email').or(z.literal('')).optional(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  service_type: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

function VendorForm({ initialData, onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: initialData?.name || '',
      contact_person: initialData?.contact_person || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company_name: initialData?.company_name || initialData?.company || '',
      service_type: initialData?.service_type || '',
      city: initialData?.city || '',
      address: initialData?.address || '',
      status: initialData?.status || 'active',
      notes: initialData?.notes || '',
    },
  });

  useEffect(() => {
    reset({
      name: initialData?.name || '',
      contact_person: initialData?.contact_person || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company_name: initialData?.company_name || initialData?.company || '',
      service_type: initialData?.service_type || '',
      city: initialData?.city || '',
      address: initialData?.address || '',
      status: initialData?.status || 'active',
      notes: initialData?.notes || '',
    });
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Input label="Contact Person" {...register('contact_person')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Phone" {...register('phone')} />
        <Input label="Company" {...register('company_name')} />
        <Input label="Service Type" {...register('service_type')} />
        <Input label="City" {...register('city')} />
      </div>
      <Input label="Address" {...register('address')} />
      <Select label="Status" options={VENDOR_STATUS_OPTIONS} {...register('status')} />
      <Textarea label="Notes" rows={3} {...register('notes')} />
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Vendor' : 'Add Vendor'}
        </Button>
      </div>
    </form>
  );
}

export default function VendorsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editVendor, setEditVendor] = useState(null);

  const { data: vendors, isLoading } = useVendors({ search, status: statusFilter || undefined });
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

  const handleDelete = async (vendor) => {
    const shouldDelete = window.confirm(`Delete vendor "${vendor.name}"? This action cannot be undone.`);

    if (!shouldDelete) {
      return;
    }

    await deleteVendor.mutateAsync(vendor.id);

    if (editVendor?.id === vendor.id) {
      setEditVendor(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Vendor',
        sortable: true,
        render: (value, row) => (
          <div>
            <p className="font-medium text-text-primary">{value}</p>
            <p className="text-xs text-text-muted">{row.contact_person || row.email || '—'}</p>
          </div>
        ),
      },
      {
        key: 'company_name',
        label: 'Company',
        render: (value, row) => (
          <div>
            <p className="text-sm text-text-primary">{value || '—'}</p>
            <p className="text-xs text-text-muted">{row.service_type || '—'}</p>
          </div>
        ),
      },
      {
        key: 'phone',
        label: 'Contact',
        render: (value, row) => (
          <div>
            <p className="text-sm text-text-primary">{value || '—'}</p>
            <p className="text-xs text-text-muted">{row.city || '—'}</p>
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (value) => (
          <Badge color={VENDOR_STATUS_COLORS[value] || 'muted'}>
            {value || 'inactive'}
          </Badge>
        ),
      },
      {
        key: 'created_at',
        label: 'Added',
        sortable: true,
        render: (value) => <span className="text-xs text-text-muted">{formatDate(value)}</span>,
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_, row) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={Edit2}
              onClick={(event) => {
                event.stopPropagation();
                setEditVendor(row);
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={Trash2}
              loading={deleteVendor.isPending && deleteVendor.variables === row.id}
              onClick={(event) => {
                event.stopPropagation();
                void handleDelete(row);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [deleteVendor.isPending, deleteVendor.variables]
  );

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search vendors..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-80"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={VENDOR_STATUS_OPTIONS}
            placeholder="All statuses"
            className="sm:w-48"
          />
        </div>
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
