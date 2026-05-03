import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { removeEntityFromQueries, sortByDateField, upsertEntityInListQueries } from '../lib/queryCache';
import { calculateFinanceTotals, normalizeFinanceEntries, normalizeFinanceEntry } from '../lib/finance';
import toast from 'react-hot-toast';
import { logActivity } from './useAuth';

const FINANCE_QUERY_KEY = 'finance';
const FINANCE_ENTRY_SELECT =
  '*, client:clients(name), profile:profiles!finance_entries_created_by_fkey(name)';

function doesFinanceEntryMatchFilters(entry, filters = {}) {
  if (!entry) {
    return false;
  }

  const createdBy = filters.created_by ?? filters.user_id;

  if (filters.type && entry.type !== filters.type) {
    return false;
  }

  if (createdBy && entry.created_by !== createdBy) {
    return false;
  }

  if (filters.date_from && entry.entry_date < filters.date_from) {
    return false;
  }

  if (filters.date_to && entry.entry_date > filters.date_to) {
    return false;
  }

  return true;
}

export function useFinanceEntries(filters = {}) {
  return useQuery({
    queryKey: [FINANCE_QUERY_KEY, filters],
    enabled: filters !== null,
    queryFn: async () => {
      const createdBy = filters.created_by ?? filters.user_id;
      let query = supabase
        .from('finance_entries')
        .select(FINANCE_ENTRY_SELECT)
        .order('entry_date', { ascending: false });
      if (filters.type) query = query.eq('type', filters.type);
      if (createdBy) query = query.eq('created_by', createdBy);
      if (filters.date_from) query = query.gte('entry_date', filters.date_from);
      if (filters.date_to) query = query.lte('entry_date', filters.date_to);
      const { data, error } = await query;
      if (error) throw error;
      return normalizeFinanceEntries(data || []);
    },
  });
}

export function useCreateFinanceEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry) => {
      const payload = {
        ...entry,
        amount: Math.abs(Number(entry.amount ?? 0)),
      };
      const { data, error } = await supabase
        .from('finance_entries')
        .insert(payload)
        .select(FINANCE_ENTRY_SELECT)
        .single();
      if (error) throw error;
      return normalizeFinanceEntry(data);
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: FINANCE_QUERY_KEY,
        entity: data,
        matchesFilters: doesFinanceEntryMatchFilters,
        sortItems: sortByDateField('entry_date'),
      });
      await qc.invalidateQueries({ queryKey: [FINANCE_QUERY_KEY], refetchType: 'active' });
      toast.success('Entry recorded');
      const action = data.direction === 'inflow' ? 'recorded_payment' : 'recorded_petty_cash';
      void logActivity(action, 'finance', data.id, `Recorded ${data.type}: ${data.amount}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateFinanceEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const payload = {
        ...updates,
      };

      if (payload.amount != null) {
        payload.amount = Math.abs(Number(payload.amount));
      }

      const { data, error } = await supabase
        .from('finance_entries')
        .update(payload)
        .eq('id', id)
        .select(FINANCE_ENTRY_SELECT)
        .single();
      if (error) throw error;
      return normalizeFinanceEntry(data);
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: FINANCE_QUERY_KEY,
        entity: data,
        matchesFilters: doesFinanceEntryMatchFilters,
        sortItems: sortByDateField('entry_date'),
      });
      await qc.invalidateQueries({ queryKey: [FINANCE_QUERY_KEY], refetchType: 'active' });
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
    onSuccess: async (id) => {
      removeEntityFromQueries({ queryClient: qc, baseKey: FINANCE_QUERY_KEY, entityId: id });
      await qc.invalidateQueries({ queryKey: [FINANCE_QUERY_KEY], refetchType: 'active' });
      toast.success('Entry deleted');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useFinanceStats(filters = {}) {
  return useQuery({
    queryKey: [FINANCE_QUERY_KEY, 'stats', filters],
    enabled: filters !== null,
    queryFn: async () => {
      const createdBy = filters.created_by ?? filters.user_id;
      let query = supabase.from('finance_entries').select('type, amount, entry_date');
      if (createdBy) query = query.eq('created_by', createdBy);
      if (filters.date_from) query = query.gte('entry_date', filters.date_from);
      if (filters.date_to) query = query.lte('entry_date', filters.date_to);
      const { data, error } = await query;
      if (error) throw error;
      const totals = calculateFinanceTotals(data || []);
      return {
        income: totals.inflow,
        expenses: totals.outflow,
        net: totals.net,
        entries: totals.entries,
      };
    },
  });
}
