import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, onAuthStateChange, signInAdmin, signOutAdmin } from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const authUser = await signInAdmin(email, password);
      setUser(authUser);
    } catch (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOutAdmin();
      setUser(null);
    } catch (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
