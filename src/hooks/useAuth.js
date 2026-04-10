import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useAuth() {
  const context = useAuthContext();
  const navigate = useNavigate();

  // Override context default logout to enforce redirect
  const handleLogout = async () => {
    try {
      await context.logout();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error('Failed to log out: ' + error.message);
    }
  };

  // Profile management preserved from previous architecture
  const updateProfile = useMutation({
    mutationFn: async (updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', context.user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(err.message),
  });

  const changePassword = useMutation({
    mutationFn: async (newPassword) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => toast.success('Password changed successfully'),
    onError: (err) => toast.error(err.message),
  });

  return {
    ...context,
    logout: handleLogout,
    updateProfile,
    changePassword,
  };
}

export async function logActivity(action, entity_type, entity_id, description) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      entity_type,
      entity_id,
      description,
    });
  } catch (e) {
    console.error('Failed to log activity:', e);
  }
}
