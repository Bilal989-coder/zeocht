import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Service {
  id: string;
  guide_id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  price: number;
  currency: string;
  duration_minutes: number;
  max_guests: number;
  type: "live" | "recorded" | "both";
  status: "active" | "draft" | "paused" | "archived";
  image_urls: string[];

  coordinates_lat?: number | null;
  coordinates_lng?: number | null;
  languages?: string[];
  whats_included?: string[];
  requirements?: string[];

  views_count: number;
  bookings_count: number;
  rating_avg: number;
  reviews_count: number;
  is_guest_favorite: boolean;

  created_at: string;
  updated_at: string;
}

export const useServices = (guideId?: string) => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideId, user?.id]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from("services").select("*");

      if (guideId) {
        query = query.eq("guide_id", guideId);
      } else if (user) {
        query = query.eq("guide_id", user.id);
      } else {
        // no user, no guideId → no fetch
        setServices([]);
        return;
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      setServices((data as any) || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Partial<Service>) => {
    try {
      if (!user?.id) return { data: null, error: "User not logged in" };

      const payload: any = {
        ...(serviceData as any),
        guide_id: user.id,
        // ✅ If status missing, default to draft
        status: (serviceData.status ?? "draft") as Service["status"],
      };

      console.log("Creating service payload:", payload);

      const { data, error } = await supabase
        .from("services")
        .insert(payload)
        .select()
        .single();

      console.log("Create result:", { data, error });

      if (error) throw error;

      setServices((prev) => [data as any, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      console.error("Create service error:", err);
      return { data: null, error: err.message };
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      if (!user?.id) return { data: null, error: "User not logged in" };

      const payload: any = { ...(updates as any) };

      // ✅ IMPORTANT: Never force status here.
      // Whatever you pass from UI will be updated.
      console.log("Updating service payload:", { id, payload });

      const { data, error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      console.log("Update result:", { data, error });

      if (error) throw error;

      setServices((prev) => prev.map((s) => (s.id === id ? (data as any) : s)));
      return { data, error: null };
    } catch (err: any) {
      console.error("Update service error:", err);
      return { data: null, error: err.message };
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;

      setServices((prev) => prev.filter((s) => s.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    refetch: fetchServices,
  };
};

export const usePublicServices = (filters?: {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.category, filters?.location, filters?.minPrice, filters?.maxPrice, filters?.type]);

  const fetchPublicServices = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from("services").select("*").eq("status", "active");

      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.location) query = query.ilike("location", `%${filters.location}%`);
      if (filters?.minPrice !== undefined) query = query.gte("price", filters.minPrice);
      if (filters?.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);

      if (filters?.type) {
        query = query.or(`type.eq.${filters.type},type.eq.both`);
      }

      const { data, error } = await query.order("rating_avg", { ascending: false });
      if (error) throw error;

      setServices((data as any) || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching public services:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    refetch: fetchPublicServices,
  };
};
