import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from './useAuth';

export function useEmployees(filters = {}) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (filters.role) query = query.eq('role', filters.role);
      if (filters.department) query = query.eq('department', filters.department);
      if (filters.search) query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useEmployee(id) {
  return useQuery({
    queryKey: ['employees', id],
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
      // Use frontend signup because admin.createUser requires a service role key.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
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
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee created');
      logActivity('created_employee', 'employee', data.id, `Created employee: ${data.name}`);
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated');
    },
    onError: (err) => toast.error(err.message),
  });
}
