import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from './useAuth';

export function useClients(filters = {}) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: async () => {
      let query = supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.search) query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useClient(id) {
  return useQuery({
    queryKey: ['clients', id],
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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created successfully');
      logActivity('created_client', 'client', data.id, `Created client: ${data.name}`);
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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client updated successfully');
      logActivity('updated_client', 'client', data.id, `Updated client: ${data.name}`);
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
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted');
      logActivity('deleted_client', 'client', id, 'Deleted client');
    },
    onError: (err) => toast.error(err.message),
  });
}
