import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock } from "lucide-react";

const BookingServiceCard = ({ service, onBook }: { service: any; onBook: () => void }) => {
  return (
    <Card className="p-5 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="space-y-3">
        <h3 className="text-lg font-semibold">{service.title}</h3>
        <p className="text-muted-foreground text-sm">{service.description}</p>
        <div className="flex justify-between items-center">
          <p className="font-semibold text-primary">Starting at ${service.price}</p>
          {service.rating_avg && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{service.rating_avg}</span>
            </div>
          )}
        </div>
        {service.next_available && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Next available {service.next_available}</span>
          </div>
        )}
        <Button onClick={onBook} className="w-full mt-2">
          See times
        </Button>
      </CardContent>
    </Card>
  );
};

export default BookingServiceCard;
