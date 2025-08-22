import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export const ReviewRating: React.FC<ReviewRatingProps> = ({
  rating,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        const halfFilled = star - 0.5 <= rating && star > rating;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => handleStarClick(star)}
            className={cn(
              "transition-colors duration-200",
              interactive ? "hover:scale-110 cursor-pointer" : "cursor-default",
              !interactive && "pointer-events-none",
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                filled
                  ? "text-yellow-400 fill-yellow-400"
                  : halfFilled
                    ? "text-yellow-400 fill-yellow-200"
                    : "text-gray-300",
                interactive && "hover:text-yellow-400",
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

interface ReviewRatingDisplayProps {
  rating: number;
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const ReviewRatingDisplay: React.FC<ReviewRatingDisplayProps> = ({
  rating,
  totalReviews,
  size = "md",
  showText = true,
  className,
}) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <ReviewRating rating={rating} size={size} />
      {showText && (
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <span className="font-medium">{rating.toFixed(1)}</span>
          {totalReviews !== undefined && (
            <span>
              ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
