import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import logo from "@/assets/logo3.png";

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { activeRole } = useRole();

  const dashboardLink = activeRole === "explorer" ? "/explorer/dashboard" : "/guide/dashboard";

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            to={isAuthenticated ? dashboardLink : "/"}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              src={logo}
              alt="ZeoChat"
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <Link to="/messages">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageCircle className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                  </Button>
                </Link>
                <Link to={dashboardLink}>
                  <Button size="sm" className="bg-primary hover:bg-primary-dark text-primary-foreground">
                    Dashboard
                  </Button>
                </Link>
              </>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
