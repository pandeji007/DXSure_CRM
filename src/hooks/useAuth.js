import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured, supabaseConfigMessage } from '../lib/supabase';
import { queryClient } from '../lib/queryClient';
import { useAuthContext } from '../store/authStore';
import { ACTIVITY_LOGS_QUERY_KEY } from './useActivityLogs';

function getAuthConfigError() {
  return new Error(supabaseConfigMessage);
}

function getRedirectPath(location) {
  const requestedPath = location.state?.from?.pathname;

  if (!requestedPath || requestedPath === '/login') {
    return '/dashboard';
  }

  return requestedPath;
}

export function useAuth() {
  const context = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (loginId, password) => {
    if (!isSupabaseConfigured) {
      const error = getAuthConfigError();
      toast.error(error.message);
      throw error;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginId.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data?.user) {
        throw new Error('Login succeeded but no user session was returned.');
      }

      const profile = await context.refreshProfile(data.user);

      if (!profile?.role || !['admin', 'employee'].includes(profile.role)) {
        throw new Error('Your account does not have a valid CRM role assigned.');
      }

      await logActivity('user_login', 'auth', data.user.id, `Signed in as ${profile.role}`);

      navigate(getRedirectPath(location), { replace: true });
      toast.success(`Signed in as ${profile.role}`);

      return { user: data.user, profile };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(`Failed to log out: ${error.message}`);
      throw error;
    }
  };

  const updateProfile = useMutation({
    mutationFn: async (updates) => {
      if (!context.user) {
        throw new Error('You must be logged in to update your profile.');
      }

      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', context.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: async () => {
      await context.refreshProfile();
      toast.success('Profile updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const changePassword = useMutation({
    mutationFn: async (newPassword) => {
      if (!isSupabaseConfigured) {
        throw getAuthConfigError();
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });

  return {
    ...context,
    login,
    logout,
    updateProfile,
    changePassword,
  };
}

export async function logActivity(action, entity_type, entity_id, description) {
  try {
    if (!isSupabaseConfigured) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } = await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      entity_type,
      entity_id,
      description,
    });

    if (error) {
      throw error;
    }

    await queryClient.invalidateQueries({
      queryKey: [ACTIVITY_LOGS_QUERY_KEY],
      refetchType: 'active',
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
