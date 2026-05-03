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

const TICKETS_QUERY_KEY = 'tickets';
const TICKET_LIST_SELECT =
  '*, assigned_to_profile:profiles!tickets_assigned_to_fkey(name, email), created_by_profile:profiles!tickets_created_by_fkey(name), client:clients(name)';
const TICKET_DETAIL_SELECT = `${TICKET_LIST_SELECT}, comments:ticket_comments(*, profile:profiles!ticket_comments_user_id_fkey(name))`;

function normalizeTicket(ticket) {
  if (!ticket) {
    return ticket;
  }

  const status = ticket.status === 'open' ? 'pending' : ticket.status;
  const completedAt =
    status === 'completed'
      ? ticket.completed_at || ticket.updated_at || new Date().toISOString()
      : ticket.completed_at ?? null;

  return {
    ...ticket,
    status,
    completed_at: completedAt,
  };
}

function normalizeTicketPayload(payload = {}) {
  const nextPayload = {
    ...payload,
  };

  const createdBy = payload.created_by ?? payload.user_id;
  if (createdBy !== undefined) {
    nextPayload.created_by = createdBy;
  }

  delete nextPayload.user_id;

  if (nextPayload.status === 'completed' && !nextPayload.completed_at) {
    nextPayload.completed_at = new Date().toISOString();
  }

  if (nextPayload.status && nextPayload.status !== 'completed' && nextPayload.completed_at === undefined) {
    nextPayload.completed_at = null;
  }

  return nextPayload;
}

function doesTicketMatchFilters(ticket, filters = {}) {
  if (!ticket) {
    return false;
  }

  if (filters.status && ticket.status !== filters.status) {
    return false;
  }

  if (filters.priority && ticket.priority !== filters.priority) {
    return false;
  }

  if (filters.assigned_to && ticket.assigned_to !== filters.assigned_to) {
    return false;
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    const haystack = [ticket.title, ticket.description].filter(Boolean).join(' ').toLowerCase();

    if (!haystack.includes(searchTerm)) {
      return false;
    }
  }

  return true;
}

export function useTickets(filters = {}) {
  return useQuery({
    queryKey: [TICKETS_QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(TICKET_LIST_SELECT)
        .order('created_at', { ascending: false });
      if (filters.status === 'pending') {
        query = query.in('status', ['pending', 'open']);
      } else if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) query = query.eq('priority', filters.priority);
      if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
      if (filters.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(normalizeTicket);
    },
  });
}

export function useTicket(id, filters = {}) {
  return useQuery({
    queryKey: [TICKETS_QUERY_KEY, id, filters],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(TICKET_DETAIL_SELECT)
        .eq('id', id);

      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      const { data, error } = await query.single();
      if (error) throw error;
      return normalizeTicket(data);
    },
    enabled: !!id && (!filters.requireAssignedTo || !!filters.assigned_to),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ticket) => {
      const { data, error } = await supabase
        .from('tickets')
        .insert(normalizeTicketPayload(ticket))
        .select(TICKET_LIST_SELECT)
        .single();
      if (error) throw error;
      return normalizeTicket(data);
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: TICKETS_QUERY_KEY,
        entity: data,
        matchesFilters: doesTicketMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, TICKETS_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [TICKETS_QUERY_KEY], refetchType: 'active' });
      toast.success('Ticket created');
      void logActivity('created_ticket', 'ticket', data.id, `Created ticket: ${data.title}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('tickets')
        .update(normalizeTicketPayload(updates))
        .eq('id', id)
        .select(TICKET_LIST_SELECT)
        .single();
      if (error) throw error;
      return normalizeTicket(data);
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: TICKETS_QUERY_KEY,
        entity: data,
        matchesFilters: doesTicketMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, TICKETS_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [TICKETS_QUERY_KEY], refetchType: 'active' });
      toast.success('Ticket updated');
      const action = data.status === 'completed' ? 'completed_ticket' : 'updated_ticket';
      void logActivity(
        action,
        'ticket',
        data.id,
        `${action === 'completed_ticket' ? 'Completed' : 'Updated'} ticket: ${data.title}`
      );
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
    onSuccess: async (id) => {
      removeEntityFromQueries({ queryClient: qc, baseKey: TICKETS_QUERY_KEY, entityId: id });
      await qc.invalidateQueries({ queryKey: [TICKETS_QUERY_KEY], refetchType: 'active' });
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
    onSuccess: async (data) => {
      await qc.invalidateQueries({ queryKey: [TICKETS_QUERY_KEY, data.ticket_id], refetchType: 'active' });
      toast.success('Comment added');
    },
    onError: (err) => toast.error(err.message),
  });
}
