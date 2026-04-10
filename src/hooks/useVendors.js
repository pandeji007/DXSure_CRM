import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useVendors(filters = {}) {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: async () => {
      let query = supabase.from('vendors').select('*').order('created_at', { ascending: false });
      if (filters.search) query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useVendor(id) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('vendors').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vendor) => {
      const { data, error } = await supabase.from('vendors').insert(vendor).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from('vendors').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor updated');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted');
    },
    onError: (err) => toast.error(err.message),
  });
}
