import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Menu,
  User,
  Settings,
  LogOut,
  MessageCircle,
  Calendar,
  ArrowRightLeft,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { LanguageModal } from "./LanguageModal";
import { RoleSwitchDialog } from "./RoleSwitchDialog";
import logo from "@/assets/logo3.png";

interface ExplorerNavbarProps {
  activeTab?: "experiences" | "guides" | "favorites" | "bookings";
  onTabChange?: (tab: "experiences" | "guides" | "favorites") => void;
  showTabs?: boolean;
}

export const ExplorerNavbar = ({
  activeTab,
  onTabChange,
  showTabs = true,
}: ExplorerNavbarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLocale();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);

  const handleTabClick = (tab: "experiences" | "guides" | "favorites") => {
    if (onTabChange) onTabChange(tab);
    else navigate(`/explorer/dashboard?tab=${tab}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      {/* container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-20">
        {/* bar */}
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div
              className="cursor-pointer flex items-center"
              onClick={() => navigate("/explorer/dashboard")}
            >
              <img src={logo} alt="ZeoChat" className="h-9 w-auto" />
            </div>
          </div>

          {/* Center: Tabs */}
          {showTabs && (
            <div className="hidden lg:flex items-center justify-center gap-2">
              <button
                onClick={() => handleTabClick("experiences")}
                className={`text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                  activeTab === "experiences"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {t("nav.experiences")}
              </button>

              <button
                onClick={() => handleTabClick("guides")}
                className={`text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                  activeTab === "guides"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {t("nav.guides")}
              </button>

              <button
                onClick={() => handleTabClick("favorites")}
                className={`text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                  activeTab === "favorites"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {t("nav.favorites")}
              </button>
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              className="hidden md:flex h-10 rounded-full px-4 text-sm font-medium text-foreground hover:bg-muted"
              onClick={() => navigate("/explorer/bookings")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </Button>

            <Button
              variant="ghost"
              className="hidden md:flex h-10 rounded-full px-4 text-sm font-medium text-foreground hover:bg-muted"
              onClick={() => navigate("/explorer/requests")}
            >
              {t("nav.myRequests")}
            </Button>

            {/* Language */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted"
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
                  className="flex items-center gap-2 h-10 rounded-full border border-border bg-background px-3 hover:bg-muted/40 transition-colors"
                >
                  <Menu className="h-4 w-4" />
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-60 p-0 bg-card z-50" align="end">
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate("/explorer/profile");
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {t("nav.profile")}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      navigate("/explorer/bookings");
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      My Bookings
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      navigate("/messages");
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Messages
                    </span>
                  </button>

                  <Separator className="my-2" />

                  <button
                    onClick={() => {
                      navigate("/settings");
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {t("nav.settings")}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setLanguageModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {t("nav.language")}
                    </span>
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
                    <span className="text-sm font-medium text-foreground">
                      Become a Guide
                    </span>
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
                    <span className="text-sm font-medium text-foreground">
                      {t("nav.signOut")}
                    </span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <RoleSwitchDialog
              open={roleSwitchOpen}
              onOpenChange={setRoleSwitchOpen}
              targetRole="host"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
