import { Star, MapPin, Eye, Users, DollarSign, Edit, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

interface ServiceCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  views: number;
  bookings: number;
  status: "active" | "draft" | "paused" | "archived";
  type: "live" | "recorded" | "both";
  onEdit?: () => void;
}

const ServiceCard = ({
  id,
  image,
  title,
  location,
  price,
  rating,
  views,
  bookings,
  status,
  type,
  onEdit,
}: ServiceCardProps) => {
  const navigate = useNavigate();
  const { t, formatPrice } = useTranslation();

  const statusColors = {
    active: "bg-green-500",
    draft: "bg-yellow-500",
    paused: "bg-gray-500",
    archived: "bg-red-500",
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onClick={() => navigate(`/experience/${id}`)}
        />
        
        {/* Status badge (top left) */}
        <div className="absolute top-3 left-3">
          <Badge className={`${statusColors[status]} text-white text-xs font-medium px-2 py-1`}>
            {status === "active" && t("guide.active")}
            {status === "draft" && t("guide.draft")}
            {status === "paused" && t("guide.paused")}
            {status === "archived" && "Archived"}
          </Badge>
        </div>

        {/* Edit button (top right) */}
        <button 
          className="absolute top-3 right-3 p-2 bg-white rounded-full hover:scale-110 transition-transform z-10 shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
        >
          <Edit className="h-4 w-4 text-gray-700" />
        </button>
      </div>
      
      <div className="flex items-start justify-between gap-1 mb-1">
        <h3 className="font-medium text-[15px] text-gray-900 line-clamp-1">
          {location}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star className="h-3.5 w-3.5 fill-gray-900 text-gray-900" />
          <span className="text-[15px] text-gray-900">{rating.toFixed(1)}</span>
        </div>
      </div>
      
      <p className="text-[15px] text-gray-600 mb-2 line-clamp-1">
        {title}
      </p>

      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>{views} {t("guide.views")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{bookings} {t("guide.bookings")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Video className="h-3 w-3" />
          <span className="capitalize">{type}</span>
        </div>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="font-semibold text-[15px] text-gray-900">{formatPrice(price)}</span>
        <span className="text-[15px] text-gray-600">{t("experienceCard.session")}</span>
      </div>
    </div>
  );
};

export default ServiceCard;