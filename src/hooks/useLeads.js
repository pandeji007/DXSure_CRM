import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from './useAuth';

export function useLeads(filters = {}) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      let query = supabase.from('leads').select('*, assigned_to_profile:profiles!leads_assigned_to_fkey(name)').order('created_at', { ascending: false });
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.priority) query = query.eq('priority', filters.priority);
      if (filters.search) query = query.or(`title.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useLead(id) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*, assigned_to_profile:profiles!leads_assigned_to_fkey(name, email)').eq('id', id).single();
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
      const { data, error } = await supabase.from('leads').insert(lead).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
      logActivity('created_lead', 'lead', data.id, `Created lead: ${data.title}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated');
      logActivity('updated_lead', 'lead', data.id, `Updated lead: ${data.title}`);
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
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted');
      logActivity('deleted_lead', 'lead', id, 'Deleted lead');
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

      await supabase.from('leads').update({ status: 'converted', converted_client_id: client.id }).eq('id', leadId);
      return { lead, client };
    },
    onSuccess: ({ lead, client }) => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Lead converted to client');
      logActivity('converted_lead', 'lead', lead.id, `Converted lead "${lead.title}" to client "${client.name}"`);
    },
    onError: (err) => toast.error(err.message),
  });
}
