import { useBookings } from "@/hooks/useBookings";
import { ExplorerNavbar } from "@/components/ExplorerNavbar";
import { BookingCard } from "@/components/BookingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { checkSessionTimeWindow } from "@/utils/timeValidation";

const ExplorerBookings = () => {
  const { bookings, loading, error } = useBookings("explorer");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <ExplorerNavbar activeTab="bookings" showTabs={false} />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <ExplorerNavbar activeTab="bookings" showTabs={false} />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading bookings: {error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Categorize bookings
  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
    const status = checkSessionTimeWindow(b.scheduled_date, b.scheduled_time);
    return status.status === 'too-early' || status.status === 'available-soon';
  });

  const liveBookings = bookings.filter(b => {
    const status = checkSessionTimeWindow(b.scheduled_date, b.scheduled_time);
    return status.status === 'live-now';
  });

  const completedBookings = bookings.filter(b => {
    const status = checkSessionTimeWindow(b.scheduled_date, b.scheduled_time);
    return status.status === 'ended';
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <ExplorerNavbar activeTab="bookings" showTabs={false} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            Manage your upcoming and past livestream sessions
          </p>
        </div>

        {liveBookings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
              <h2 className="text-xl font-semibold text-destructive">Live Now</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {liveBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} role="explorer" />
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="explorer" />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    No Upcoming Bookings
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    You don't have any upcoming livestream sessions. Start exploring to book your next adventure!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {bookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="explorer" />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    No Bookings Yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start exploring to book your first livestream session!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {completedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="explorer" />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No Completed Sessions
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExplorerBookings;
