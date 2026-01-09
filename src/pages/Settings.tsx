import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LanguageModal } from "@/components/LanguageModal";
import { RoleSwitchDialog } from "@/components/RoleSwitchDialog";
import { ExplorerNavbar } from "@/components/ExplorerNavbar";
import { GuideNavbar } from "@/components/GuideNavbar";
import {
  User,
  Bell,
  Shield,
  Globe,
  Users,
  Settings as SettingsIcon,
  Lock,
  Mail,
  Trash2,
  ArrowLeft,
} from "lucide-react";

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeRole } = useRole();
  const { getLocaleName, getCurrencyName } = useLocale();
  const { preferences, loading: prefsLoading, updatePreference } = useNotificationPreferences();
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showRoleSwitchDialog, setShowRoleSwitchDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const isGuide = activeRole === "host";
  const Navbar = isGuide ? GuideNavbar : ExplorerNavbar;

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    // Note: Full account deletion requires backend function
    toast.info("Please contact support to delete your account");
    setShowDeleteDialog(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Language</span>
            </TabsTrigger>
            <TabsTrigger value="role" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Role</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Address
                </CardTitle>
                <CardDescription>Your email address is used for login and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Input value={user?.email || ""} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground mt-2">
                  Contact support to change your email address
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={passwordLoading || !newPassword || !confirmPassword}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>Permanently delete your account and all associated data</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label>Type DELETE to confirm</Label>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETE"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        Delete Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what emails you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Confirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails when bookings are confirmed or updated
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_bookings ?? true}
                    onCheckedChange={(checked) => updatePreference("email_bookings", checked)}
                    disabled={prefsLoading}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Message Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you receive new messages
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_messages ?? true}
                    onCheckedChange={(checked) => updatePreference("email_messages", checked)}
                    disabled={prefsLoading}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders before your upcoming bookings
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_reminders ?? true}
                    onCheckedChange={(checked) => updatePreference("email_reminders", checked)}
                    disabled={prefsLoading}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing & Promotions</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and special offers
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_marketing ?? false}
                    onCheckedChange={(checked) => updatePreference("email_marketing", checked)}
                    disabled={prefsLoading}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>Manage in-app notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive real-time notifications in the app
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.push_enabled ?? true}
                    onCheckedChange={(checked) => updatePreference("push_enabled", checked)}
                    disabled={prefsLoading}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Manage your privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      {isGuide 
                        ? "Your guide profile is visible to explorers searching for experiences" 
                        : "Your profile is only visible to guides you interact with"}
                    </p>
                  </div>
                  {isGuide && (
                    <Button variant="outline" size="sm" onClick={() => navigate("/guide/profile")}>
                      Edit Profile
                    </Button>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Data & Privacy</Label>
                  <p className="text-sm text-muted-foreground">
                    We take your privacy seriously. Your data is encrypted and securely stored.
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Download My Data (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language & Region */}
          <TabsContent value="language" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Language & Currency</CardTitle>
                <CardDescription>Set your preferred language and currency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground">
                      Current: {getLocaleName()}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setShowLanguageModal(true)}>
                    Change
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Currency</Label>
                    <p className="text-sm text-muted-foreground">
                      Current: {getCurrencyName()}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setShowLanguageModal(true)}>
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timezone</CardTitle>
                <CardDescription>Set your timezone for booking times</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={preferences?.timezone || "UTC"}
                  onValueChange={(value) => updatePreference("timezone", value)}
                  disabled={prefsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role Management */}
          <TabsContent value="role" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Role</CardTitle>
                <CardDescription>You are currently using the app as {isGuide ? "a Guide" : "an Explorer"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isGuide ? "bg-primary/10" : "bg-secondary"}`}>
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{isGuide ? "Guide" : "Explorer"}</p>
                      <p className="text-sm text-muted-foreground">
                        {isGuide 
                          ? "Create and manage experiences for travelers" 
                          : "Discover and book unique experiences"}
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRoleSwitchDialog(true)}
                  className="w-full"
                >
                  Switch to {isGuide ? "Explorer" : "Guide"}
                </Button>
              </CardContent>
            </Card>

            {isGuide && (
              <Card>
                <CardHeader>
                  <CardTitle>Guide Settings</CardTitle>
                  <CardDescription>Manage your availability and pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/guide/profile")}
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Edit Guide Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/guide/dashboard")}
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Availability & Pricing
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <div className="flex justify-center">
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </main>

      <LanguageModal open={showLanguageModal} onOpenChange={setShowLanguageModal} />
      <RoleSwitchDialog
        open={showRoleSwitchDialog}
        onOpenChange={setShowRoleSwitchDialog}
        targetRole={isGuide ? "explorer" : "host"}
      />
    </div>
  );
}
