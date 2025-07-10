import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: ('student' | 'management')[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  allowedRoles = ['student', 'management'],
  redirectTo = '/auth',
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user's role is not allowed, redirect to appropriate dashboard
  if (!allowedRoles.includes(user.role as any)) {
    const defaultRoute = user.role === 'management' ? '/school-dashboard' : '/student-dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  // If user is authenticated and has the right role, render the child routes
  return <Outlet />;
};
