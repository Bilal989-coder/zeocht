import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface AcceptCustomRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (price: number) => void;
  requestTitle: string;
  suggestedBudget?: number;
}

export function AcceptCustomRequestDialog({
  open,
  onOpenChange,
  onConfirm,
  requestTitle,
  suggestedBudget,
}: AcceptCustomRequestDialogProps) {
  const [price, setPrice] = useState(suggestedBudget?.toString() || "");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      setError("Please enter a valid price");
      return;
    }
    onConfirm(priceNum);
    setPrice("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept Custom Request</DialogTitle>
          <DialogDescription>
            Set your price for "{requestTitle}"
            {suggestedBudget && (
              <span className="block mt-2 text-sm">
                Suggested budget: ${suggestedBudget}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="price">Your Price (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setError("");
                }}
                className="pl-9"
                min="0"
                step="0.01"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <p className="text-sm text-muted-foreground">
            By accepting this request, you'll create a booking that the explorer can confirm and pay for.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Accept & Set Price
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
