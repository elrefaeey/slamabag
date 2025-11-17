import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLogin } from '@/pages/AdminLogin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onBackToHome: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  onBackToHome 
}) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق من صلاحية الدخول...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <AdminLogin onBackToHome={onBackToHome} />;
  }

  // If authenticated, show the protected content
  return <>{children}</>;
};
