import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Users, DollarSign, Video } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { checkSessionTimeWindow, getSessionStatusBadge } from "@/utils/timeValidation";
import { Booking } from "@/hooks/useBookings";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  booking: Booking;
  role: "explorer" | "guide";
}

export const BookingCard = ({ booking, role }: BookingCardProps) => {
  const navigate = useNavigate();
  
  const participantName = role === "explorer" 
    ? (booking.guide_name || "Guide") 
    : (booking.explorer_name || "Explorer");
  const participantAvatar = role === "explorer" ? booking.guide_avatar : booking.explorer_avatar;
  const title = booking.request_title || booking.service_title || "Livestream Session";

  const timeWindowStatus = checkSessionTimeWindow(
    booking.scheduled_date,
    booking.scheduled_time
  );

  const statusBadge = getSessionStatusBadge(
    booking.scheduled_date,
    booking.scheduled_time
  );

  const handleJoinLivestream = () => {
    if (booking.meeting_link && timeWindowStatus.canJoin) {
      navigate(`/livestream/${booking.id}`);
    }
  };

  const isLiveNow = timeWindowStatus.status === 'live-now';
  const hasEnded = timeWindowStatus.status === 'ended';

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-lg",
      isLiveNow && "border-destructive shadow-lg animate-pulse"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={participantAvatar || ""} />
              <AvatarFallback>{participantName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {role === "explorer" ? "Guide" : "Explorer"}: {participantName}
              </p>
            </div>
          </div>
          <Badge variant={statusBadge.variant} className={cn(
            isLiveNow && "animate-pulse"
          )}>
            {statusBadge.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(booking.scheduled_date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{booking.scheduled_time || "Time TBD"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{booking.guests_count} {booking.guests_count === 1 ? "guest" : "guests"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{booking.currency} {booking.price}</span>
          </div>
        </div>

        {timeWindowStatus.testingMode && (
          <div className="bg-primary/10 border border-primary/20 rounded-md p-2 text-xs text-primary flex items-center gap-2">
            <span>🧪</span>
            <span className="font-medium">Testing Mode Active - Time window validation disabled</span>
          </div>
        )}

        {timeWindowStatus.timeUntilStart && !hasEnded && (
          <div className="text-sm text-muted-foreground">
            Starts in {timeWindowStatus.timeUntilStart}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        {booking.meeting_link ? (
          <Button
            onClick={handleJoinLivestream}
            disabled={!timeWindowStatus.canJoin}
            variant={isLiveNow ? "destructive" : "default"}
            className="flex-1"
          >
            <Video className="h-4 w-4 mr-2" />
            {isLiveNow ? "Join Live Session" : "Join Livestream"}
          </Button>
        ) : (
          <div className="flex-1 text-center text-sm text-muted-foreground py-2">
            Livestream link pending
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
