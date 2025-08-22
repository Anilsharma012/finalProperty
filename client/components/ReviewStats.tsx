import React from "react";
import { ReviewStats as ReviewStatsType } from "@shared/types";
import { ReviewRatingDisplay } from "./ReviewRating";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewStatsProps {
  stats: ReviewStatsType;
  className?: string;
  compact?: boolean;
}

export const ReviewStats: React.FC<ReviewStatsProps> = ({
  stats,
  className,
  compact = false,
}) => {
  const { totalReviews, averageRating, ratingDistribution } = stats;

  if (totalReviews === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="py-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-gray-100 rounded-full p-4">
              <Star className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">No Reviews Yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Be the first to review this property
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center space-x-4 p-4 bg-gray-50 rounded-lg",
          className,
        )}
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mt-1">
            <ReviewRatingDisplay
              rating={averageRating}
              size="sm"
              showText={false}
            />
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <div className="font-medium">{totalReviews} Reviews</div>
          <div>Average Rating</div>
        </div>
      </div>
    );
  }

  const getPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-400" />
          <span>Customer Reviews</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Rating Summary */}
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            <div className="mt-2">
              <ReviewRatingDisplay
                rating={averageRating}
                size="md"
                showText={false}
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Rating Breakdown</h4>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                ratingDistribution[rating as keyof typeof ratingDistribution];
              const percentage = getPercentage(count);

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  </div>

                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>

                  <div className="w-16 text-right">
                    <span className="text-sm text-gray-600">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rating Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {(
                  ((ratingDistribution[5] + ratingDistribution[4]) /
                    totalReviews) *
                  100
                ).toFixed(0)}
                %
              </div>
              <div className="text-xs text-gray-600">Positive</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">
                {((ratingDistribution[3] / totalReviews) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Neutral</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for inline rating display in property cards
interface InlineReviewStatsProps {
  stats: ReviewStatsType;
  className?: string;
}

export const InlineReviewStats: React.FC<InlineReviewStatsProps> = ({
  stats,
  className,
}) => {
  if (stats.totalReviews === 0) {
    return (
      <div
        className={cn("flex items-center space-x-1 text-gray-500", className)}
      >
        <Star className="h-4 w-4" />
        <span className="text-sm">No reviews</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <ReviewRatingDisplay
        rating={stats.averageRating}
        totalReviews={stats.totalReviews}
        size="sm"
        className="text-sm"
      />
    </div>
  );
};
