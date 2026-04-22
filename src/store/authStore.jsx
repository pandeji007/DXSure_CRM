import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // DEV BYPASS: Hardcode user and profile to skip the login screen
  const [user, setUser] = useState({ id: 'dummy-dev-id', email: 'admin@dxsure.com' });
  const [profile, setProfile] = useState({ id: 'dummy-dev-id', name: 'Admin User', role: 'admin', email: 'admin@dxsure.com' });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    // Just mock success immediately
    console.log("Mock login triggered");
    return { user: { id: 'dummy-dev-id' } };
  };

  const logout = async () => {
    // Mock logout
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    role: profile?.role,
    isAdmin: profile?.role === 'admin',
    isLoading,
    login,
    logout,
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
