import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useEmployees, useCreateEmployee } from '../../hooks/useEmployees';
import { DEPARTMENTS, ROLES } from '../../constants';
import { formatDate } from '../../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
});

function EmployeeForm({ onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: { role: 'employee' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Full Name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
        <Input label="Phone" {...register('phone')} />
        <Select label="Department" options={DEPARTMENTS} {...register('department')} />
        <Select label="Role" options={ROLES} {...register('role')} />
      </div>
      <div className="flex justify-end"><Button type="submit" loading={loading}>Create Employee</Button></div>
    </form>
  );
}

const columns = [
  {
    key: 'name',
    label: 'Employee',
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <Avatar name={value} src={row.avatar_url} size="sm" />
        <div>
          <p className="font-medium text-text-primary">{value}</p>
          <p className="text-xs text-text-muted">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    label: 'Role',
    render: (value) => <Badge color={value === 'admin' ? 'info' : 'muted'} variant="outline">{value}</Badge>,
  },
  {
    key: 'department',
    label: 'Department',
    render: (value) => <span className="text-text-secondary capitalize">{value?.replace(/_/g, ' ') || '—'}</span>,
  },
  { key: 'phone', label: 'Phone', render: (v) => <span className="text-text-secondary">{v || '—'}</span> },
  {
    key: 'created_at',
    label: 'Joined',
    sortable: true,
    render: (value) => <span className="text-xs text-text-muted">{formatDate(value)}</span>,
  },
];

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const { data: employees, isLoading } = useEmployees({ search });
  const createEmployee = useCreateEmployee();

  const handleCreate = async (data) => {
    await createEmployee.mutateAsync(data);
    setShowForm(false);
  };

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Employees</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your team members</p>
        </div>
        <Button icon={UserPlus} onClick={() => setShowForm(true)}>Add Employee</Button>
      </div>

      <div className="mb-6">
        <Input placeholder="Search employees..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} className="sm:w-72" />
      </div>

      <Table
        columns={columns}
        data={employees}
        loading={isLoading}
        onRowClick={(row) => navigate(`/employees/${row.id}`)}
        emptyTitle="No employees"
        emptyDescription="Add employees to your team."
        emptyAction={<Button icon={UserPlus} onClick={() => setShowForm(true)} size="sm">Add Employee</Button>}
      />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Employee" size="lg">
        <EmployeeForm onSubmit={handleCreate} loading={createEmployee.isPending} />
      </Modal>
    </PageWrapper>
  );
}
