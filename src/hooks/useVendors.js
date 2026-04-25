import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { removeEntityFromQueries, sortByDateField, upsertEntityInListQueries } from '../lib/queryCache';
import toast from 'react-hot-toast';

const VENDORS_QUERY_KEY = 'vendors';

function doesVendorMatchFilters(vendor, filters = {}) {
  if (!vendor) {
    return false;
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    const haystack = [vendor.name, vendor.email].filter(Boolean).join(' ').toLowerCase();

    if (!haystack.includes(searchTerm)) {
      return false;
    }
  }

  return true;
}

export function useVendors(filters = {}) {
  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase.from('vendors').select('*').order('created_at', { ascending: false });
      if (filters.search) query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useVendor(id) {
  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, id],
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
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: VENDORS_QUERY_KEY,
        entity: data,
        matchesFilters: doesVendorMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      await qc.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY], refetchType: 'active' });
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
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: VENDORS_QUERY_KEY,
        entity: data,
        matchesFilters: doesVendorMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      await qc.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY], refetchType: 'active' });
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
    onSuccess: async (id) => {
      removeEntityFromQueries({ queryClient: qc, baseKey: VENDORS_QUERY_KEY, entityId: id });
      await qc.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY], refetchType: 'active' });
      toast.success('Vendor deleted');
    },
    onError: (err) => toast.error(err.message),
  });
}
