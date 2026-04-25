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

const CLIENTS_QUERY_KEY = 'clients';

function doesClientMatchFilters(client, filters = {}) {
  if (!client) {
    return false;
  }

  if (filters.status && client.status !== filters.status) {
    return false;
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    const haystack = [client.name, client.email, client.company]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (!haystack.includes(searchTerm)) {
      return false;
    }
  }

  return true;
}

export function useClients(filters = {}) {
  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.search) query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useClient(id) {
  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (client) => {
      const { data, error } = await supabase.from('clients').insert(client).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: CLIENTS_QUERY_KEY,
        entity: data,
        matchesFilters: doesClientMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, CLIENTS_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY], refetchType: 'active' });
      toast.success('Client created successfully');
      void logActivity('created_client', 'client', data.id, `Created client: ${data.name}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: CLIENTS_QUERY_KEY,
        entity: data,
        matchesFilters: doesClientMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, CLIENTS_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY], refetchType: 'active' });
      toast.success('Client updated successfully');
      void logActivity('updated_client', 'client', data.id, `Updated client: ${data.name}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      removeEntityFromQueries({ queryClient: qc, baseKey: CLIENTS_QUERY_KEY, entityId: id });
      await qc.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY], refetchType: 'active' });
      toast.success('Client deleted');
      void logActivity('deleted_client', 'client', id, 'Deleted client');
    },
    onError: (err) => toast.error(err.message),
  });
}
