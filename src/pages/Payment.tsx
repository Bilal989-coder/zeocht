// import { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { ExplorerNavbar } from "@/components/ExplorerNavbar";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { supabase } from "@/integrations/supabase/client";
// import { CheckCircle, MapPin, Calendar, Clock, Users, DollarSign } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { format } from "date-fns";

// export default function Payment() {
//   const [searchParams] = useSearchParams();
//   const bookingId = searchParams.get("booking");
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const [booking, setBooking] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);

//   useEffect(() => {
//     if (!user) {
//       navigate("/auth");
//       return;
//     }

//     if (!bookingId) {
//       navigate("/explorer-requests");
//       return;
//     }

//     fetchBookingDetails();
//   }, [bookingId, user]);

//   const fetchBookingDetails = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("bookings")
//         .select(
//           `
//           *,
//           request:booking_requests(
//             title,
//             location,
//             preferred_date,
//             duration_minutes,
//             guests_count,
//             message
//           ),
//           guide:profiles!bookings_guide_id_fkey(
//             full_name,
//             avatar_url,
//             location
//           )
//         `,
//         )
//         .eq("id", bookingId)
//         .single();

//       if (error) throw error;
//       setBooking(data);
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to load booking details",
//         variant: "destructive",
//       });
//       navigate("/explorer-requests");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayment = async () => {
//     setProcessing(true);
//     try {
//       console.log("Creating Stripe checkout session for booking:", bookingId);
      
//       const { data, error } = await supabase.functions.invoke("create-checkout-session
// ", {
//         body: { bookingId },
//       });

//       if (error) {
//         throw new Error(error.message || "Failed to create checkout session");
//       }

//       if (!data?.url) {
//         throw new Error("No checkout URL returned");
//       }

//       // Redirect to Stripe Checkout
//       window.location.href = data.url;
//     } catch (error: any) {
//       console.error("Payment error:", error);
//       toast({
//         title: "Payment Failed",
//         description: error.message || "Failed to initiate payment",
//         variant: "destructive",
//       });
//       setProcessing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <ExplorerNavbar showTabs={true} />
//         <div className="flex items-center justify-center py-20">
//           <p className="text-muted-foreground">Loading payment details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!booking) {
//     return null;
//   }

//   const request = booking.request;
//   const guide = booking.guide;

//   return (
//     <div className="min-h-screen bg-background">
//       <ExplorerNavbar showTabs={true} />

//       <div className="container max-w-4xl mx-auto px-6 py-8">
//         <div className="mb-6">
//           <h1 className="text-3xl font-semibold text-foreground mb-2">Complete Your Payment</h1>
//           <p className="text-muted-foreground">Review your booking details and complete payment</p>
//         </div>

//         <div className="grid gap-6 md:grid-cols-3">
//           {/* Booking Details */}
//           <Card className="md:col-span-2">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <CheckCircle className="h-5 w-5 text-green-500" />
//                 Booking Confirmed
//               </CardTitle>
//               <CardDescription>Your booking has been accepted by the guide</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Tour Details */}
//               <div>
//                 <h3 className="font-semibold text-lg mb-4">{request.title}</h3>

//                 <div className="space-y-3">
//                   <div className="flex items-start gap-3 text-sm">
//                     <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
//                     <span>{request.location}</span>
//                   </div>

//                   <div className="flex items-center gap-3 text-sm">
//                     <Calendar className="h-4 w-4 text-muted-foreground" />
//                     <span>{format(new Date(request.preferred_date), "PPP")}</span>
//                   </div>

//                   <div className="flex items-center gap-3 text-sm">
//                     <Clock className="h-4 w-4 text-muted-foreground" />
//                     <span>{request.duration_minutes} minutes</span>
//                   </div>

//                   <div className="flex items-center gap-3 text-sm">
//                     <Users className="h-4 w-4 text-muted-foreground" />
//                     <span>
//                       {request.guests_count} {request.guests_count === 1 ? "guest" : "guests"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <Separator />

//               {/* Guide Info */}
//               <div>
//                 <h4 className="font-semibold mb-3">Your Guide</h4>
//                 <div className="flex items-center gap-3">
//                   <img
//                     src={guide.avatar_url || "/placeholder.svg"}
//                     alt={guide.full_name}
//                     className="h-12 w-12 rounded-full object-cover"
//                   />
//                   <div>
//                     <p className="font-medium">{guide.full_name}</p>
//                     <p className="text-sm text-muted-foreground">{guide.location}</p>
//                   </div>
//                 </div>
//               </div>

//               {request.message && (
//                 <>
//                   <Separator />
//                   <div>
//                     <h4 className="font-semibold mb-2">Special Requests</h4>
//                     <p className="text-sm text-muted-foreground">{request.message}</p>
//                   </div>
//                 </>
//               )}
//             </CardContent>
//           </Card>

//           {/* Payment Summary */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Payment Summary</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Tour Price</span>
//                   <span className="font-medium">${booking.price}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Service Fee</span>
//                   <span className="font-medium">$0</span>
//                 </div>
//                 <Separator />
//                 <div className="flex justify-between">
//                   <span className="font-semibold">Total</span>
//                   <span className="font-semibold text-lg">${booking.price}</span>
//                 </div>
//               </div>

//               <Button className="w-full" size="lg" onClick={handlePayment} disabled={processing}>
//                 <DollarSign className="h-4 w-4 mr-2" />
//                 {processing ? "Processing..." : "Pay Now"}
//               </Button>

//               <p className="text-xs text-muted-foreground text-center">
//                 By proceeding, you agree to the terms and conditions
//               </p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ExplorerNavbar } from "@/components/ExplorerNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, MapPin, Calendar, Clock, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!bookingId) {
      navigate("/explorer-requests");
      return;
    }

    fetchBookingDetails();
  }, [bookingId, user]);

  const fetchBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          request:booking_requests(
            title,
            location,
            preferred_date,
            duration_minutes,
            guests_count,
            message
          ),
          guide:profiles!bookings_guide_id_fkey(
            full_name,
            avatar_url,
            location
          )
        `,
        )
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load booking details",
        variant: "destructive",
      });
      navigate("/explorer-requests");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      console.log("Creating Stripe checkout session for booking:", bookingId);
      
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { bookingId },
      });

      if (error) {
        throw new Error(error.message || "Failed to create checkout session");
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ExplorerNavbar showTabs={true} />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const request = booking.request;
  const guide = booking.guide;

  return (
    <div className="min-h-screen bg-background">
      <ExplorerNavbar showTabs={true} />

      <div className="container max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Complete Your Payment</h1>
          <p className="text-muted-foreground">Review your booking details and complete payment</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Booking Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Booking Confirmed
              </CardTitle>
              <CardDescription>Your booking has been accepted by the guide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tour Details */}
              <div>
                <h3 className="font-semibold text-lg mb-4">{request.title}</h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{request.location}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(request.preferred_date), "PPP")}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{request.duration_minutes} minutes</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {request.guests_count} {request.guests_count === 1 ? "guest" : "guests"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Guide Info */}
              <div>
                <h4 className="font-semibold mb-3">Your Guide</h4>
                <div className="flex items-center gap-3">
                  <img
                    src={guide.avatar_url || "/placeholder.svg"}
                    alt={guide.full_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{guide.full_name}</p>
                    <p className="text-sm text-muted-foreground">{guide.location}</p>
                  </div>
                </div>
              </div>

              {request.message && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Special Requests</h4>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tour Price</span>
                  <span className="font-medium">${booking.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium">$0</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-lg">${booking.price}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handlePayment} disabled={processing}>
                <DollarSign className="h-4 w-4 mr-2" />
                {processing ? "Processing..." : "Pay Now"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By proceeding, you agree to the terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
