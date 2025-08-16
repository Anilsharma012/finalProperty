import { useState } from "react";
import { Property } from "@shared/types";
import { MapPin, Heart, Phone, Calendar, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import PropertyChatModal from "./PropertyChatModal";

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  className?: string;
  showFavoriteButton?: boolean;
  onFavoriteClick?: (propertyId: string) => void;
  isFavorite?: boolean;
}

export default function PropertyCard({
  property,
  onClick,
  className = "",
  showFavoriteButton = false,
  onFavoriteClick,
  isFavorite = false,
}: PropertyCardProps) {
  const [showChatModal, setShowChatModal] = useState(false);
  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
    
    return priceType === "rent" ? `${formatted}/month` : formatted;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Property Image */}
      <div className="relative aspect-video bg-gray-100">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        {/* Favorite Button */}
        {showFavoriteButton && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteClick?.(property._id!);
            }}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white shadow-sm rounded-full"
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
            />
          </Button>
        )}

        {/* Premium Badge */}
        {property.premium && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Premium
          </div>
        )}

        {/* Featured Badge */}
        {property.featured && (
          <div className="absolute top-2 left-2 bg-[#C70000] text-white px-2 py-1 rounded text-xs font-semibold">
            Featured
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-lg overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {property.title}
        </h3>
          <span className="text-lg font-bold text-[#C70000] ml-2">
            {formatPrice(property.price, property.priceType)}
          </span>
        </div>

        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {property.location.area || property.location.address}
          </span>
        </div>

        {/* Property Specifications */}
        {property.specifications && (
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {property.specifications.bedrooms && (
              <span>{property.specifications.bedrooms} BHK</span>
            )}
            {property.specifications.area && (
              <span>{property.specifications.area} sq ft</span>
            )}
            {property.specifications.bathrooms && (
              <span>{property.specifications.bathrooms} Bath</span>
            )}
          </div>
        )}

        {/* Property Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(property.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {property.ownerType}
            </span>
            {property.contactVisible && (
              <Phone className="h-4 w-4 text-green-600" />
            )}
          </div>
        </div>

        {/* Description Preview */}
        {property.description && (
          <p className="text-gray-600 text-sm mt-2 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {property.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowChatModal(true);
            }}
            variant="outline"
            size="sm"
            className="flex-1 text-[#C70000] border-[#C70000] hover:bg-[#C70000] hover:text-white"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Chat
          </Button>
          {property.contactVisible && property.contactInfo && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${property.contactInfo.phone}`;
              }}
              variant="outline"
              size="sm"
              className="flex-1 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
            >
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      <PropertyChatModal
        property={property}
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />
    </div>
  );
}
