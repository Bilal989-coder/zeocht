import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type UserRole = 'explorer' | 'host';

interface RoleContextType {
  activeRole: UserRole | null;
  loading: boolean;
  switchRole: (newRole: UserRole) => Promise<void>;
  refreshRole: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
};

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  const fetchUserRoles = async () => {
  if (!user) {
    setActiveRole(null);
    setLoading(false);
    return;
  }

  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle(); // ✅ important

    if (error) throw error;

    // If role row missing, fallback from profiles.user_type OR default explorer
    if (!data?.role) {
      const { data: p } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .maybeSingle();

      const fallbackRole = (p?.user_type === "host" ? "host" : "explorer") as UserRole;
      setActiveRole(fallbackRole);
      return;
    }

    setActiveRole(data.role as UserRole);
  } catch (err) {
    console.error("Error fetching role:", err);
    setActiveRole("explorer"); // ✅ safe fallback
  } finally {
    setLoading(false);
  }
};


  const refreshRole = async () => {
    setLoading(true);
    await fetchUserRoles();
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) {
      throw new Error("User must be authenticated to switch roles");
    }

    const { error } = await supabase.rpc('switch_user_role', {
      new_role: newRole
    });

    if (error) {
      throw new Error(error.message || "Failed to switch role");
    }

    // Refresh the role after switching
    await refreshRole();
  };

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        loading,
        switchRole,
        refreshRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};
