import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { removeEntityFromQueries, sortByDateField, upsertEntityInListQueries } from '../lib/queryCache';
import toast from 'react-hot-toast';
import { logActivity } from './useAuth';

const FOLLOWUPS_QUERY_KEY = 'followups';
const FOLLOW_UP_SELECT = `
  *,
  client:clients(name),
  lead:leads(title, contact_name),
  profile:profiles!follow_ups_user_id_fkey(name)
`;

function getFollowUpUserId(filters = {}) {
  return filters.user_id ?? filters.created_by;
}

function doesFollowUpMatchFilters(followUp, filters = {}) {
  if (!followUp) {
    return false;
  }

  if (filters.status && followUp.status !== filters.status) {
    return false;
  }

  if (filters.type && followUp.type !== filters.type) {
    return false;
  }

  const userId = getFollowUpUserId(filters);
  if (userId && followUp.user_id !== userId) {
    return false;
  }

  if (filters.date_from && new Date(followUp.scheduled_at) < new Date(filters.date_from)) {
    return false;
  }

  if (filters.date_to && new Date(followUp.scheduled_at) > new Date(filters.date_to)) {
    return false;
  }

  return true;
}

export function useFollowUps(filters = {}) {
  return useQuery({
    queryKey: [FOLLOWUPS_QUERY_KEY, filters || {}],
    enabled: filters !== null,

    queryFn: async () => {
      let query = supabase
        .from('follow_ups')
        .select(FOLLOW_UP_SELECT)
        .order('scheduled_at', { ascending: true });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.type) query = query.eq('type', filters.type);
      if (getFollowUpUserId(filters)) query = query.eq('user_id', getFollowUpUserId(filters));
      if (filters?.date_from) query = query.gte('scheduled_at', filters.date_from);
      if (filters?.date_to) query = query.lte('scheduled_at', filters.date_to);

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    },
  });
}
export function useCreateFollowUp() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (followUp) => {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert(followUp)
        .select(FOLLOW_UP_SELECT)
        .single();

      if (error) throw error;

      return data;
    },

    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: FOLLOWUPS_QUERY_KEY,
        entity: data,
        matchesFilters: doesFollowUpMatchFilters,
        sortItems: sortByDateField('scheduled_at', 'asc'),
      });
      await qc.invalidateQueries({ queryKey: [FOLLOWUPS_QUERY_KEY], refetchType: 'active' });

      toast.success('Follow-up scheduled');

      if (data?.id) {
        void logActivity('created_followup', 'follow_up', data.id, 'Created follow-up');
      }
    },

    onError: (err) => {
      toast.error(err.message);
    },
  });
}

export function useUpdateFollowUp() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('follow_ups')
        .update(updates)
        .eq('id', id)
        .select(FOLLOW_UP_SELECT)
        .single();

      if (error) throw error;

      return data;
    },

    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: FOLLOWUPS_QUERY_KEY,
        entity: data,
        matchesFilters: doesFollowUpMatchFilters,
        sortItems: sortByDateField('scheduled_at', 'asc'),
      });
      await qc.invalidateQueries({ queryKey: [FOLLOWUPS_QUERY_KEY], refetchType: 'active' });

      if (!data) return;

      const isCompleted = data.status === 'completed';

      toast.success(isCompleted ? 'Follow-up completed' : 'Follow-up updated');

      logActivity(
        isCompleted ? 'completed_followup' : 'updated_followup',
        'follow_up',
        data.id,
        'Follow-up updated'
      );
    },

    onError: (err) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('follow_ups').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      removeEntityFromQueries({ queryClient: qc, baseKey: FOLLOWUPS_QUERY_KEY, entityId: id });
      await qc.invalidateQueries({ queryKey: [FOLLOWUPS_QUERY_KEY], refetchType: 'active' });
      toast.success('Follow-up deleted');
    },
    onError: (err) => toast.error(err.message),
  });
}
