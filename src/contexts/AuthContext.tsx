// import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
// import { User } from "@supabase/supabase-js";
// import { supabase } from "@/integrations/supabase/client";
// import { toast } from "sonner";

// type UserRole = "explorer" | "guide" | "host";

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<{ error: any }>;
//   signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: any }>;
//   loginWithGoogle: () => Promise<{ error: any }>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const getRedirectUrl = () => {
//   const appUrl = import.meta.env.VITE_APP_URL;
//   return `${appUrl}/auth/callback`;
// };
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;

//     // 1) Initial session check
//     (async () => {
//       const { data } = await supabase.auth.getSession();
//       if (!mounted) return;
//       setUser(data.session?.user ?? null);
//       setLoading(false);
//     })();

//     // 2) Listener for session changes
//     const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//       // after initial load, always keep loading false
//       setLoading(false);
//     });

//     return () => {
//       mounted = false;
//       authListener.subscription.unsubscribe();
//     };
//   }, []);

//   const login = async (email: string, password: string) => {
//     try {
//       setLoading(true);
//       const { error } = await supabase.auth.signInWithPassword({ email, password });

//       if (error) return { error };

//       toast.success("Signed in successfully!");
//       return { error: null };
//     } catch (err) {
//       return { error: err };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const signup = async (email: string, password: string, name: string, role: UserRole) => {
//     try {
//       setLoading(true);

//       // ✅ Better: use /auth/callback for email redirect as well
//       const redirectUrl = `${import.meta.env.VITE_APP_URL}/auth/callback`;

//       const { error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           emailRedirectTo: redirectUrl,
//           data: {
//             full_name: name,
//             role, // used by trigger if you have it
//           },
//         },
//       });

//       if (error) return { error };

//       toast.success("Account created successfully!");
//       return { error: null };
//     } catch (err) {
//       return { error: err };
//     } finally {
//       setLoading(false);
//     }
//   };

// //   const loginWithGoogle = async (): Promise<{ error: any }> => {
// //     try {
// //       setLoading(true);

// //       // const { error } = await signInWithOAuth({
// //       //   provider: "google",
// //       //   options: {
// //       //     redirectTo: `${window.location.origin}/auth/callback`,
// //       //   },
// //       // });

// //       // if (error) return { error };

// //       supabase.auth.signInWithOAuth({
// //   provider: "google",
// //   options: {
// //     redirectTo: `${window.location.origin}/auth/callback`,
// //   },
// // });

// //       // OAuth redirect will happen, so no toast needed here (optional)
// //       return { error: null };
// //     } catch (err) {
// //       return { error: err };
// //     } finally {
// //       // page usually redirects; but keep safe
// //       setLoading(false);
// //     }
// //   };
  

//   const loginWithGoogle = async (): Promise<{ error: any }> => {
//   try {
//     setLoading(true);

//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
//       },
//     });

//     if (error) return { error };
//     return { error: null };
//   } catch (err) {
//     return { error: err };
//   } finally {
//     setLoading(false);
//   }
// };

//   const logout = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     toast.success("Signed out successfully");
//     window.location.href = "/";
//   };

//   const isAuthenticated = useMemo(() => !!user, [user]);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         signup,
//         loginWithGoogle,
//         logout,
//         isAuthenticated,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type UserRole = "explorer" | "guide" | "host";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: any }>;
  loginWithGoogle: () => Promise<{ error: any }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1) Initial session check
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    // 2) Listener for session changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // after initial load, always keep loading false
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) return { error };

      toast.success("Signed in successfully!");
      return { error: null };
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setLoading(true);

      // ✅ Better: use /auth/callback for email redirect as well
     const redirectUrl = `${import.meta.env.VITE_APP_URL}/auth/callback`;


      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
            role, // used by trigger if you have it
          },
        },
      });

      if (error) return { error };

      toast.success("Account created successfully!");
      return { error: null };
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<{ error: any }> => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
        },
      });

      if (error) return { error };

      // OAuth redirect will happen, so no toast needed here (optional)
      return { error: null };
    } catch (err) {
      return { error: err };
    } finally {
      // page usually redirects; but keep safe
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Signed out successfully");
    window.location.href = "/";
  };

  const isAuthenticated = useMemo(() => !!user, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
