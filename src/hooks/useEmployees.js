import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createEphemeralSupabaseClient, supabase } from '../lib/supabase';
import {
  mergeEntityDetailQuery,
  sortByDateField,
  upsertEntityInListQueries,
} from '../lib/queryCache';
import toast from 'react-hot-toast';
import { logActivity } from './useAuth';

const EMPLOYEES_QUERY_KEY = 'employees';

function doesEmployeeMatchFilters(employee, filters = {}) {
  if (!employee) {
    return false;
  }

  if (filters.role && employee.role !== filters.role) {
    return false;
  }

  if (filters.department && employee.department !== filters.department) {
    return false;
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    const haystack = [employee.name, employee.email].filter(Boolean).join(' ').toLowerCase();

    if (!haystack.includes(searchTerm)) {
      return false;
    }
  }

  return true;
}

export function useEmployees(filters = {}) {
  return useQuery({
    queryKey: [EMPLOYEES_QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (filters.role) query = query.eq('role', filters.role);
      if (filters.department) query = query.eq('department', filters.department);
      if (filters.search) query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useEmployee(id) {
  return useQuery({
    queryKey: [EMPLOYEES_QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password, name, phone, department, role }) => {
      const signupClient = createEphemeralSupabaseClient();

      const { data: authData, error: authError } = await signupClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            department,
            role: role || 'employee',
          },
        },
      });
      if (authError) throw authError;
      if (!authData?.user?.id) {
        throw new Error('Unable to create employee user. Please verify Supabase auth configuration.');
      }

      const { data, error } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        email,
        name,
        phone,
        department,
        role: role || 'employee',
        updated_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: EMPLOYEES_QUERY_KEY,
        entity: data,
        matchesFilters: doesEmployeeMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, EMPLOYEES_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY], refetchType: 'active' });
      toast.success('Employee created');
      void logActivity('created_employee', 'employee', data.id, `Created employee: ${data.name}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      upsertEntityInListQueries({
        queryClient: qc,
        baseKey: EMPLOYEES_QUERY_KEY,
        entity: data,
        matchesFilters: doesEmployeeMatchFilters,
        sortItems: sortByDateField('created_at'),
      });
      mergeEntityDetailQuery(qc, EMPLOYEES_QUERY_KEY, data);
      await qc.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY], refetchType: 'active' });
      toast.success('Employee updated');
    },
    onError: (err) => toast.error(err.message),
  });
}
