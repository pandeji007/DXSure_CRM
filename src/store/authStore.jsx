import { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function getDefaultProfileValues(user) {
  const email = user?.email ?? '';
  const fallbackName = email ? email.split('@')[0] : 'User';

  return {
    id: user.id,
    email,
    name: user.user_metadata?.name || fallbackName,
    phone: user.user_metadata?.phone || null,
    department: user.user_metadata?.department || null,
    role: user.user_metadata?.role || user.app_metadata?.role || 'employee',
  };
}

async function loadOrCreateProfile(user) {
  const { data: existingProfile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (existingProfile) {
    return existingProfile;
  }

  const fallbackProfile = getDefaultProfileValues(user);
  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .upsert(fallbackProfile)
    .select()
    .single();

  if (createError) {
    throw createError;
  }

  return createdProfile;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async (targetUser = user) => {
    if (!targetUser || !isSupabaseConfigured) {
      setProfile(null);
      return null;
    }

    const nextProfile = await loadOrCreateProfile(targetUser);
    setProfile(nextProfile);
    return nextProfile;
  };

  useEffect(() => {
    let isMounted = true;
    let requestId = 0;

    const syncSession = async (nextSession) => {
      requestId += 1;
      const currentRequestId = requestId;

      if (!isMounted) {
        return;
      }

      setSession(nextSession ?? null);

      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const nextProfile = await loadOrCreateProfile(nextUser);

        if (!isMounted || currentRequestId !== requestId) {
          return;
        }

        setProfile(nextProfile);
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load auth profile:', error);
          setProfile(null);
        }
      } finally {
        if (isMounted && currentRequestId === requestId) {
          setIsLoading(false);
        }
      }
    };

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to restore auth session:', error);
        }

        return syncSession(data?.session ?? null);
      })
      .catch((error) => {
        console.error('Failed to initialize auth session:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    role: profile?.role ?? null,
    isAdmin: profile?.role === 'admin',
    isLoading,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}
