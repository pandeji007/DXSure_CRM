import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { toDateInputValue } from '../../lib/utils';

const taskSchema = z.object({
  plan_date: z.string().min(1, 'Date is required'),
  tasks: z.array(z.object({
    title: z.string().min(1, 'Task title is required'),
    completed: z.boolean().optional(),
  })).min(1, 'At least one task is required'),
});

export default function DayPlanForm({ initialData, onSubmit, loading }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      plan_date: initialData?.plan_date || toDateInputValue(),
      tasks: initialData?.tasks || [{ title: '', completed: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'tasks' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Plan Date" type="date" error={errors.plan_date?.message} {...register('plan_date')} />

      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-text-muted mb-2">Tasks</p>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                placeholder={`Task ${index + 1}`}
                error={errors.tasks?.[index]?.title?.message}
                className="flex-1"
                {...register(`tasks.${index}.title`)}
              />
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.tasks?.message && <p className="text-xs text-danger mt-1">{errors.tasks.message}</p>}
        <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={() => append({ title: '', completed: false })} className="mt-2">
          Add Task
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{initialData ? 'Update Plan' : 'Create Plan'}</Button>
      </div>
    </form>
  );
}
