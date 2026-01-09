// // import { useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { supabase } from "@/integrations/supabase/client";
// // import { useRole } from "@/contexts/RoleContext";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { Globe2 } from "lucide-react";

// // const AuthCallback = () => {
// //   const navigate = useNavigate();
// //   const { refreshRole, activeRole } = useRole();
// //   const { isAuthenticated } = useAuth();

// //   useEffect(() => {
// //     const run = async () => {
// //       const qs = new URLSearchParams(window.location.search);

// //       const error = qs.get("error");
// //       const errorDesc = qs.get("error_description");
// //       if (error) {
// //         navigate(`/?oauth_error=${encodeURIComponent(errorDesc || error)}`, { replace: true });
// //         return;
// //       }

// //       // PKCE flow returns ?code=
// //       const code = qs.get("code");
// //       if (code) {
// //         const { error } = await supabase.auth.exchangeCodeForSession(code);
// //         if (error) {
// //           navigate(`/?oauth_error=${encodeURIComponent(error.message)}`, { replace: true });
// //           return;
// //         }
// //       }

// //       // ensure role is loaded
// //       await refreshRole();
// //     };

// //     run();
// //   }, [navigate, refreshRole]);

// //   useEffect(() => {
// //     if (!isAuthenticated) return;
// //     if (!activeRole) return;

// //     navigate(activeRole === "host" ? "/guide/dashboard" : "/explorer/dashboard", { replace: true });
// //   }, [isAuthenticated, activeRole, navigate]);

// //   return (
// //     <div className="min-h-screen bg-background flex items-center justify-center">
// //       <div className="text-center">
// //         <Globe2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
// //         <p className="text-muted-foreground">Signing you in...</p>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AuthCallback;

// // import { useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { supabase } from "@/integrations/supabase/client";
// // import { useRole } from "@/contexts/RoleContext";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { Globe2 } from "lucide-react";

// // const AuthCallback = () => {
// //   const navigate = useNavigate();
// //   const { refreshRole, activeRole } = useRole();
// //   const { isAuthenticated } = useAuth();

// //   useEffect(() => {
// //     const run = async () => {
// //       // 1) Handle provider errors
// //       const qs = new URLSearchParams(window.location.search);
// //       const error = qs.get("error");
// //       const errorDesc = qs.get("error_description");
// //       if (error) {
// //         navigate(`/?oauth_error=${encodeURIComponent(errorDesc || error)}`, { replace: true });
// //         return;
// //       }

// //       // 2) PKCE flow: ?code=
// //       const code = qs.get("code");
// //       if (code) {
// //         const { error } = await supabase.auth.exchangeCodeForSession(code);
// //         if (error) {
// //           navigate(`/?oauth_error=${encodeURIComponent(error.message)}`, { replace: true });
// //           return;
// //         }
// //       }

// //       // 3) Implicit flow: #access_token=...&refresh_token=...
// //       if (window.location.hash?.includes("access_token=")) {
// //         const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
// //         const access_token = hashParams.get("access_token");
// //         const refresh_token = hashParams.get("refresh_token");

// //         if (access_token && refresh_token) {
// //           const { error } = await supabase.auth.setSession({ access_token, refresh_token });
// //           if (error) {
// //             navigate(`/?oauth_error=${encodeURIComponent(error.message)}`, { replace: true });
// //             return;
// //           }
// //         }

// //         // Clean URL (remove tokens from address bar)
// //         window.history.replaceState({}, document.title, window.location.pathname);
// //       }

// //       // 4) Load role
// //       await refreshRole();
// //     };

// //     run();
// //   }, [navigate, refreshRole]);

// //   useEffect(() => {
// //     if (!isAuthenticated) return;
// //     if (!activeRole) return;

// //     navigate(activeRole === "host" ? "/guide/dashboard" : "/explorer/dashboard", { replace: true });
// //   }, [isAuthenticated, activeRole, navigate]);

// //   return (
// //     <div className="min-h-screen bg-background flex items-center justify-center">
// //       <div className="text-center">
// //         <Globe2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
// //         <p className="text-muted-foreground">Signing you in...</p>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AuthCallback;

// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { useRole } from "@/contexts/RoleContext";
// import { Globe2 } from "lucide-react";

// const AuthCallback = () => {
//   const navigate = useNavigate();
//   const { refreshRole, activeRole } = useRole();

//   useEffect(() => {
//     const run = async () => {
//       // 1) Provider error handling
//       const qs = new URLSearchParams(window.location.search);
//       const err = qs.get("error");
//       const errDesc = qs.get("error_description");
//       if (err) {
//         navigate(`/?oauth_error=${encodeURIComponent(errDesc || err)}`, { replace: true });
//         return;
//       }

//       // 2) PKCE flow (?code=)
//       const code = qs.get("code");
//       if (code) {
//         const { error } = await supabase.auth.exchangeCodeForSession(code);
//         if (error) {
//           navigate(`/?oauth_error=${encodeURIComponent(error.message)}`, { replace: true });
//           return;
//         }
//       }

//       // 3) Implicit flow (#access_token=...&refresh_token=...)
//       if (window.location.hash?.includes("access_token=")) {
//         const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
//         const access_token = hashParams.get("access_token");
//         const refresh_token = hashParams.get("refresh_token");

//         if (access_token && refresh_token) {
//           const { error } = await supabase.auth.setSession({ access_token, refresh_token });
//           if (error) {
//             navigate(`/?oauth_error=${encodeURIComponent(error.message)}`, { replace: true });
//             return;
//           }
//         }

//         // Clean URL (remove tokens from address bar)
//         window.history.replaceState({}, document.title, window.location.pathname);
//       }

//       // 4) Load role
//       await refreshRole();
//     };

//     run();
//   }, [navigate, refreshRole]);

//   useEffect(() => {
//     if (!activeRole) return;
//     navigate(activeRole === "host" ? "/guide/dashboard" : "/explorer/dashboard", { replace: true });
//   }, [activeRole, navigate]);

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center">
//       <div className="text-center">
//         <Globe2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
//         <p className="text-muted-foreground">Signing you in...</p>
//       </div>
//     </div>
//   );
// };

// export default AuthCallback;
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";

// export default function AuthCallback() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     let mounted = true;

//     const run = async () => {
//       // This will read the hash (#access_token=...) and set session in storage
//       const { data, error } = await supabase.auth.getSession();

//       if (!mounted) return;

//       if (error || !data.session) {
//         // if something goes wrong, send user to auth page
//         navigate("/auth", { replace: true });
//         return;
//       }

//       // ✅ session set successfully
//       navigate("/", { replace: true }); // ya role-based redirect
//     };

//     run();

//     return () => {
//       mounted = false;
//     };
//   }, [navigate]);

//   return (
//     <div style={{ padding: 20 }}>
//       <p>Signing you in...</p>
//     </div>
//   );
// }

// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";

// export default function AuthCallback() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const run = async () => {
//       try {
//         const url = new URL(window.location.href);
//         const code = url.searchParams.get("code");

//         // ✅ New PKCE flow (if code exists)
//         if (code) {
//           const { error } = await supabase.auth.exchangeCodeForSession(code);
//           if (error) throw error;
//         } else {
//           // ✅ Old implicit flow (hash has access_token)
//           const hash = window.location.hash?.replace("#", "");
//           if (hash) {
//             const params = new URLSearchParams(hash);
//             const access_token = params.get("access_token");
//             const refresh_token = params.get("refresh_token");

//             if (access_token && refresh_token) {
//               const { error } = await supabase.auth.setSession({
//                 access_token,
//                 refresh_token,
//               });
//               if (error) throw error;
//             }
//           }
//         }

//         // ✅ Clean URL (optional but recommended)
//         window.history.replaceState({}, document.title, "/");

//         // ✅ Get user + role and navigate
//         const { data: sessionData } = await supabase.auth.getSession();
//         const user = sessionData.session?.user;

//         const role =
//           (user?.user_metadata?.role as string | undefined)?.toLowerCase() ??
//           "explorer";

//         if (role === "host") {
//           navigate("/host", { replace: true }); // ✅ change to your host dashboard route
//         } else {
//           navigate("/explore", { replace: true }); // ✅ change to your explore dashboard route
//         }
//       } catch (e: any) {
//         console.error("Auth callback error:", e);
//         navigate("/auth", { replace: true });
//       }
//     };

//     run();
//   }, [navigate]);

//   return (
//     <div style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
//       <div>
//         <h2>Signing you in…</h2>
//         <p>Please wait a moment.</p>
//       </div>
//     </div>
//   );
// }


// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";

// export default function AuthCallback() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const run = async () => {
//       try {
//         const url = new URL(window.location.href);

//         // If provider returned an error
//         const err = url.searchParams.get("error");
//         const errDesc = url.searchParams.get("error_description");
//         if (err) {
//           console.error("OAuth error:", err, errDesc);
//           navigate(`/?oauth_error=${encodeURIComponent(errDesc || err)}`, { replace: true });
//           return;
//         }

//         // PKCE code
//         const code = url.searchParams.get("code");
//         if (code) {
//           const { error } = await supabase.auth.exchangeCodeForSession(code);
//           if (error) throw error;
//         }

//         // ✅ session + role
//         const { data } = await supabase.auth.getSession();
//         const user = data.session?.user;

//         const role =
//           (user?.user_metadata?.role as string | undefined)?.toLowerCase() || "explorer";

//         // ✅ Clean URL
//         window.history.replaceState({}, document.title, "/");

//         // ✅ Correct redirects (tumhare real routes)
//         if (role === "host") {
//           navigate("/guide/dashboard", { replace: true });
//         } else {
//           navigate("/explorer/dashboard", { replace: true });
//         }
//       } catch (e) {
//         console.error("Auth callback error:", e);
//         // ✅ fallback route that exists
//         navigate("/", { replace: true });
//       }
//     };

//     run();
//   }, [navigate]);

//   return (
//     <div style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
//       <div>
//         <h2>Signing you in…</h2>
//         <p>Please wait a moment.</p>
//       </div>
//     </div>
//   );
// }
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";

// export default function AuthCallback() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const run = async () => {
//       try {
//         const href = window.location.href;
//         const url = new URL(href);

//         // 1) If code exists (PKCE)
//         const code = url.searchParams.get("code");
//         if (code) {
//           const { error } = await supabase.auth.exchangeCodeForSession(code);
//           if (error) throw error;
//         } else {
//           // 2) If hash tokens exist (access_token in #)
//           // supabase helper reads from URL and stores session
//           // @ts-ignore (if types not updated)
//           const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
//           if (error) console.warn("getSessionFromUrl error:", error);
//         }

//         const { data } = await supabase.auth.getSession();
//         const user = data.session?.user;

//         const role =
//           (user?.user_metadata?.role as string | undefined)?.toLowerCase() || "explorer";

//         // Clean URL
//         window.history.replaceState({}, document.title, "/");

//         if (role === "host") navigate("/guide/dashboard", { replace: true });
//         else navigate("/explorer/dashboard", { replace: true });
//       } catch (e) {
//         console.error("Auth callback error:", e);
//         navigate("/", { replace: true });
//       }
//     };

//     run();
//   }, [navigate]);

//   return (
//     <div style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
//       <div>
//         <h2>Signing you in…</h2>
//         <p>Please wait a moment.</p>
//       </div>
//     </div>
//   );
// }

// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";

// export default function AuthCallback() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const run = async () => {
//       // ⏳ wait a tick so Supabase reads hash
//       await new Promise((r) => setTimeout(r, 300));

//       const { data, error } = await supabase.auth.getSession();

//       if (error || !data.session) {
//         console.error("Session error:", error);
//         navigate("/", { replace: true });
//         return;
//       }

//       const user = data.session.user;
//       const role =
//         (user.user_metadata?.role as string | undefined)?.toLowerCase() ||
//         "explorer";

//       // ✅ clean URL (remove #access_token)
//       window.history.replaceState({}, document.title, "/");

//       if (role === "host") {
//         navigate("/guide/dashboard", { replace: true });
//       } else {
//         navigate("/explorer/dashboard", { replace: true });
//       }
//     };

//     run();
//   }, [navigate]);

//   return (
//     <div style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
//       <h3>Signing you in…</h3>
//     </div>
//   );
// }

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { Globe2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { refreshRole, activeRole } = useRole();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const run = async () => {
      const qs = new URLSearchParams(window.location.search);

      const error = qs.get("error");
      const errorDesc = qs.get("error_description");
      if (error) {
        navigate(`/?oauth_error=${encodeURIComponent(errorDesc || error)}`, { replace: true });
        return;
      }

      // PKCE flow returns ?code=
      const code = qs.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          navigate(`/?oauth_error=${encodeURIComponent(error.message)}`, { replace: true });
          return;
        }
      }

      // ensure role is loaded
      await refreshRole();
    };

    run();
  }, [navigate, refreshRole]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!activeRole) return;

    navigate(activeRole === "host" ? "/guide/dashboard" : "/explorer/dashboard", { replace: true });
  }, [isAuthenticated, activeRole, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Globe2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
