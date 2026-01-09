import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { ExplorerNavbar } from "@/components/ExplorerNavbar";
import { GuideNavbar } from "@/components/GuideNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, Calendar, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeRole } = useRole();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const isGuide = activeRole === "host";
  const Navbar = isGuide ? GuideNavbar : ExplorerNavbar;

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (!bookingId) {
      navigate("/explorer/dashboard");
      return;
    }

    confirmBookingAndSetup();
  }, [bookingId, user]);

  const confirmBookingAndSetup = async () => {
    try {
      console.log("Confirming booking and setting up livestream:", bookingId);
      
      // Step 1: Confirm booking and send notifications
      const { data: confirmData, error: confirmError } = await supabase.functions.invoke("confirm-booking", {
        body: { bookingId },
      });

      if (confirmError) {
        console.error("Failed to confirm booking:", confirmError);
        throw new Error(confirmError.message || "Failed to confirm booking");
      }

      console.log("Booking confirmed:", confirmData);
      setBookingDetails(confirmData.booking);

      // Step 2: Create livestream session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke("create-daily-room", {
        body: { bookingId },
      });

      if (sessionError) {
        console.error("Failed to create livestream session:", sessionError);
        // Don't fail completely - booking is confirmed, just log the error
        toast({
          title: "Booking Confirmed",
          description: "Your booking is confirmed. Livestream will be set up shortly.",
        });
      } else {
        console.log("Livestream session created:", sessionData);
      }

      setStatus("success");
      toast({
        title: "Payment Successful!",
        description: "Your booking has been confirmed. Both you and the guide have been notified.",
      });

    } catch (error: any) {
      console.error("Setup error:", error);
      setStatus("error");
      toast({
        title: "Setup Error",
        description: error.message || "Failed to complete booking setup",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar showTabs={false} />

      <div className="container max-w-lg mx-auto px-6 py-20">
        <Card className="text-center">
          <CardHeader>
            {status === "loading" ? (
              <>
                <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
                <CardTitle className="mt-4">Processing Payment...</CardTitle>
                <CardDescription>Please wait while we confirm your booking</CardDescription>
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <CardTitle className="mt-4">Payment Successful!</CardTitle>
                <CardDescription>Your booking has been confirmed and both parties have been notified</CardDescription>
              </>
            ) : (
              <>
                <CheckCircle className="h-16 w-16 text-yellow-500 mx-auto" />
                <CardTitle className="mt-4">Payment Received</CardTitle>
                <CardDescription>
                  Your payment was successful, but there was an issue with the setup.
                  Please contact support.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "success" && bookingDetails && (
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
                <h4 className="font-semibold text-center mb-4">Booking Details</h4>
                
                {bookingDetails.service_title && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{bookingDetails.service_title}</span>
                  </div>
                )}
                
                {bookingDetails.scheduled_date && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(bookingDetails.scheduled_date), "PPP")}</span>
                  </div>
                )}
                
                {bookingDetails.scheduled_time && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{bookingDetails.scheduled_time}</span>
                  </div>
                )}
                
                {bookingDetails.guide_name && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Guide: {bookingDetails.guide_name}</span>
                  </div>
                )}
              </div>
            )}

            {status !== "loading" && (
              <>
                <p className="text-sm text-muted-foreground">
                  You can join the session at the scheduled time from your bookings page.
                </p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => navigate("/explorer/bookings")}>
                    View My Bookings
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/explorer/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
