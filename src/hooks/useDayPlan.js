import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import {
  mergeEntityDetailQuery,
  removeEntityFromQueries,
  sortByDateField,
  upsertEntityInListQueries,
} from '../lib/queryCache';
import toast from 'react-hot-toast';
import { logActivity } from './useAuth';

const DAYPLANS_QUERY_KEY = 'dayplans';
const DAYPLAN_SELECT = '*, profile:profiles!day_plans_user_id_fkey(name)';

function doesDayPlanMatchFilters(plan, filters = {}) {
  if (!plan) {
    return false;
  }

  if (filters.status && plan.status !== filters.status) {
    return false;
  }

  if (filters.user_id && plan.user_id !== filters.user_id) {
    return false;
  }

  if (filters.date && plan.plan_date !== filters.date) {
    return false;
  }

  return true;
}

export function useDayPlans(filters = {}) {
  return useQuery({
    queryKey: [DAYPLANS_QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase.from('day_plans').select(DAYPLAN_SELECT).order('plan_date', { ascending: false });
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.user_id) query = query.eq('user_id', filters.user_id);
      if (filters.date) query = query.eq('plan_date', filters.date);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useDayPlan(id) {
  return useQuery({
    queryKey: [DAYPLANS_QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('day_plans').select(DAYPLAN_SELECT).eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDayPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan) => {
      const { data, error } = await supabase.from('day_plans').insert(plan).select(DAYPLAN_SELECT).single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: DAYPLANS_QUERY_KEY,
        entity: data,
        matchesFilters: doesDayPlanMatchFilters,
        sortItems: sortByDateField('plan_date'),
      });
      mergeEntityDetailQuery(qc, DAYPLANS_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [DAYPLANS_QUERY_KEY], refetchType: 'active' });
      toast.success('Day plan created');
      void logActivity('created_day_plan', 'day_plan', data.id, 'Created day plan');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateDayPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('day_plans')
        .update(updates)
        .eq('id', id)
        .select(DAYPLAN_SELECT)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: DAYPLANS_QUERY_KEY,
        entity: data,
        matchesFilters: doesDayPlanMatchFilters,
        sortItems: sortByDateField('plan_date'),
      });
      mergeEntityDetailQuery(qc, DAYPLANS_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [DAYPLANS_QUERY_KEY], refetchType: 'active' });
      const msg = data.status === 'submitted' ? 'Day plan submitted' : data.status === 'approved' ? 'Day plan approved' : 'Day plan updated';
      toast.success(msg);
      if (data.status === 'submitted') void logActivity('submitted_day_plan', 'day_plan', data.id, 'Submitted day plan');
      if (data.status === 'approved') void logActivity('approved_day_plan', 'day_plan', data.id, 'Approved day plan');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteDayPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('day_plans').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      removeEntityFromQueries({ queryClient: qc, baseKey: DAYPLANS_QUERY_KEY, entityId: id });
      await qc.invalidateQueries({ queryKey: [DAYPLANS_QUERY_KEY], refetchType: 'active' });
      toast.success('Day plan deleted');
    },
    onError: (err) => toast.error(err.message),
  });
}
