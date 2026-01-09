import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('explorer' | 'host')[];
}

export const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { activeRole, loading: roleLoading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for both auth and role to load
    if (authLoading || roleLoading) return;

    // Redirect to login if not authenticated
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    // Check role authorization
    if (activeRole && !allowedRoles.includes(activeRole)) {
      const redirectPath = activeRole === 'explorer' 
        ? '/explorer/dashboard' 
        : '/guide/dashboard';
      
      toast.error("Access denied. You don't have permission to access this page.");
      navigate(redirectPath, { replace: true });
    }
  }, [user, activeRole, authLoading, roleLoading, allowedRoles, navigate]);

  // Show loading state while checking authentication and role
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not authorized
  if (!user || (activeRole && !allowedRoles.includes(activeRole))) {
    return null;
  }

  return <>{children}</>;
};
