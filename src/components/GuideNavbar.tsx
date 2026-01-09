import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Menu, Settings, LogOut, Bell, ArrowRightLeft } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageModal } from "./LanguageModal";
import { RoleSwitchDialog } from "./RoleSwitchDialog";
import logo from "@/assets/logo3.png";

interface GuideNavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showTabs?: boolean;
  unreadCount?: number;
}

export const GuideNavbar = ({ activeTab, onTabChange, showTabs = true, unreadCount = 0 }: GuideNavbarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <header className="border-b border-border sticky top-0 bg-background z-50">
      <div className="px-6 lg:px-10 xl:px-20 py-4 bg-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="cursor-pointer" onClick={() => navigate("/guide/dashboard")}>
              <img src={logo} alt="ZeoChat" className="h-10 w-auto" />
            </div>
          </div>

          {/* Center Navigation - Desktop Tabs */}
          {showTabs && (
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => handleTabClick("services")}
                className={`text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                  activeTab === "services" 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {t("guide.myServices")}
              </button>
              <button
                onClick={() => handleTabClick("requests")}
                className={`relative text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                  activeTab === "requests" 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {t("guide.requests")}
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => {
                  navigate("/messages");
                  handleTabClick("messages");
                }}
                className={`text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                  activeTab === "messages" 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {t("guide.messages")}
              </button>
              <button
                onClick={() => handleTabClick("earnings")}
                className={`text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                  activeTab === "earnings" 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {t("guide.earnings")}
              </button>
              <button
                onClick={() => {
                  navigate("/guide/bookings");
                  handleTabClick("bookings");
                }}
                className={`text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                  activeTab === "bookings" 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => {
                  navigate("/guide/profile");
                  handleTabClick("profile");
                }}
                className={`text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                  activeTab === "profile" 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {t("guide.profile")}
              </button>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-muted rounded-full relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {/* Language & Currency Selector */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-muted rounded-full"
              onClick={() => setLanguageModalOpen(true)}
            >
              <Globe className="h-4 w-4" />
            </Button>

            <LanguageModal 
              open={languageModalOpen} 
              onOpenChange={setLanguageModalOpen}
            />
            
            {/* User Menu */}
            <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <PopoverTrigger asChild>
                <button 
                  type="button"
                  className="flex items-center gap-2 border border-border rounded-full py-1.5 px-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <Menu className="h-4 w-4" />
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">{user?.email?.charAt(0).toUpperCase() || 'G'}</span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0 bg-card z-50" align="end">
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Settings</span>
                  </button>
                  
                  <Separator className="my-2" />
                  
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setLanguageModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{t("nav.language")}</span>
                  </button>
                  
                  <Separator className="my-2" />

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setRoleSwitchOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Switch to Explorer</span>
                  </button>
                  
                  <Separator className="my-2" />
                  
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{t("nav.signOut")}</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <RoleSwitchDialog
              open={roleSwitchOpen}
              onOpenChange={setRoleSwitchOpen}
              targetRole="explorer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};