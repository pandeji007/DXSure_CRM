import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { PAYMENT_METHODS, FINANCE_TYPES } from '../../constants';
import { useClients } from '../../hooks/useClients';
import { toDateInputValue } from '../../lib/utils';

const paymentSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((value) => {
      const numericAmount = Number(value);
      return Number.isFinite(numericAmount) && numericAmount > 0;
    }, 'Amount must be greater than 0'),
  entry_date: z.string().min(1, 'Date is required'),
  payment_method: z.string().optional(),
  client_id: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
});

export default function PaymentForm({ initialData, onSubmit, loading, allowedTypes = FINANCE_TYPES, showClientField = true }) {
  const { data: clients } = useClients();
  const clientOptions = (clients || []).map((c) => ({ value: c.id, label: c.name }));
  const typeOptions = allowedTypes.length ? allowedTypes : FINANCE_TYPES;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      type: initialData?.type || typeOptions[0]?.value || 'payment',
      amount: initialData?.amount?.toString() || '',
      entry_date: initialData?.entry_date?.split('T')[0] || toDateInputValue(),
      payment_method: initialData?.payment_method || '',
      client_id: initialData?.client_id || '',
      description: initialData?.description || '',
      reference: initialData?.reference || '',
    },
  });

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      amount: Math.abs(parseFloat(data.amount)),
      payment_method: data.payment_method || null,
      client_id: data.client_id || null,
      description: data.description || null,
      reference: data.reference || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Type" options={typeOptions} error={errors.type?.message} {...register('type')} />
        <Input label="Amount (₹)" type="number" placeholder="10000" error={errors.amount?.message} {...register('amount')} />
        <Input label="Date" type="date" error={errors.entry_date?.message} {...register('entry_date')} />
        <Select label="Payment Method" options={PAYMENT_METHODS} {...register('payment_method')} />
        {showClientField && (
          <Select label="Client" options={clientOptions} placeholder="Select client..." {...register('client_id')} />
        )}
        <Input label="Reference / Invoice #" placeholder="INV-001" {...register('reference')} />
      </div>
      <Textarea label="Description" placeholder="Payment details..." rows={3} {...register('description')} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{initialData ? 'Update' : 'Record Entry'}</Button>
      </div>
    </form>
  );
}
