import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Check, Star, TrendingDown, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Bid {
  id: string;
  guide_id: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  guide?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    total_bookings?: number;
  };
  guide_settings?: {
    hourly_rate?: number;
    pricing_type?: string;
    currency?: string;
  };
}

interface BidsListProps {
  requestId: string;
  requestBudget?: number;
  onAcceptBid: (bidId: string, guideId: string) => void;
  onMessageGuide: (guideId: string) => void;
}

export function BidsList({ requestId, requestBudget, onAcceptBid, onMessageGuide }: BidsListProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
    subscribeToUpdates();
  }, [requestId]);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*, guide:profiles!bookings_guide_id_fkey(id, full_name, avatar_url, total_bookings)")
        .eq("request_id", requestId)
        .eq("status", "pending_confirmation")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch guide settings for each bid
      const bidsWithSettings = await Promise.all(
        (bookings || []).map(async (booking) => {
          const { data: settings } = await supabase
            .from("guide_settings")
            .select("hourly_rate, pricing_type, currency")
            .eq("guide_id", booking.guide_id)
            .single();

          return {
            ...booking,
            guide_settings: settings,
          };
        })
      );

      setBids(bidsWithSettings as any);
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel(`bids_${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `request_id=eq.${requestId}`,
        },
        () => {
          fetchBids();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const calculateSavings = (bidPrice: number) => {
    if (!requestBudget) return null;
    const savings = requestBudget - bidPrice;
    const percentage = ((savings / requestBudget) * 100).toFixed(0);
    return { amount: savings, percentage };
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Loading bids...</p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No bids yet. Guides will start bidding soon!</p>
      </div>
    );
  }

  // Sort bids by price (lowest first)
  const sortedBids = [...bids].sort((a, b) => a.price - b.price);
  const lowestBid = sortedBids[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {bids.length} {bids.length === 1 ? "Bid" : "Bids"} Received
        </h3>
        {requestBudget && (
          <p className="text-sm text-muted-foreground">
            Your budget: <span className="font-semibold">${requestBudget}</span>
          </p>
        )}
      </div>

      <div className="space-y-3">
        {sortedBids.map((bid) => {
          const savings = calculateSavings(bid.price);
          const isLowestBid = bid.id === lowestBid.id && bids.length > 1;
          
          return (
            <Card key={bid.id} className={isLowestBid ? "border-primary shadow-md" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={bid.guide?.avatar_url} />
                    <AvatarFallback>{bid.guide?.full_name?.charAt(0) || "G"}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{bid.guide?.full_name}</p>
                          {isLowestBid && (
                            <Badge variant="default" className="text-xs">
                              Best Price
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          {bid.guide?.total_bookings && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {bid.guide.total_bookings} bookings
                            </span>
                          )}
                          {bid.guide_settings?.hourly_rate && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${bid.guide_settings.hourly_rate}/hr standard rate
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${bid.price}</p>
                        {savings && savings.amount > 0 && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <TrendingDown className="h-3 w-3" />
                            {savings.percentage}% below budget
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => onMessageGuide(bid.guide_id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => onAcceptBid(bid.id, bid.guide_id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept Bid
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
