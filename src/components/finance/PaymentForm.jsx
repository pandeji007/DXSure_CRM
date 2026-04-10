import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { PAYMENT_METHODS, FINANCE_TYPES } from '../../constants';
import { useClients } from '../../hooks/useClients';

const paymentSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  amount: z.string().min(1, 'Amount is required'),
  entry_date: z.string().min(1, 'Date is required'),
  payment_method: z.string().optional(),
  client_id: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
});

export default function PaymentForm({ initialData, onSubmit, loading }) {
  const { data: clients } = useClients();
  const clientOptions = (clients || []).map((c) => ({ value: c.id, label: c.name }));

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      type: initialData?.type || 'payment',
      amount: initialData?.amount?.toString() || '',
      entry_date: initialData?.entry_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      payment_method: initialData?.payment_method || '',
      client_id: initialData?.client_id || '',
      description: initialData?.description || '',
      reference: initialData?.reference || '',
    },
  });

  const onFormSubmit = (data) => {
    onSubmit({ ...data, amount: parseFloat(data.amount), client_id: data.client_id || null });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Type" options={FINANCE_TYPES} error={errors.type?.message} {...register('type')} />
        <Input label="Amount (₹)" type="number" placeholder="10000" error={errors.amount?.message} {...register('amount')} />
        <Input label="Date" type="date" error={errors.entry_date?.message} {...register('entry_date')} />
        <Select label="Payment Method" options={PAYMENT_METHODS} {...register('payment_method')} />
        <Select label="Client" options={clientOptions} placeholder="Select client..." {...register('client_id')} />
        <Input label="Reference / Invoice #" placeholder="INV-001" {...register('reference')} />
      </div>
      <Textarea label="Description" placeholder="Payment details..." rows={3} {...register('description')} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{initialData ? 'Update' : 'Record Entry'}</Button>
      </div>
    </form>
  );
}
