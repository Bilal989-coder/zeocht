import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BookingRequest {
  id: string;
  service_id: string;
  explorer_id: string;
  guide_id: string;
  preferred_date: string;
  preferred_time?: string;
  guests_count: number;
  budget?: number;
  message?: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
}

export const useBookingRequests = (role: "guide" | "explorer") => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRequests();
      subscribeToRequests();
    }
  }, [user, role]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const field = role === "guide" ? "guide_id" : "explorer_id";
      
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*")
        .eq(field, user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setRequests((data as any) || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching booking requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRequests = () => {
    if (!user) return;

    const field = role === "guide" ? "guide_id" : "explorer_id";
    
    const channel = supabase
      .channel("booking_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking_requests",
          filter: `${field}=eq.${user.id}`,
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createRequest = async (requestData: {
    service_id: string;
    guide_id: string;
    preferred_date: string;
    preferred_time?: string;
    guests_count: number;
    budget?: number;
    message?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .insert({
          ...requestData,
          explorer_id: user?.id,
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      
      setRequests(prev => [(data as any), ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const createCustomRequest = async (requestData: any, isDraft: boolean) => {
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .insert({
          ...requestData,
          explorer_id: user?.id,
          request_type: "custom_request",
          is_draft: isDraft,
          status: isDraft ? "draft" : "pending",
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      
      setRequests(prev => [(data as any), ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateCustomRequest = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      setRequests(prev => prev.map(r => r.id === id ? (data as any) : r));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteCustomRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from("booking_requests")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setRequests(prev => prev.filter(r => r.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const submitCustomRequest = async (id: string) => {
    return updateCustomRequest(id, { is_draft: false, status: "pending" });
  };

  const updateRequestStatus = async (id: string, status: BookingRequest["status"]) => {
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .update({ status } as any)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      setRequests(prev => prev.map(r => r.id === id ? (data as any) : r));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      // Update request status
      const { data: request, error: requestError } = await updateRequestStatus(requestId, "accepted");
      
      if (requestError) throw new Error(requestError);
      
      // Create booking
      if (request.data) {
        const { data: booking, error: bookingError } = await supabase
          .from("bookings")
          .insert({
            request_id: requestId,
            service_id: request.data.service_id,
            explorer_id: request.data.explorer_id,
            guide_id: request.data.guide_id,
            scheduled_date: request.data.preferred_date,
            scheduled_time: request.data.preferred_time,
            guests_count: request.data.guests_count,
            price: request.data.budget || 0,
            status: "confirmed",
          })
          .select()
          .single();
        
        if (bookingError) throw bookingError;
        
        return { data: booking, error: null };
      }
      
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  return {
    requests,
    loading,
    error,
    createRequest,
    createCustomRequest,
    updateCustomRequest,
    deleteCustomRequest,
    submitCustomRequest,
    updateRequestStatus,
    acceptRequest,
    refetch: fetchRequests,
  };
};