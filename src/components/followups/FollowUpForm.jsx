import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { FOLLOWUP_TYPES } from '../../constants';
import { useClients } from '../../hooks/useClients';
import { useLeads } from '../../hooks/useLeads';

const followUpSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  scheduled_at: z.string().min(1, 'Schedule date is required'),
  notes: z.string().optional(),
  client_id: z.string().optional(),
  lead_id: z.string().optional(),
});

export default function FollowUpForm({ initialData, onSubmit, loading }) {
  const { data: clients } = useClients();
  const { data: leads } = useLeads();

  const clientOptions = (clients || []).map((c) => ({ value: c.id, label: c.name }));
  const leadOptions = (leads || []).filter(l => l.status !== 'converted' && l.status !== 'lost').map((l) => ({ value: l.id, label: `${l.title} (${l.contact_name})` }));

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      type: initialData?.type || '',
      scheduled_at: initialData?.scheduled_at?.slice(0, 16) || '',
      notes: initialData?.notes || '',
      client_id: initialData?.client_id || '',
      lead_id: initialData?.lead_id || '',
    },
  });

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      client_id: data.client_id || null,
      lead_id: data.lead_id || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Type" options={FOLLOWUP_TYPES} error={errors.type?.message} {...register('type')} />
        <Input label="Scheduled At" type="datetime-local" error={errors.scheduled_at?.message} {...register('scheduled_at')} />
        <Select label="Client" options={clientOptions} placeholder="Select client..." {...register('client_id')} />
        <Select label="Lead" options={leadOptions} placeholder="Select lead..." {...register('lead_id')} />
      </div>
      <Textarea label="Notes" placeholder="Follow-up details..." rows={3} {...register('notes')} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{initialData ? 'Update' : 'Schedule Follow-Up'}</Button>
      </div>
    </form>
  );
}
