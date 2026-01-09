import { Star, MapPin, Video, Heart, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useLocale } from "@/contexts/LocaleContext";
import { useFavorites } from "@/hooks/useFavorites";

interface ExperienceCardProps {
  id?: string;
  image: string;
  title: string;
  guide: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  type: "live" | "recorded" | "both" | "popular" | "originals";
  isGuestFavorite?: boolean;
  isFavorite?: boolean;
  hostAvatar?: string;
  onHover?: (id: string | null) => void;
  isHighlighted?: boolean;
}

const ExperienceCard = ({
  id = "1",
  image,
  title,
  guide,
  location,
  price,
  rating,
  reviews,
  type,
  isGuestFavorite = false,
  isFavorite = false,
  hostAvatar,
  onHover,
  isHighlighted = false,
}: ExperienceCardProps) => {
  const navigate = useNavigate();
  const { t, formatPrice } = useLocale();
  const { toggleFavorite, isFavorite: checkIsFavorite } = useFavorites();
  
  const isFavoritedByUser = checkIsFavorite(id);

  return (
    <div 
      className={`group cursor-pointer transition-all ${isHighlighted ? 'ring-2 ring-primary' : ''}`}
      onClick={() => navigate(`/experience/${id}`)}
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Heart icon (top right) */}
        <button 
          className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform z-10"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(id);
          }}
        >
          <Heart 
            className={`h-5 w-5 ${isFavoritedByUser ? 'fill-red-500 text-red-500' : 'fill-black/50 text-white'} stroke-2`}
          />
        </button>

        {/* Guest favorite badge (top left) */}
        {isGuestFavorite && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-white text-gray-800 text-xs font-medium px-2 py-1 flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {t("experienceCard.guestFavorite")}
            </Badge>
          </div>
        )}

        {/* Host avatar (bottom left) */}
        {hostAvatar && (
          <div className="absolute bottom-3 left-3">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src={hostAvatar} alt={guide} />
              <AvatarFallback>{guide.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      
      <div className="flex items-start justify-between gap-1 mb-1">
        <h3 className="font-medium text-[15px] text-gray-900 line-clamp-1">
          {location}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star className="h-3.5 w-3.5 fill-gray-900 text-gray-900" />
          <span className="text-[15px] text-gray-900">{rating}</span>
        </div>
      </div>
      
      <p className="text-[15px] text-gray-600 mb-1 line-clamp-1">
        {title}
      </p>
      
      <p className="text-[15px] text-gray-600 mb-2">
        {t("experienceCard.hostedBy")} {guide}
      </p>
      
      <div className="flex items-baseline gap-1">
        <span className="font-semibold text-[15px] text-gray-900">{formatPrice(price)}</span>
        <span className="text-[15px] text-gray-600">{t("experienceCard.session")}</span>
      </div>
    </div>
  );
};

export default ExperienceCard;
