import { useNavigate, useSearchParams } from "react-router-dom";
import { ExplorerNavbar } from "@/components/ExplorerNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentCancelled() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <ExplorerNavbar showTabs={true} />

      <div className="container max-w-lg mx-auto px-6 py-20">
        <Card className="text-center">
          <CardHeader>
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <CardTitle className="mt-4">Payment Cancelled</CardTitle>
            <CardDescription>
              Your payment was not completed. No charges have been made.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can try again or return to your requests to view pending bookings.
            </p>
            <div className="flex flex-col gap-2">
              {bookingId && (
                <Button onClick={() => navigate(`/payment?booking=${bookingId}`)}>
                  Try Again
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate("/explorer/requests")}>
                Back to Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
