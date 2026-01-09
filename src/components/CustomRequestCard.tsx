import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Clock, Users, MessageSquare, DollarSign, Edit, Send, X, Check, XCircle, Video, Trash2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { checkSessionTimeWindow, getSessionStatusBadge } from "@/utils/timeValidation";
import { cn } from "@/lib/utils";

interface CustomRequestCardProps {
  request: {
    id: string;
    title: string;
    location: string;
    preferred_date: string;
    duration_minutes: number;
    guests_count: number;
    budget?: number;
    message?: string;
    category: string;
    status: string;
    is_draft: boolean;
    created_at: string;
    guide?: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    explorer?: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  };
  userRole: "explorer" | "guide";
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSubmit?: (id: string) => void;
  onEdit?: (id: string) => void;
  onMessage?: (id: string) => void;
}

export function CustomRequestCard({
  request,
  userRole,
  onAccept,
  onDecline,
  onCancel,
  onDelete,
  onSubmit,
  onEdit,
  onMessage
}: CustomRequestCardProps) {
  const [booking, setBooking] = useState<any>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [bidsCount, setBidsCount] = useState(0);
  const [timeWindowStatus, setTimeWindowStatus] = useState<any>(null);

  const handleCardClick = () => {
    // Only make card clickable if there's a livestream link available
    if (booking?.meeting_link && request.status === "accepted") {
      window.location.href = booking.meeting_link;
    }
  };

  useEffect(() => {
    if (request.status === "accepted" && userRole === "explorer") {
      fetchBooking();
    }
    if (request.status === "pending" && userRole === "explorer") {
      fetchBidsCount();
    }
  }, [request.id, request.status, userRole]);

  // Update time window status every minute
  useEffect(() => {
    if (booking?.scheduled_date) {
      const updateTimeStatus = () => {
        const status = checkSessionTimeWindow(
          booking.scheduled_date,
          booking.scheduled_time
        );
        setTimeWindowStatus(status);
      };
      
      updateTimeStatus();
      const interval = setInterval(updateTimeStatus, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [booking?.scheduled_date, booking?.scheduled_time]);

  const fetchBooking = async () => {
    setLoadingBooking(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, guide:profiles!bookings_guide_id_fkey(id, full_name, avatar_url)")
        .eq("request_id", request.id)
        .eq("status", "confirmed")
        .single();
      
      if (!error && data) {
        setBooking(data);
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
    } finally {
      setLoadingBooking(false);
    }
  };

  const fetchBidsCount = async () => {
    try {
      const { count } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("request_id", request.id)
        .eq("status", "pending_confirmation");
      
      setBidsCount(count || 0);
    } catch (err) {
      console.error("Error fetching bids count:", err);
    }
  };

  const getStatusBadge = () => {
    if (request.is_draft) {
      return <Badge variant="secondary">Draft</Badge>;
    }
    
    switch (request.status) {
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Pending</Badge>;
      case "bid_placed":
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">Bid Received</Badge>;
      case "accepted":
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{request.status}</Badge>;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 1440) return "Multi-day";
    if (minutes >= 480) return "Full day";
    if (minutes >= 300) return "Half day";
    return `${Math.floor(minutes / 60)} hour${minutes > 60 ? 's' : ''}`;
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-shadow",
        booking?.meeting_link && request.status === "accepted" && "cursor-pointer hover:shadow-lg"
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge()}
              <Badge variant="outline" className="text-xs">{request.category}</Badge>
            </div>
            <h3 className="font-semibold text-lg mb-1">{request.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{request.location}</span>
            </div>
          </div>

          {/* Show explorer/guide info based on role */}
          {userRole === "guide" && request.explorer && (
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.explorer.avatar_url} />
                <AvatarFallback>
                  {request.explorer.full_name?.charAt(0) || "E"}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{request.explorer.full_name}</p>
                <p className="text-muted-foreground text-xs">Explorer</p>
              </div>
            </div>
          )}

          {userRole === "explorer" && request.guide && (
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.guide.avatar_url} />
                <AvatarFallback>
                  {request.guide.full_name?.charAt(0) || "G"}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{request.guide.full_name}</p>
                <p className="text-muted-foreground text-xs">Guide</p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Request Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(request.preferred_date), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDuration(request.duration_minutes)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{request.guests_count} guest{request.guests_count > 1 ? 's' : ''}</span>
          </div>
          {request.budget && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>${request.budget}</span>
            </div>
          )}
        </div>

        {/* Message/Description */}
        {request.message && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">{request.message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {/* Explorer - Draft status */}
          {userRole === "explorer" && request.is_draft && (
            <>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(request.id); }} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              {onSubmit && (
                <Button size="sm" onClick={(e) => { e.stopPropagation(); onSubmit(request.id); }} className="gap-2">
                  <Send className="h-4 w-4" />
                  Submit
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(request.id); }} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </>
          )}

          {/* Explorer - Pending status */}
          {userRole === "explorer" && !request.is_draft && request.status === "pending" && (
            <>
              {bidsCount > 0 && (
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        {bidsCount} {bidsCount === 1 ? "Bid" : "Bids"} Received
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Guides are interested in your request!
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {onCancel && (
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onCancel(request.id); }} className="mt-2">
                  Cancel Request
                </Button>
              )}
            </>
          )}


          {/* Explorer - Accepted status */}
          {userRole === "explorer" && request.status === "accepted" && (
            <>
              {loadingBooking ? (
                <p className="text-sm text-muted-foreground">Loading booking details...</p>
              ) : booking ? (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Booking Confirmed</span>
                  </div>
                  {booking.scheduled_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(booking.scheduled_date), "MMM dd, yyyy")}
                        {booking.scheduled_time && ` at ${booking.scheduled_time}`}
                      </span>
                    </div>
                  )}
                  {timeWindowStatus && (
                    <Badge variant={
                      timeWindowStatus.status === 'live-now' ? 'destructive' :
                      timeWindowStatus.status === 'available-soon' ? 'default' :
                      'secondary'
                    }>
                      {timeWindowStatus.message}
                    </Badge>
                  )}
                  <div className="flex gap-2">
                    {onMessage && request.guide && (
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onMessage(request.guide!.id); }}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    )}
                    {booking.meeting_link ? (
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!timeWindowStatus?.canJoin}
                        variant={timeWindowStatus?.status === 'live-now' ? 'destructive' : 'default'}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = booking.meeting_link;
                        }}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        {timeWindowStatus?.status === 'live-now' ? 'Join Live Session' : 'Join Livestream'}
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1" variant="default">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Confirm & Pay
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No booking found</p>
              )}
            </>
          )}

          {/* Guide - Pending status */}
          {userRole === "guide" && request.status === "pending" && !request.is_draft && (
            <>
              {onAccept && (
                <Button size="sm" onClick={(e) => { e.stopPropagation(); onAccept(request.id); }} className="gap-2">
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
              )}
              {onDecline && (
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onDecline(request.id); }} className="gap-2">
                  <X className="h-4 w-4" />
                  Decline
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
