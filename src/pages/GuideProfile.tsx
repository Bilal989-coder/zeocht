import { useState, useEffect } from "react";
import { GuideNavbar } from "@/components/GuideNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useServices } from "@/hooks/useServices";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, 
  Star, 
  Users, 
  Calendar,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Eye,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { GuideProfileEditDialog } from "@/components/GuideProfileEditDialog";
import { GuideAvailabilitySettings } from "@/components/GuideAvailabilitySettings";

interface Review {
  id: string;
  rating: number;
  comment: string;
  response: string | null;
  created_at: string;
  explorer: {
    full_name: string;
    avatar_url: string | null;
  };
  service: {
    title: string;
  };
}

export default function GuideProfile() {
  const { user } = useAuth();
  const { t, formatPrice } = useTranslation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("about");
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { services } = useServices();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchReviews();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          response,
          created_at,
          explorer:profiles!reviews_explorer_id_fkey(full_name, avatar_url),
          service:services!reviews_service_id_fkey(title)
        `)
        .eq("guide_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data as any || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const renderAboutSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-32 w-32 rounded-full bg-foreground text-background flex items-center justify-center text-4xl font-bold">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-32 w-32 rounded-full object-cover"
            />
          ) : (
            profile?.full_name?.charAt(0).toUpperCase() || "G"
          )}
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-foreground">
            {profile?.full_name || "Guide"}
          </h2>
          {profile?.guide_title && (
            <p className="text-lg text-muted-foreground">{profile.guide_title}</p>
          )}
          {profile?.location && (
            <div className="flex items-center justify-center gap-1 text-muted-foreground mt-2">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {profile?.bio && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("guide.aboutMe")}
          </h3>
          <p className="text-muted-foreground">{profile.bio}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-foreground">
            {profile?.total_bookings || 0}
          </div>
          <div className="text-sm text-muted-foreground">Bookings</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-foreground">{averageRating}</span>
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>
          <div className="text-sm text-muted-foreground">Rating</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-foreground">
            {profile?.response_rate || 0}%
          </div>
          <div className="text-sm text-muted-foreground">{t("guide.responseRate")}</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-foreground">
            {profile?.followers_count || 0}
          </div>
          <div className="text-sm text-muted-foreground">Followers</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          {t("guide.guideSince")} {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "-"}
        </span>
      </div>

      <Button onClick={() => setEditDialogOpen(true)} className="w-full">
        <Edit className="h-4 w-4 mr-2" />
        {t("guide.editProfile")}
      </Button>
    </div>
  );

  const renderServicesSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground mb-2">
          {t("guide.myServices")}
        </h2>
        <p className="text-muted-foreground">
          Manage your experiences and track performance
        </p>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{t("guide.noServicesYet")}</p>
          <Button onClick={() => navigate("/guide/service/new")}>
            {t("guide.createFirstService")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {service.image_urls && service.image_urls[0] && (
                    <img
                      src={service.image_urls[0]}
                      alt={service.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {service.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {service.location}
                        </div>
                      </div>
                      <Badge variant={service.status === "active" ? "default" : "secondary"}>
                        {service.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {service.views_count || 0} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {service.bookings_count || 0} bookings
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {service.rating_avg || 0} ({service.reviews_count || 0})
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/experience/${service.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/guide/service/${service.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderReviewsSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground mb-2">
          {t("guide.reviewsReceived")}
        </h2>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-2xl font-bold text-foreground">{averageRating}</span>
          </div>
          <span>{reviews.length} {t("guide.totalReviews")}</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t("guide.noReviews")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
                    {review.explorer.avatar_url ? (
                      <img
                        src={review.explorer.avatar_url}
                        alt={review.explorer.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      review.explorer.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {review.explorer.full_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(review.created_at), "MMMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {t("guide.reviewOn")} {review.service.title}
                    </Badge>
                    <p className="text-foreground mt-3">{review.comment}</p>
                    {review.response && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-semibold text-foreground mb-1">
                          {t("guide.guideResponse")}
                        </p>
                        <p className="text-sm text-muted-foreground">{review.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderStatsSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground mb-2">
          {t("guide.stats")}
        </h2>
        <p className="text-muted-foreground">Track your performance and earnings</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatPrice(profile?.total_earnings || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold text-foreground">
                {profile?.total_bookings || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Active Services</p>
              <p className="text-2xl font-bold text-foreground">
                {services.filter((s) => s.status === "active").length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <GuideNavbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GuideNavbar />
      <GuideProfileEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        profile={profile}
        onProfileUpdated={fetchProfile}
      />
      <main className="px-6 lg:px-10 xl:px-20 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Left Sidebar */}
          <aside className="space-y-2">
            <Card className="border border-border rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-2">
                <button
                  onClick={() => setActiveSection("about")}
                  className={`w-full text-left text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                    activeSection === "about"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {t("guide.aboutMe")}
                </button>
                <button
                  onClick={() => setActiveSection("services")}
                  className={`w-full text-left text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                    activeSection === "services"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {t("guide.myServices")}
                </button>
                <button
                  onClick={() => setActiveSection("reviews")}
                  className={`w-full text-left text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                    activeSection === "reviews"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {t("guide.reviewsReceived")}
                </button>
                <button
                  onClick={() => setActiveSection("stats")}
                  className={`w-full text-left text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                    activeSection === "stats"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {t("guide.stats")}
                </button>
                <button
                  onClick={() => setActiveSection("availability")}
                  className={`w-full text-left text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                    activeSection === "availability"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  Availability & Pricing
                </button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div>
            <Card className="border border-border rounded-2xl shadow-sm">
              <CardContent className="p-8">
                {activeSection === "about" && renderAboutSection()}
                {activeSection === "services" && renderServicesSection()}
                {activeSection === "reviews" && renderReviewsSection()}
                {activeSection === "stats" && renderStatsSection()}
                {activeSection === "availability" && <GuideAvailabilitySettings />}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
