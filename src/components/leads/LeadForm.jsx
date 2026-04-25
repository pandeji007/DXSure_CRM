import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { LEAD_STATUSES, LEAD_PRIORITIES, LEAD_SOURCES } from '../../constants';
import { useEmployees } from '../../hooks/useEmployees';
import { useAuth } from '../../hooks/useAuth';

const leadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Invalid email').or(z.literal('')).optional(),
  contact_phone: z.string().optional(),
  company: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  source: z.string().optional(),
  value: z.string().optional(),
  expected_close_date: z.string().optional(),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
});

export default function LeadForm({ initialData, onSubmit, loading }) {
  const { user, isAdmin } = useAuth();
  const { data: employees } = useEmployees();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      title: initialData?.title || '',
      contact_name: initialData?.contact_name || '',
      contact_email: initialData?.contact_email || '',
      contact_phone: initialData?.contact_phone || '',
      company: initialData?.company || '',
      status: initialData?.status || 'new',
      priority: initialData?.priority || 'medium',
      source: initialData?.source || '',
      value: initialData?.value?.toString() || '',
      expected_close_date: initialData?.expected_close_date?.split('T')[0] || '',
      assigned_to: initialData?.assigned_to || '',
      notes: initialData?.notes || '',
    },
  });

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      value: data.value ? parseFloat(data.value) : null,
      expected_close_date: data.expected_close_date || null,
      assigned_to: isAdmin ? data.assigned_to || null : user?.id || null,
    });
  };

  const employeeOptions = (employees || []).map((e) => ({ value: e.id, label: e.name }));

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Lead Title" placeholder="Website Redesign Project" error={errors.title?.message} {...register('title')} />
        <Input label="Contact Name" placeholder="John Doe" error={errors.contact_name?.message} {...register('contact_name')} />
        <Input label="Contact Email" type="email" placeholder="john@company.com" error={errors.contact_email?.message} {...register('contact_email')} />
        <Input label="Contact Phone" placeholder="+91 98765 43210" {...register('contact_phone')} />
        <Input label="Company" placeholder="Acme Corp" {...register('company')} />
        <Input label="Deal Value (₹)" type="number" placeholder="50000" {...register('value')} />
        <Select label="Status" options={LEAD_STATUSES} {...register('status')} />
        <Select label="Priority" options={LEAD_PRIORITIES} {...register('priority')} />
        <Select label="Source" options={LEAD_SOURCES} {...register('source')} />
        {isAdmin && (
          <Select label="Assigned To" options={employeeOptions} placeholder="Select employee..." {...register('assigned_to')} />
        )}
        <Input label="Expected Close Date" type="date" {...register('expected_close_date')} />
      </div>
      <Textarea label="Notes" placeholder="Additional details..." rows={3} {...register('notes')} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}
