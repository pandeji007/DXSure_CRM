import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { TICKET_PRIORITIES } from '../../constants';
import { useEmployees } from '../../hooks/useEmployees';
import { useClients } from '../../hooks/useClients';

const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.string().optional(),
  assigned_to: z.string().min(1, 'Please assign to an employee'),
  due_date: z.string().optional(),
  client_id: z.string().optional(),
});

export default function TicketForm({ initialData, onSubmit, loading }) {
  const { data: employees } = useEmployees();
  const { data: clients } = useClients();
  const employeeOptions = (employees || []).map((e) => ({ value: e.id, label: e.name }));
  const clientOptions = (clients || []).map((client) => ({ value: client.id, label: client.name }));

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      assigned_to: initialData?.assigned_to || '',
      due_date: initialData?.due_date?.split('T')[0] || '',
      client_id: initialData?.client_id || '',
    },
  });

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      client_id: data.client_id || null,
      due_date: data.due_date || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input label="Title" placeholder="Fix login bug" error={errors.title?.message} {...register('title')} />
      <Textarea label="Description" placeholder="Detailed description..." error={errors.description?.message} {...register('description')} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Priority" options={TICKET_PRIORITIES} {...register('priority')} />
        <Select label="Assign To" options={employeeOptions} placeholder="Select employee..." error={errors.assigned_to?.message} {...register('assigned_to')} />
        <Select label="Client" options={clientOptions} placeholder="Select client..." {...register('client_id')} />
        <Input label="Due Date" type="date" {...register('due_date')} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{initialData ? 'Update Ticket' : 'Create Ticket'}</Button>
      </div>
    </form>
  );
}
