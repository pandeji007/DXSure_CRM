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

const VENDORS_QUERY_KEY = 'vendors';
const VENDOR_SELECT =
  '*, created_by_profile:profiles!vendors_created_by_fkey(name, email)';

function normalizeVendor(vendor) {
  if (!vendor) {
    return vendor;
  }

  const companyName = vendor.company_name ?? vendor.company ?? null;

  return {
    ...vendor,
    company_name: companyName,
    company: companyName,
    contact_person: vendor.contact_person ?? null,
    service_type: vendor.service_type ?? null,
    city: vendor.city ?? null,
    status: vendor.status || 'active',
  };
}

function normalizeVendorPayload(payload = {}) {
  const nextPayload = {
    ...payload,
  };

  const companyName = payload.company_name ?? payload.company;
  if (companyName !== undefined) {
    nextPayload.company_name = companyName;
  }

  const createdBy = payload.created_by ?? payload.user_id;
  if (createdBy !== undefined) {
    nextPayload.created_by = createdBy;
  }

  delete nextPayload.company;
  delete nextPayload.user_id;

  [
    'email',
    'phone',
    'company_name',
    'contact_person',
    'service_type',
    'address',
    'city',
    'status',
    'notes',
  ].forEach((field) => {
    if (typeof nextPayload[field] === 'string') {
      const normalizedValue = nextPayload[field].trim();
      nextPayload[field] = normalizedValue || null;
    }
  });

  if (!nextPayload.status) {
    nextPayload.status = 'active';
  }

  return nextPayload;
}

function doesVendorMatchFilters(vendor, filters = {}) {
  if (!vendor) {
    return false;
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    const haystack = [
      vendor.name,
      vendor.email,
      vendor.phone,
      vendor.company_name,
      vendor.contact_person,
      vendor.service_type,
      vendor.city,
      vendor.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

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
      let query = supabase.from('vendors').select(VENDOR_SELECT).order('created_at', { ascending: false });
      if (filters.search) {
        query = query.or(
          [
            `name.ilike.%${filters.search}%`,
            `email.ilike.%${filters.search}%`,
            `phone.ilike.%${filters.search}%`,
            `company_name.ilike.%${filters.search}%`,
            `contact_person.ilike.%${filters.search}%`,
            `service_type.ilike.%${filters.search}%`,
            `city.ilike.%${filters.search}%`,
          ].join(',')
        );
      }
      if (filters.status) query = query.eq('status', filters.status);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(normalizeVendor);
    },
  });
}

export function useVendor(id) {
  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('vendors').select(VENDOR_SELECT).eq('id', id).single();
      if (error) throw error;
      return normalizeVendor(data);
    },
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vendor) => {
      const { data, error } = await supabase
        .from('vendors')
        .insert(normalizeVendorPayload(vendor))
        .select(VENDOR_SELECT)
        .single();
      if (error) throw error;
      return normalizeVendor(data);
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: VENDORS_QUERY_KEY,
        entity: data,
        matchesFilters: doesVendorMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, VENDORS_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY], refetchType: 'active' });
      toast.success('Vendor created');
      void logActivity('created_vendor', 'vendor', data.id, `Created vendor: ${data.name}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('vendors')
        .update(normalizeVendorPayload(updates))
        .eq('id', id)
        .select(VENDOR_SELECT)
        .single();
      if (error) throw error;
      return normalizeVendor(data);
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: VENDORS_QUERY_KEY,
        entity: data,
        matchesFilters: doesVendorMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, VENDORS_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY], refetchType: 'active' });
      toast.success('Vendor updated');
      void logActivity('updated_vendor', 'vendor', data.id, `Updated vendor: ${data.name}`);
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
      void logActivity('deleted_vendor', 'vendor', id, 'Deleted vendor');
    },
    onError: (err) => toast.error(err.message),
  });
}
