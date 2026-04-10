import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from './useAuth';

export function useFinanceEntries(filters = {}) {
  return useQuery({
    queryKey: ['finance', filters],
    queryFn: async () => {
      let query = supabase.from('finance_entries').select('*, client:clients(name), profile:profiles!finance_entries_recorded_by_fkey(name)').order('entry_date', { ascending: false });
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.date_from) query = query.gte('entry_date', filters.date_from);
      if (filters.date_to) query = query.lte('entry_date', filters.date_to);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFinanceEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry) => {
      const { data, error } = await supabase.from('finance_entries').insert(entry).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['finance'] });
      toast.success('Entry recorded');
      const action = data.type === 'payment' ? 'recorded_payment' : 'recorded_petty_cash';
      logActivity(action, 'finance', data.id, `Recorded ${data.type}: ${data.amount}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateFinanceEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from('finance_entries').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance'] });
      toast.success('Entry updated');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteFinanceEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('finance_entries').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance'] });
      toast.success('Entry deleted');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useFinanceStats() {
  return useQuery({
    queryKey: ['finance', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('finance_entries').select('type, amount, entry_date');
      if (error) throw error;
      const income = data.filter(e => e.type === 'payment').reduce((s, e) => s + (e.amount || 0), 0);
      const expenses = data.filter(e => e.type !== 'payment').reduce((s, e) => s + (e.amount || 0), 0);
      return { income, expenses, net: income - expenses, entries: data };
    },
  });
}
