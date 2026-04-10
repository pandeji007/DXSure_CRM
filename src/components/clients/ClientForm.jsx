import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { CLIENT_STATUSES, LEAD_SOURCES } from '../../constants';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  phone: z.string().min(10, 'Phone must be at least 10 characters').or(z.literal('')),
  company: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export default function ClientForm({ initialData, onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company: initialData?.company || '',
      status: initialData?.status || 'active',
      source: initialData?.source || '',
      address: initialData?.address || '',
      notes: initialData?.notes || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" placeholder="john@company.com" error={errors.email?.message} {...register('email')} />
        <Input label="Phone" placeholder="+91 98765 43210" error={errors.phone?.message} {...register('phone')} />
        <Input label="Company" placeholder="Acme Corp" {...register('company')} />
        <Select label="Status" options={CLIENT_STATUSES} error={errors.status?.message} {...register('status')} />
        <Select label="Source" options={LEAD_SOURCES} {...register('source')} />
      </div>
      <Input label="Address" placeholder="123 Main St, City" {...register('address')} />
      <Textarea label="Notes" placeholder="Any additional notes..." rows={3} {...register('notes')} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
}
