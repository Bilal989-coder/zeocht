import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, Users, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { ExplorerNavbar } from "@/components/ExplorerNavbar";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const ExplorerProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLocale();

  const [activeSection, setActiveSection] = useState<"about" | "trips" | "following">("about");

  // Profile state (from Supabase profiles table)
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Edit dialog state
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  // Safe display values
  const displayInitial = useMemo(() => {
    const email = user?.email ?? "";
    return (profile?.full_name?.charAt(0) || email.charAt(0) || "U").toUpperCase();
  }, [user?.email, profile?.full_name]);

  const displayName = useMemo(() => {
    return profile?.full_name || (user?.user_metadata as any)?.full_name || user?.email || "User";
  }, [profile?.full_name, user]);

  // Fetch profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfileLoading(false);

      if (error) {
        console.error(error);
        toast.error("Profile load nahi hua");
        return;
      }

      setProfile(data);

      // set form defaults
      setFullName(data.full_name ?? "");
      setPhone(data.phone ?? "");
      setLocation(data.location ?? "");
      setBio(data.bio ?? "");
    };

    fetchProfile();
  }, [user?.id]);

  const openEditDialog = () => {
    // reset fields from current profile (so cancel doesn't keep dirty values)
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setLocation(profile?.location ?? "");
    setBio(profile?.bio ?? "");
    setOpenEdit(true);
  };

  const saveProfile = async () => {
    if (!user?.id) {
      toast.error("User session missing");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        location: location.trim() || null,
        bio: bio.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("*")
      .single();

    setSaving(false);

    if (error) {
      console.error(error);
      toast.error(error.message || "Profile update fail");
      return;
    }

    setProfile(data);
    toast.success("Profile updated ✅");
    setOpenEdit(false);
  };

  // If route is protected, user should exist, but still safe:
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Please login first
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ExplorerNavbar showTabs={true} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 xl:px-20 py-8">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* Left Sidebar */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">{t("profile.profile")}</h1>

            {/* Navigation Menu */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveSection("about")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-colors text-left ${
                  activeSection === "about" ? "bg-muted shadow-sm" : "hover:bg-muted/50"
                }`}
              >
                <Avatar className="h-10 w-10 bg-foreground">
                  <AvatarFallback className="bg-foreground text-background font-semibold">
                    {displayInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="text-base font-medium text-foreground">{t("profile.aboutMe")}</span>
              </button>

              <button
                onClick={() => setActiveSection("trips")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-colors text-left ${
                  activeSection === "trips" ? "bg-muted shadow-sm" : "hover:bg-muted/50"
                }`}
              >
                <div className="h-10 w-10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-foreground" />
                </div>
                <span className="text-base font-medium text-foreground">{t("profile.pastExperiences")}</span>
              </button>

              <button
                onClick={() => setActiveSection("following")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-colors text-left ${
                  activeSection === "following" ? "bg-muted shadow-sm" : "hover:bg-muted/50"
                }`}
              >
                <div className="h-10 w-10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-foreground" />
                </div>
                <span className="text-base font-medium text-foreground">{t("profile.following")}</span>
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div>
            {activeSection === "about" && (
              <Card className="border border-border rounded-2xl shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <h2 className="text-3xl font-semibold text-foreground">{t("profile.aboutMe")}</h2>

                    {/* ✅ FIXED EDIT BUTTON */}
                    <Button
                      variant="ghost"
                      className="text-sm font-medium underline hover:bg-transparent"
                      onClick={openEditDialog}
                      disabled={profileLoading}
                    >
                      {t("profile.edit")}
                    </Button>
                  </div>

                  {/* User Avatar and Name */}
                  <div className="flex flex-col items-center text-center mb-8">
                    <Avatar className="h-32 w-32 mb-4 bg-foreground">
                      <AvatarFallback className="bg-foreground text-background text-5xl font-semibold">
                        {displayInitial}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="text-3xl font-semibold text-foreground mb-1">
                      {profileLoading ? "Loading..." : displayName}
                    </h3>

                    <p className="text-base text-muted-foreground">{user.email}</p>
                    <p className="text-base text-muted-foreground mt-1">{t("profile.explorer")}</p>

                    {/* Optional small info */}
                    {!!profile?.location && (
                      <p className="text-sm text-muted-foreground mt-2">📍 {profile.location}</p>
                    )}
                  </div>

                  {/* Complete Profile Card */}
                  <Card className="border border-border bg-background">
                    <CardContent className="p-6">
                      <h4 className="text-xl font-semibold text-foreground mb-3">
                        {t("profile.completeProfile")}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-6">
                        {t("profile.completeProfileDesc")}
                      </p>

                      <Button
                        className="w-full sm:w-auto bg-[#FF385C] hover:bg-[#E31C5F] text-white font-medium px-6 py-3 rounded-lg"
                        onClick={openEditDialog}
                      >
                        {t("profile.getStarted")}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Reviews Section */}
                  <div className="mt-8 pt-8 border-t border-border">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-base">{t("profile.reviewsWritten")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "trips" && (
              <Card className="border border-border rounded-2xl shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-semibold text-foreground mb-6">
                    {t("profile.pastExperiences")}
                  </h2>
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">{t("profile.noExperiences")}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "following" && (
              <Card className="border border-border rounded-2xl shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-semibold text-foreground mb-6">{t("profile.following")}</h2>
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">{t("profile.notFollowing")}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Edit Profile Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xx-xxxxxxx" />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Karachi, Pakistan" />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write something..." />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenEdit(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExplorerProfile;
