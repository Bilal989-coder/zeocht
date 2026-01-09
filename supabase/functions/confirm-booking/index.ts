import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-BOOKING] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { bookingId } = await req.json();
    if (!bookingId) throw new Error("Booking ID is required");
    logStep("Processing booking", { bookingId });

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select(`
        *,
        service:services(title, guide_id),
        explorer:profiles!bookings_explorer_id_fkey(full_name, email),
        guide:profiles!bookings_guide_id_fkey(full_name, email)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Verify the user is the explorer for this booking
    if (booking.explorer_id !== user.id) {
      throw new Error("Unauthorized access to booking");
    }

    logStep("Booking found", { 
      status: booking.status, 
      explorer: booking.explorer?.full_name,
      guide: booking.guide?.full_name 
    });

    // Update booking status to confirmed
    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);

    if (updateError) {
      throw new Error("Failed to update booking status");
    }
    logStep("Booking confirmed");

    // Create notification for the explorer
    const explorerNotification = {
      user_id: booking.explorer_id,
      type: "booking_confirmed",
      title: "Booking Confirmed!",
      message: `Your booking for "${booking.service?.title || 'Experience'}" with ${booking.guide?.full_name} has been confirmed. The session is scheduled for ${booking.scheduled_date}${booking.scheduled_time ? ' at ' + booking.scheduled_time : ''}.`,
      link: `/explorer/bookings`,
    };

    // Create notification for the guide
    const guideNotification = {
      user_id: booking.guide_id,
      type: "new_booking",
      title: "New Booking Received!",
      message: `${booking.explorer?.full_name} has booked "${booking.service?.title || 'Experience'}" scheduled for ${booking.scheduled_date}${booking.scheduled_time ? ' at ' + booking.scheduled_time : ''}. Payment has been received.`,
      link: `/guide/bookings`,
    };

    // Insert both notifications
    const { error: notifError } = await supabaseClient
      .from("notifications")
      .insert([explorerNotification, guideNotification]);

    if (notifError) {
      logStep("Warning: Failed to create notifications", { error: notifError.message });
    } else {
      logStep("Notifications created for explorer and guide");
    }

    // Return success with booking details
    return new Response(JSON.stringify({ 
      success: true,
      booking: {
        id: booking.id,
        scheduled_date: booking.scheduled_date,
        scheduled_time: booking.scheduled_time,
        service_title: booking.service?.title,
        guide_name: booking.guide?.full_name,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
