import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useActivityLogs(filters = {}) {
  return useQuery({
    queryKey: ['activity_logs', filters],
    queryFn: async () => {
      let query = supabase.from('activity_logs').select('*, profile:profiles!activity_logs_user_id_fkey(name, email)').order('created_at', { ascending: false }).limit(filters.limit || 100);
      if (filters.user_id) query = query.eq('user_id', filters.user_id);
      if (filters.action) query = query.eq('action', filters.action);
      if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
      if (filters.date_from) query = query.gte('created_at', filters.date_from);
      if (filters.date_to) query = query.lte('created_at', filters.date_to);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ['activity_logs', 'recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase.from('activity_logs').select('*, profile:profiles!activity_logs_user_id_fkey(name)').order('created_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return data;
    },
  });
}
