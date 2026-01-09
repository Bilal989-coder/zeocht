import { Star, MapPin, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useFavorites } from "@/hooks/useFavorites";
import { useState } from "react";

interface GuideCardProps {
  id: string;
  avatar: string | null;
  name: string;
  title: string | null;
  location: string | null;
  rating: number;
  reviewsCount: number;
  responseRate: number | null;
  responseTime: string | null;
  totalBookings: number;
  languagesSpoken: string[] | null;
  verificationStatus: string;
  bio: string | null;
}

const GuideCard = ({
  id,
  avatar,
  name,
  title,
  location,
  rating,
  reviewsCount,
  totalBookings,
}: GuideCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { favorites, toggleFavorite } = useFavorites();
  const [isHovered, setIsHovered] = useState(false);
  
  const isFavorite = favorites.has(id);
  const isPopular = totalBookings > 10;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <Card 
      className="group cursor-pointer transition-all hover:shadow-lg overflow-hidden border-border bg-card flex-shrink-0 w-full"
      onClick={() => navigate(`/explore/guides/${id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={avatar || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Popular Badge */}
        {isPopular && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
          >
            Popular
          </Badge>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isFavorite ? "fill-primary text-primary" : "text-foreground"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-1">
        {/* Title and Location */}
        <h3 className="font-semibold text-base text-foreground line-clamp-1">
          {name}
        </h3>
        
        {title && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {title}
          </p>
        )}
        
        {location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}
        
        {/* Rating and Reviews */}
        <div className="flex items-center gap-1 pt-1">
          <Star className="h-4 w-4 fill-foreground text-foreground" />
          <span className="font-medium text-sm">
            {rating > 0 ? rating.toFixed(2) : "New"}
          </span>
          {reviewsCount > 0 && (
            <span className="text-sm text-muted-foreground">
              ({reviewsCount.toLocaleString()} {reviewsCount === 1 ? "review" : "reviews"})
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GuideCard;
