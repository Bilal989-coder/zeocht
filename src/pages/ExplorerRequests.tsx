import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExplorerNavbar } from "@/components/ExplorerNavbar";
import { useBookingRequests } from "@/hooks/useBookingRequests";
import { CustomRequestCard } from "@/components/CustomRequestCard";
import { CreateCustomRequestDialog } from "@/components/CreateCustomRequestDialog";
import { BidsList } from "@/components/BidsList";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ExplorerRequests = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    requests, 
    loading, 
    createCustomRequest, 
    updateCustomRequest,
    deleteCustomRequest,
    submitCustomRequest,
    updateRequestStatus,
    refetch 
  } = useBookingRequests("explorer");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bidRequestIds, setBidRequestIds] = useState<string[]>([]);
  const [loadingBids, setLoadingBids] = useState(true);

  // Subscribe to realtime updates
  useEffect(() => {
    if (user) {
      refetch();
      fetchRequestsWithBids();
    }
  }, [user]);

  const fetchRequestsWithBids = async () => {
    setLoadingBids(true);
    try {
      // Get all bookings with pending_confirmation status for this explorer
      const { data: bookings } = await supabase
        .from("bookings")
        .select("request_id")
        .eq("explorer_id", user?.id)
        .eq("status", "pending_confirmation");
      
      if (bookings) {
        const uniqueRequestIds = [...new Set(bookings.map(b => b.request_id))];
        setBidRequestIds(uniqueRequestIds as string[]);
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoadingBids(false);
    }
  };

  // Filter custom requests
  const customRequests = requests.filter((r: any) => r.request_type === "custom_request");
  const acceptedRequests = customRequests.filter((r: any) => r.status === "accepted" && !r.is_draft);
  const bidReceivedRequests = customRequests.filter((r: any) => 
    r.status === "pending" && !r.is_draft && bidRequestIds.includes(r.id)
  );
  const pendingRequests = customRequests.filter((r: any) => 
    r.status === "pending" && !r.is_draft && !bidRequestIds.includes(r.id)
  );
  const draftRequests = customRequests.filter((r: any) => r.is_draft);

  const handleCreateRequest = async (data: any, isDraft: boolean) => {
    const result = await createCustomRequest(data, isDraft);
    return result;
  };

  const handleCancel = async (id: string) => {
    const { error } = await updateRequestStatus(id, "cancelled");
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Request cancelled successfully"
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteCustomRequest(id);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Request deleted successfully"
      });
    }
  };

  const handleSubmit = async (id: string) => {
    const { error } = await submitCustomRequest(id);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Request submitted successfully"
      });
    }
  };

  const handleAcceptBid = async (bidId: string, guideId: string, requestId: string) => {
    try {
      // Update the accepted booking to confirmed
      const { error: updateBookingError } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bidId);
      
      if (updateBookingError) throw updateBookingError;
      
      // Update the request to accepted with the guide_id
      const { error: updateRequestError } = await supabase
        .from("booking_requests")
        .update({ 
          status: "accepted",
          guide_id: guideId 
        })
        .eq("id", requestId);
      
      if (updateRequestError) throw updateRequestError;

      // Reject other bids for this request
      const { error: rejectError } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("request_id", requestId)
        .eq("status", "pending_confirmation")
        .neq("id", bidId);
      
      if (rejectError) throw rejectError;

      // Create or find conversation with the guide
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(participant_1_id.eq.${user?.id},participant_2_id.eq.${guideId}),and(participant_1_id.eq.${guideId},participant_2_id.eq.${user?.id})`)
        .single();

      if (!existingConversation) {
        await supabase
          .from("conversations")
          .insert({
            participant_1_id: user?.id,
            participant_2_id: guideId,
            booking_id: bidId
          });
      }
      
      toast({
        title: "Success",
        description: "Bid accepted! Redirecting to payment..."
      });
      
      // Redirect to payment page
      navigate(`/payment?booking=${bidId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept bid",
        variant: "destructive"
      });
    }
  };

  const handleMessage = (guideId: string) => {
    navigate(`/messages?user=${guideId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ExplorerNavbar showTabs={true} />

      {/* Main Content */}
      <div className="px-6 lg:px-10 xl:px-20 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">{t("requests.myRequests")}</h1>
            <p className="text-sm text-muted-foreground">Manage your custom tour requests and connect with guides</p>
          </div>
          <CreateCustomRequestDialog 
            onRequestCreated={refetch}
            onCreateRequest={handleCreateRequest}
          />
        </div>

        <Tabs defaultValue="bids" className="w-full">
          <TabsList className="grid w-full max-w-[700px] grid-cols-4">
            <TabsTrigger value="bids" className="gap-2">
              Bids
              {bidReceivedRequests.length > 0 && (
                <span className="bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {bidReceivedRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted" className="gap-2">
              My Requests
              {acceptedRequests.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {acceptedRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {pendingRequests.length > 0 && (
                <span className="bg-yellow-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="draft" className="gap-2">
              Drafts
              {draftRequests.length > 0 && (
                <span className="bg-muted-foreground text-white rounded-full px-2 py-0.5 text-xs">
                  {draftRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Bids Tab */}
          <TabsContent value="bids" className="mt-6">
            {loading || loadingBids ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading bids...</p>
              </div>
            ) : bidReceivedRequests.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Bids Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    When guides bid on your custom requests, they'll appear here for you to review and accept.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {bidReceivedRequests.map((request: any) => (
                  <Card key={request.id} className="p-6">
                    <CustomRequestCard
                      request={request}
                      userRole="explorer"
                      onMessage={handleMessage}
                    />
                    <div className="mt-6 pt-6 border-t">
                      <BidsList
                        requestId={request.id}
                        requestBudget={request.budget}
                        onAcceptBid={(bidId, guideId) => handleAcceptBid(bidId, guideId, request.id)}
                        onMessageGuide={handleMessage}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Accepted Requests Tab */}
          <TabsContent value="accepted" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            ) : acceptedRequests.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Accepted Requests</h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any accepted tour requests yet. Create a custom request to get started!
                  </p>
                  <CreateCustomRequestDialog 
                    onRequestCreated={refetch}
                    onCreateRequest={handleCreateRequest}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {acceptedRequests.map((request: any) => (
                  <CustomRequestCard
                    key={request.id}
                    request={request}
                    userRole="explorer"
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any pending requests. Create a new custom tour request!
                  </p>
                  <CreateCustomRequestDialog 
                    onRequestCreated={refetch}
                    onCreateRequest={handleCreateRequest}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingRequests.map((request: any) => (
                  <CustomRequestCard
                    key={request.id}
                    request={request}
                    userRole="explorer"
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Draft Requests Tab */}
          <TabsContent value="draft" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading drafts...</p>
              </div>
            ) : draftRequests.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Draft Requests</h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any draft requests. Create a custom tour request!
                  </p>
                  <CreateCustomRequestDialog 
                    onRequestCreated={refetch}
                    onCreateRequest={handleCreateRequest}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {draftRequests.map((request: any) => (
                  <CustomRequestCard
                    key={request.id}
                    request={request}
                    userRole="explorer"
                    onDelete={handleDelete}
                    onSubmit={handleSubmit}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExplorerRequests;
