import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from './useAuth';

export function useTickets(filters = {}) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      let query = supabase.from('tickets').select('*, assigned_to_profile:profiles!tickets_assigned_to_fkey(name)').order('created_at', { ascending: false });
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.priority) query = query.eq('priority', filters.priority);
      if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
      if (filters.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useTicket(id) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('tickets').select('*, assigned_to_profile:profiles!tickets_assigned_to_fkey(name, email), comments:ticket_comments(*, profile:profiles(name))').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ticket) => {
      const { data, error } = await supabase.from('tickets').insert(ticket).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket created');
      logActivity('created_ticket', 'ticket', data.id, `Created ticket: ${data.title}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from('tickets').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket updated');
      const action = data.status === 'completed' ? 'completed_ticket' : 'updated_ticket';
      logActivity(action, 'ticket', data.id, `${action === 'completed_ticket' ? 'Completed' : 'Updated'} ticket: ${data.title}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('tickets').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket deleted');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useAddTicketComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticket_id, content, user_id }) => {
      const { data, error } = await supabase.from('ticket_comments').insert({ ticket_id, content, user_id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tickets', data.ticket_id] });
      toast.success('Comment added');
    },
    onError: (err) => toast.error(err.message),
  });
}
