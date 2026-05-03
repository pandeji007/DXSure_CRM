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
import { normalizeLeadSource } from '../lib/leads';

const LEADS_QUERY_KEY = 'leads';
const LEAD_SELECT = [
  '*',
  'assigned_to_profile:profiles!leads_assigned_to_fkey(name, email)',
  'created_by_profile:profiles!leads_created_by_fkey(name, email)',
  'converted_client:clients!leads_converted_client_id_fkey(name)',
].join(', ');

function normalizeLead(lead) {
  if (!lead) {
    return lead;
  }

  return {
    ...lead,
    source: normalizeLeadSource(lead.source, {
      fallback: lead.source ? 'other' : null,
    }),
    status: lead.status || 'new',
    priority: lead.priority || 'medium',
    created_by: lead.created_by ?? null,
    converted_client_id: lead.converted_client_id ?? null,
  };
}

function normalizeLeadPayload(payload = {}) {
  const nextPayload = {
    ...payload,
  };

  const createdBy = payload.created_by ?? payload.user_id;
  if (createdBy !== undefined) {
    nextPayload.created_by = createdBy;
  }

  delete nextPayload.user_id;

  [
    'title',
    'contact_name',
    'contact_email',
    'contact_phone',
    'company',
    'status',
    'priority',
    'notes',
  ].forEach((field) => {
    if (typeof nextPayload[field] === 'string') {
      const normalizedValue = nextPayload[field].trim();
      nextPayload[field] = normalizedValue || null;
    }
  });

  nextPayload.source = normalizeLeadSource(nextPayload.source, { fallback: 'other' });

  if (nextPayload.value != null && nextPayload.value !== '') {
    const numericValue = Number(nextPayload.value);
    nextPayload.value = Number.isFinite(numericValue) ? numericValue : null;
  } else {
    nextPayload.value = null;
  }

  if (nextPayload.expected_close_date === '') {
    nextPayload.expected_close_date = null;
  }

  if (nextPayload.assigned_to === '') {
    nextPayload.assigned_to = null;
  }

  if (!nextPayload.status) {
    nextPayload.status = 'new';
  }

  if (!nextPayload.priority) {
    nextPayload.priority = 'medium';
  }

  return nextPayload;
}

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
    const haystack = [lead.title, lead.contact_name, lead.contact_email, lead.company]
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
      if (filters.search) {
        query = query.or(
          [
            `title.ilike.%${filters.search}%`,
            `contact_name.ilike.%${filters.search}%`,
            `contact_email.ilike.%${filters.search}%`,
            `company.ilike.%${filters.search}%`,
          ].join(',')
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(normalizeLead);
    },
  });
}

export function useLead(id, filters = {}) {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, id, filters],
    queryFn: async () => {
      let query = supabase.from('leads').select(LEAD_SELECT).eq('id', id);

      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return normalizeLead(data);
    },
    enabled: !!id && (!filters.requireAssignedTo || !!filters.assigned_to),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lead) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(normalizeLeadPayload(lead))
        .select(LEAD_SELECT)
        .single();
      if (error) throw error;
      return normalizeLead(data);
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
      const { data, error } = await supabase
        .from('leads')
        .update(normalizeLeadPayload(updates))
        .eq('id', id)
        .select(LEAD_SELECT)
        .single();
      if (error) throw error;
      return normalizeLead(data);
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
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .maybeSingle();
      if (leadError) throw leadError;
      if (!lead) throw new Error('Lead not found');
      if (lead.status === 'converted' && lead.converted_client_id) {
        throw new Error('Lead is already converted');
      }

      const normalizedLead = normalizeLead(lead);
      const { data: client, error: clientErr } = await supabase
        .from('clients')
        .insert({
          name: normalizedLead.contact_name,
          email: normalizedLead.contact_email,
          phone: normalizedLead.contact_phone,
          company: normalizedLead.company,
          status: 'active',
          source: normalizeLeadSource(normalizedLead.source, { fallback: null }),
          notes: `Converted from lead: ${normalizedLead.title}`,
          assigned_to: normalizedLead.assigned_to ?? null,
          created_by: normalizedLead.created_by ?? normalizedLead.assigned_to ?? null,
        })
        .select()
        .single();
      if (clientErr) throw clientErr;

      const { data: convertedLead, error: leadUpdateError } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          converted_client_id: client.id,
        })
        .eq('id', leadId)
        .select(LEAD_SELECT)
        .single();
      if (leadUpdateError) throw leadUpdateError;
      return { lead: normalizeLead(convertedLead), client };
    },
    onSuccess: async ({ lead, client }) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: LEADS_QUERY_KEY,
        entity: lead,
        matchesFilters: doesLeadMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, LEADS_QUERY_KEY, lead);

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
