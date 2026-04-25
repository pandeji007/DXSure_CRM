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

const LEADS_QUERY_KEY = 'leads';
const LEAD_SELECT = '*, assigned_to_profile:profiles!leads_assigned_to_fkey(name, email)';

function doesLeadMatchFilters(lead, filters = {}) {
  if (!lead) {
    return false;
  }

  if (filters.status && lead.status !== filters.status) {
    return false;
  }

  if (filters.priority && lead.priority !== filters.priority) {
    return false;
  }

  if (filters.assigned_to && lead.assigned_to !== filters.assigned_to) {
    return false;
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    const haystack = [lead.title, lead.contact_name, lead.company]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (!haystack.includes(searchTerm)) {
      return false;
    }
  }

  return true;
}

export function useLeads(filters = {}) {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase.from('leads').select(LEAD_SELECT).order('created_at', { ascending: false });
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.priority) query = query.eq('priority', filters.priority);
      if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
      if (filters.search) query = query.or(`title.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useLead(id) {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select(LEAD_SELECT).eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lead) => {
      const { data, error } = await supabase.from('leads').insert(lead).select(LEAD_SELECT).single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: LEADS_QUERY_KEY,
        entity: data,
        matchesFilters: doesLeadMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, LEADS_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [LEADS_QUERY_KEY], refetchType: 'active' });
      toast.success('Lead created successfully');
      void logActivity('created_lead', 'lead', data.id, `Created lead: ${data.title}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select(LEAD_SELECT).single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: LEADS_QUERY_KEY,
        entity: data,
        matchesFilters: doesLeadMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, LEADS_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [LEADS_QUERY_KEY], refetchType: 'active' });
      toast.success('Lead updated');
      void logActivity('updated_lead', 'lead', data.id, `Updated lead: ${data.title}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      removeEntityFromQueries({ queryClient: qc, baseKey: LEADS_QUERY_KEY, entityId: id });
      await qc.invalidateQueries({ queryKey: [LEADS_QUERY_KEY], refetchType: 'active' });
      toast.success('Lead deleted');
      void logActivity('deleted_lead', 'lead', id, 'Deleted lead');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (leadId) => {
      const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
      if (!lead) throw new Error('Lead not found');

      const { data: client, error: clientErr } = await supabase.from('clients').insert({
        name: lead.contact_name,
        email: lead.contact_email,
        phone: lead.contact_phone,
        company: lead.company,
        status: 'active',
        source: lead.source,
        notes: `Converted from lead: ${lead.title}`,
      }).select().single();
      if (clientErr) throw clientErr;

      const { error: leadUpdateError } = await supabase
        .from('leads')
        .update({ status: 'converted' })
        .eq('id', leadId);
      if (leadUpdateError) throw leadUpdateError;
      return { lead, client };
    },
    onSuccess: async ({ lead, client }) => {
      const convertedLead = { ...lead, status: 'converted' };

      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: LEADS_QUERY_KEY,
        entity: convertedLead,
        matchesFilters: doesLeadMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, LEADS_QUERY_KEY, convertedLead);

      await Promise.all([
        qc.invalidateQueries({ queryKey: [LEADS_QUERY_KEY], refetchType: 'active' }),
        qc.invalidateQueries({ queryKey: ['clients'], refetchType: 'active' }),
      ]);
      toast.success('Lead converted to client');
      void logActivity(
        'converted_lead',
        'lead',
        lead.id,
        `Converted lead "${lead.title}" to client "${client.name}"`
      );
    },
    onError: (err) => toast.error(err.message),
  });
}
