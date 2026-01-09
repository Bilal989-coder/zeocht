import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const body = await req.json();
    const { bookingId, serviceId, scheduledDate, scheduledTime, guestsCount } = body;
    
    let booking: any = null;
    let title = "";
    let guideName = "";
    let price = 0;
    let currency = "USD";
    let guideId = "";

    if (bookingId) {
      // Existing flow: checkout for an accepted booking request
      logStep("Existing booking checkout", { bookingId });
      
      const { data, error } = await supabaseClient
        .from("bookings")
        .select(`
          *,
          request:booking_requests(title, location),
          guide:profiles!bookings_guide_id_fkey(full_name)
        `)
        .eq("id", bookingId)
        .eq("explorer_id", user.id)
        .single();

      if (error || !data) {
        throw new Error("Booking not found or access denied");
      }

      booking = data;
      title = data.request?.title || "Tour Booking";
      guideName = data.guide?.full_name || "Guide";
      price = data.price;
      currency = data.currency || "USD";
      guideId = data.guide_id;
      
    } else if (serviceId && scheduledDate) {
      // New flow: direct service booking
      logStep("Direct service booking", { serviceId, scheduledDate, scheduledTime });
      
      // Validate time format if provided (should be HH:MM)
      if (scheduledTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(scheduledTime)) {
        throw new Error(`Invalid time format: ${scheduledTime}. Expected HH:MM format.`);
      }
      
      // Fetch service details
      const { data: service, error: serviceError } = await supabaseClient
        .from("services")
        .select(`
          *,
          guide:profiles!services_guide_id_fkey(full_name)
        `)
        .eq("id", serviceId)
        .eq("status", "active")
        .single();

      if (serviceError || !service) {
        throw new Error("Service not found or not available");
      }

      // Calculate total price (base + 10% service fee)
      const basePrice = service.price;
      const serviceFee = Math.round(basePrice * 0.1);
      price = basePrice + serviceFee;
      currency = service.currency || "USD";
      title = service.title;
      guideName = service.guide?.full_name || "Guide";
      guideId = service.guide_id;

      // Create a pending booking
      const { data: newBooking, error: bookingError } = await supabaseClient
        .from("bookings")
        .insert({
          service_id: serviceId,
          explorer_id: user.id,
          guide_id: service.guide_id,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime || null,
          guests_count: guestsCount || 1,
          price: price,
          currency: currency,
          status: "pending_payment",
        })
        .select()
        .single();

      if (bookingError) {
        logStep("Error creating booking", { error: bookingError.message });
        throw new Error("Failed to create booking");
      }

      booking = newBooking;
      logStep("Booking created", { bookingId: newBooking.id });
    } else {
      throw new Error("Either bookingId or (serviceId + scheduledDate) is required");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Create checkout session with dynamic price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: title,
              description: `Guided experience with ${guideName}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking=${booking.id}`,
      cancel_url: `${origin}/payment-cancelled?booking=${booking.id}`,
      metadata: {
        booking_id: booking.id,
        user_id: user.id,
        guide_id: guideId,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, bookingId: booking.id }), {
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
