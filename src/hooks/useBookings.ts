import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Booking {
  id: string;
  booking_id?: string;
  explorer_id: string;
  guide_id: string;
  service_id: string | null;
  request_id: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  guests_count: number;
  price: number;
  currency: string;
  status: string;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  // Joined data
  request_title?: string;
  service_title?: string;
  explorer_name?: string;
  explorer_avatar?: string;
  guide_name?: string;
  guide_avatar?: string;
  session_status?: string;
  channel_name?: string;
}

export const useBookings = (role: "guide" | "explorer") => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
      subscribeToBookings();
    }
  }, [user, role]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const field = role === "guide" ? "guide_id" : "explorer_id";
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          booking_requests!bookings_request_id_fkey(title),
          services!bookings_service_id_fkey(title),
          explorer:profiles!bookings_explorer_id_fkey(full_name, avatar_url),
          guide:profiles!bookings_guide_id_fkey(full_name, avatar_url),
          livestream_sessions(status, channel_name, daily_room_url)
        `)
        .eq(field, user.id)
        .order("scheduled_date", { ascending: false })
        .order("scheduled_time", { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to flatten nested objects
      const transformedData = data?.map((booking: any) => {
        // Log warnings for missing profile data
        if (!booking.explorer) {
          console.warn(`Booking ${booking.id} missing explorer profile`);
        }
        if (!booking.guide) {
          console.warn(`Booking ${booking.id} missing guide profile`);
        }

        const session = booking.livestream_sessions?.[0];
        const dailyRoomUrl = session?.daily_room_url;
        
        // If booking doesn't have meeting_link but session has daily_room_url, use it as fallback
        // The create-daily-room function will sync it when someone tries to join
        // For now, we use daily_room_url as a fallback in the UI
        const effectiveMeetingLink = booking.meeting_link || dailyRoomUrl || null;
        
        // If we're using the fallback and user is a guide, try to sync (guides can update bookings)
        if (!booking.meeting_link && dailyRoomUrl && role === 'guide') {
          // Sync the booking's meeting_link in the background (only guides can update)
          supabase
            .from('bookings')
            .update({ meeting_link: dailyRoomUrl })
            .eq('id', booking.id)
            .then(({ error }) => {
              if (error) {
                console.error(`Failed to sync meeting_link for booking ${booking.id}:`, error);
              } else {
                console.log(`Synced meeting_link for booking ${booking.id}`);
              }
            });
        }

        return {
          ...booking,
          request_title: booking.booking_requests?.title,
          service_title: booking.services?.title,
          explorer_name: booking.explorer?.full_name || 'Explorer',
          explorer_avatar: booking.explorer?.avatar_url || null,
          guide_name: booking.guide?.full_name || 'Guide',
          guide_avatar: booking.guide?.avatar_url || null,
          session_status: session?.status,
          channel_name: session?.channel_name,
          // Use daily_room_url as fallback for meeting_link
          meeting_link: effectiveMeetingLink,
        };
      }) || [];
      
      setBookings(transformedData);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToBookings = () => {
    if (!user) return;

    const field = role === "guide" ? "guide_id" : "explorer_id";
    
    const channel = supabase
      .channel("bookings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `${field}=eq.${user.id}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
  };
};
