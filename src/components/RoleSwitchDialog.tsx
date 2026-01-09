import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";
import { Compass, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface RoleSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetRole: "explorer" | "host";
}

export const RoleSwitchDialog = ({
  open,
  onOpenChange,
  targetRole,
}: RoleSwitchDialogProps) => {
  const navigate = useNavigate();
  const { switchRole } = useRole();
  const [loading, setLoading] = useState(false);

  const isBecomingGuide = targetRole === "host";

  const handleSwitch = async () => {
    setLoading(true);
    try {
      await switchRole(targetRole);
      toast.success(
        isBecomingGuide
          ? "You are now a Guide! Welcome to your new dashboard."
          : "You are now an Explorer! Discover amazing experiences."
      );
      onOpenChange(false);
      navigate(isBecomingGuide ? "/guide/dashboard" : "/explorer/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to switch role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBecomingGuide ? (
              <>
                <User className="h-5 w-5 text-primary" />
                Become a Guide
              </>
            ) : (
              <>
                <Compass className="h-5 w-5 text-primary" />
                Switch to Explorer
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isBecomingGuide
              ? "As a Guide, you can create services, accept bookings, and earn money by sharing your expertise."
              : "As an Explorer, you can discover and book amazing experiences from guides around the world."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium mb-2">What changes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {isBecomingGuide ? (
                <>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Access to Guide dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Create and manage services
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Accept booking requests
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Track earnings and reviews
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Access to Explorer dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Browse and book experiences
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Save favorites
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Send custom requests
                  </li>
                </>
              )}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            You can switch back anytime from your profile menu.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSwitch} disabled={loading}>
            {loading
              ? "Switching..."
              : isBecomingGuide
              ? "Become a Guide"
              : "Switch to Explorer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
