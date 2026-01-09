import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const TestimonialCard = ({ review }: { review: any }) => (
  <Card className="hover:shadow-md transition-shadow duration-150">
    <CardContent className="p-6 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={review.explorer?.avatar_url} />
          <AvatarFallback>{review.explorer?.full_name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{review.explorer?.full_name || "Anonymous"}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{review.comment}</p>
    </CardContent>
  </Card>
);

export default TestimonialCard;
