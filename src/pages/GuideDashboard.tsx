import { useAuth } from "@/contexts/AuthContext";
import { GuideNavbar } from "@/components/GuideNavbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, Star, Video, MapPin, Clock, Plus, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useServices";
import { useBookingRequests } from "@/hooks/useBookingRequests";
import { useTranslation } from "@/hooks/useTranslation";
import { CustomRequestCard } from "@/components/CustomRequestCard";
import { AcceptCustomRequestDialog } from "@/components/AcceptCustomRequestDialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { checkSessionTimeWindow, getSessionStatusBadge } from "@/utils/timeValidation";
import ServiceCard from "@/components/ServiceCard";

const GuideDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, formatPrice } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("services");
  const [customRequests, setCustomRequests] = useState<any[]>([]);
  const [acceptedBookings, setAcceptedBookings] = useState<any[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);
  
  const { services, loading: servicesLoading } = useServices();
  const { requests, loading: requestsLoading, acceptRequest, updateRequestStatus } = useBookingRequests("guide");
  
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeServices: 0,
    totalBookings: 0,
    averageRating: 0,
  });

  const fetchCustomRequests = async () => {
    if (!user) return;
    
    setLoadingCustom(true);
    try {
      const { data, error } = await (supabase as any)
        .from("booking_requests")
        .select("*, explorer:profiles!booking_requests_explorer_id_fkey(id, full_name, avatar_url)")
        .eq("request_type", "custom_request")
        .eq("is_draft", false)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setCustomRequests(data || []);
    } catch (error) {
      console.error("Error fetching custom requests:", error);
    } finally {
      setLoadingCustom(false);
    }
  };

  const fetchAcceptedBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          request:booking_requests(title, location, preferred_date, duration_minutes, category),
          explorer:profiles!bookings_explorer_id_fkey(id, full_name, avatar_url)
        `)
        .eq("guide_id", user.id)
        .eq("status", "confirmed")
        .order("scheduled_date", { ascending: true });
      
      if (error) throw error;
      setAcceptedBookings(data || []);
    } catch (error) {
      console.error("Error fetching accepted bookings:", error);
    }
  };

  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (!data?.onboarding_completed) {
          navigate("/guide/onboarding");
          return;
        }
      } catch (err) {
        console.error("Error checking onboarding:", err);
      }
    };

    checkOnboarding();
  }, [user, navigate]);

  useEffect(() => {
    fetchStats();
    fetchCustomRequests();
    fetchAcceptedBookings();
    
    // Set up real-time subscription for custom requests
    const channel = supabase
      .channel('custom_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_requests',
          filter: 'request_type=eq.custom_request',
        },
        () => {
          fetchCustomRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, services]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Calculate stats from services
      const activeServices = services.filter(s => s.status === "active").length;
      const totalBookings = services.reduce((sum, s) => sum + s.bookings_count, 0);
      const avgRating = services.length > 0 
        ? services.reduce((sum, s) => sum + s.rating_avg, 0) / services.length 
        : 0;

      // Fetch earnings from transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("guide_earnings")
        .eq("guide_id", user.id)
        .eq("status", "completed");

      const totalEarnings = transactions?.reduce((sum, t) => sum + (t.guide_earnings || 0), 0) || 0;

      setStats({
        totalEarnings,
        activeServices,
        totalBookings,
        averageRating: avgRating,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const totalPendingCount = pendingRequests.length + customRequests.length;

  const handleAcceptRequest = async (requestId: string) => {
    const result = await acceptRequest(requestId);
    if (result.error) {
      console.error("Error accepting request:", result.error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    const result = await updateRequestStatus(requestId, "declined");
    if (result.error) {
      console.error("Error declining request:", result.error);
    }
  };

  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedCustomRequest, setSelectedCustomRequest] = useState<any>(null);

  const handleAcceptCustomRequest = async (price: number) => {
    if (!selectedCustomRequest || !user) return;
    
    try {
      // Check if guide already bid on this request
      const { data: existingBid } = await supabase
        .from("bookings")
        .select("id")
        .eq("request_id", selectedCustomRequest.id)
        .eq("guide_id", user.id)
        .eq("status", "pending_confirmation")
        .single();

      if (existingBid) {
        toast({
          title: "Already Bid",
          description: "You have already placed a bid on this request.",
          variant: "destructive"
        });
        setAcceptDialogOpen(false);
        return;
      }

      // Create a booking with pending confirmation status (this is the bid)
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          request_id: selectedCustomRequest.id,
          service_id: null, // Custom request has no service
          explorer_id: selectedCustomRequest.explorer_id,
          guide_id: user.id,
          scheduled_date: selectedCustomRequest.preferred_date,
          guests_count: selectedCustomRequest.guests_count,
          price: price,
          currency: "USD",
          status: "pending_confirmation",
        });
      
      if (bookingError) throw bookingError;
      
      toast({
        title: "Success",
        description: "Bid submitted successfully! Explorer will review your offer."
      });
      
      setAcceptDialogOpen(false);
      setSelectedCustomRequest(null);
      fetchCustomRequests();
      fetchAcceptedBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit bid",
        variant: "destructive"
      });
    }
  };

  const openAcceptDialog = (request: any) => {
    setSelectedCustomRequest(request);
    setAcceptDialogOpen(true);
  };

  const handleDeclineCustomRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("booking_requests")
        .update({ status: "declined" })
        .eq("id", requestId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Request declined"
      });
      
      fetchCustomRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to decline request",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GuideNavbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        unreadCount={totalPendingCount}
      />

      <div className="px-6 lg:px-10 xl:px-20 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("guide.dashboard")}</h1>
            <p className="text-muted-foreground">Manage your experiences and grow your audience</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              className="bg-primary hover:bg-primary-dark gap-2"
              onClick={() => navigate("/guide/service/new")}
            >
              <Plus className="h-4 w-4" />
              {t("guide.addService")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-0 shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(stats.totalEarnings)}</p>
                <p className="text-sm text-muted-foreground">{t("guide.totalEarnings")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeServices}</p>
                <p className="text-sm text-muted-foreground">{t("guide.activeServices")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
                <p className="text-sm text-muted-foreground">{t("guide.totalBookings")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">{t("guide.averageRating")}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="lg:hidden mb-6 bg-muted w-full">
            <TabsTrigger value="services" className="flex-1">{t("guide.myServices")}</TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 relative">
              Active Requests
              {totalPendingCount > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center">
                  {totalPendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex-1">{t("guide.earnings")}</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-0">
            {servicesLoading ? (
              <div className="text-center py-12">Loading services...</div>
            ) : services.length === 0 ? (
              <Card className="p-12 text-center border-0 shadow-card">
                <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">{t("guide.noServices")}</h3>
                <p className="text-muted-foreground mb-6">{t("guide.createFirst")}</p>
                <Button onClick={() => navigate("/guide/service/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("guide.addService")}
                </Button>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    image={service.image_urls?.[0] || "/placeholder.svg"}
                    title={service.title}
                    location={service.location}
                    price={service.price}
                    rating={service.rating_avg}
                    views={service.views_count}
                    bookings={service.bookings_count}
                    status={service.status}
                    type={service.type}
                    onEdit={() => navigate(`/guide/service/${service.id}/edit`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-0">
            {(requestsLoading || loadingCustom) ? (
              <div className="text-center py-12">Loading requests...</div>
            ) : (pendingRequests.length === 0 && customRequests.length === 0) ? (
              <Card className="p-12 text-center border-0 shadow-card">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">You'll see booking requests from explorers here</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Custom Tour Requests */}
                {customRequests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Compass className="h-5 w-5" />
                      Custom Tour Requests
                      <Badge variant="secondary">{customRequests.length}</Badge>
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {customRequests.map((request) => (
                        <CustomRequestCard
                          key={request.id}
                          request={request}
                          userRole="guide"
                          onAccept={() => openAcceptDialog(request)}
                          onDecline={handleDeclineCustomRequest}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Booking Requests */}
                {pendingRequests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Service Booking Requests
                      <Badge variant="secondary">{pendingRequests.length}</Badge>
                    </h3>
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <Card key={request.id} className="p-6 border-0 shadow-card">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">New Booking Request</h3>
                                <Badge className="bg-primary text-primary-foreground">{t("requests.pending")}</Badge>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <span>{t("guide.date")}: {new Date(request.preferred_date).toLocaleDateString()}</span>
                                <span>Guests: {request.guests_count}</span>
                                {request.budget && <span>{t("guide.budget")}: {formatPrice(request.budget)}</span>}
                              </div>
                              {request.message && (
                                <p className="mt-2 text-sm text-muted-foreground">{request.message}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                className="bg-primary hover:bg-primary-dark" 
                                size="sm"
                                onClick={() => handleAcceptRequest(request.id)}
                              >
                                {t("guide.acceptRequest")}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeclineRequest(request.id)}
                              >
                                {t("guide.declineRequest")}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="mt-0">
            {loadingCustom ? (
              <div className="text-center py-12">Loading bookings...</div>
            ) : acceptedBookings.length === 0 ? (
              <Card className="p-12 text-center border-0 shadow-card">
                <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No confirmed bookings</h3>
                <p className="text-muted-foreground">Your confirmed bookings will appear here</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {acceptedBookings.map((booking) => {
                  const timeWindowStatus = booking.scheduled_date 
                    ? checkSessionTimeWindow(booking.scheduled_date, booking.scheduled_time)
                    : null;
                  const statusBadge = booking.scheduled_date
                    ? getSessionStatusBadge(booking.scheduled_date, booking.scheduled_time)
                    : null;

                  return (
                    <Card key={booking.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {booking.request?.title || "Tour Booking"}
                            </CardTitle>
                            <CardDescription>
                              Booking ID: {booking.id.slice(0, 8)}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Badge>Confirmed</Badge>
                            {statusBadge && (
                              <Badge variant={statusBadge.variant}>
                                {statusBadge.text}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={booking.explorer?.avatar_url} />
                            <AvatarFallback>
                              {booking.explorer?.full_name?.charAt(0) || "E"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {booking.explorer?.full_name || "Explorer"}
                            </p>
                            <p className="text-sm text-muted-foreground">Explorer</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {booking.scheduled_date && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(new Date(booking.scheduled_date), "MMM dd, yyyy")}
                                {booking.scheduled_time && ` at ${booking.scheduled_time}`}
                              </span>
                            </div>
                          )}
                          {booking.request?.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.request.location}</span>
                            </div>
                          )}
                          {booking.guests_count && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.guests_count} {booking.guests_count === 1 ? 'guest' : 'guests'}</span>
                            </div>
                          )}
                          {booking.price && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>${booking.price} {booking.currency || 'USD'}</span>
                            </div>
                          )}
                        </div>

                        {timeWindowStatus && timeWindowStatus.status !== 'live-now' && (
                          <div className="text-sm text-muted-foreground">
                            {timeWindowStatus.message}
                          </div>
                        )}

                        {booking.meeting_link && (
                          <Button
                            className="w-full"
                            disabled={!timeWindowStatus?.canJoin}
                            variant={timeWindowStatus?.status === 'live-now' ? 'destructive' : 'default'}
                            onClick={() => navigate(booking.meeting_link.replace(window.location.origin, ''))}
                          >
                            <Video className="mr-2 h-4 w-4" />
                            {timeWindowStatus?.status === 'live-now' 
                              ? 'Join Live Session Now' 
                              : 'Join Livestream'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>


          <TabsContent value="earnings" className="mt-0">
            <Card className="p-8 border-0 shadow-card">
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground mb-2">{t("guide.availableBalance")}</p>
                <p className="text-4xl font-bold mb-1">{formatPrice(stats.totalEarnings)}</p>
                <p className="text-sm text-muted-foreground">{t("guide.availableToWithdraw")}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{formatPrice(0)}</p>
                  <p className="text-sm text-muted-foreground">{t("guide.thisMonth")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{formatPrice(0)}</p>
                  <p className="text-sm text-muted-foreground">{t("guide.pending")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{formatPrice(stats.totalEarnings)}</p>
                  <p className="text-sm text-muted-foreground">{t("guide.allTime")}</p>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary-dark">
                {t("guide.withdraw")}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AcceptCustomRequestDialog
        open={acceptDialogOpen}
        onOpenChange={setAcceptDialogOpen}
        onConfirm={handleAcceptCustomRequest}
        requestTitle={selectedCustomRequest?.title || ""}
        suggestedBudget={selectedCustomRequest?.budget}
      />
    </div>
  );
};

export default GuideDashboard;