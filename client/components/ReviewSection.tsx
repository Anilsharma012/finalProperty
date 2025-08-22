import React, { useState, useEffect } from "react";
import { Review, ReviewSubmission } from "@shared/types";
import { ReviewList } from "./ReviewList";
import { ReviewForm } from "./ReviewForm";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Star,
  Plus,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Edit,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ReviewSectionProps {
  propertyId: string;
  className?: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  propertyId,
  className,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkUserReview();
    }
  }, [propertyId, user, refreshKey]);

  const checkUserReview = async () => {
    try {
      const response = await fetch("/api/user/reviews", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const hasReviewed = result.data.reviews.some(
            (review: Review) => review.propertyId === propertyId,
          );
          setUserHasReviewed(hasReviewed);
        }
      }
    } catch (error) {
      console.error("Error checking user review:", error);
    }
  };

  const handleSubmitReview = async (
    reviewData: ReviewSubmission,
    images?: File[],
  ) => {
    setSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("propertyId", reviewData.propertyId);
      formData.append("rating", reviewData.rating.toString());
      formData.append("title", reviewData.title);
      formData.append("comment", reviewData.comment);

      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const url = editingReview
        ? `/api/reviews/${editingReview._id}`
        : "/api/reviews";

      const method = editingReview ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({
          type: "success",
          text: editingReview
            ? "Review updated successfully!"
            : "Review submitted successfully!",
        });
        setShowReviewForm(false);
        setEditingReview(null);
        setUserHasReviewed(true);
        setRefreshKey((prev) => prev + 1);
      } else {
        throw new Error(result.error || "Failed to submit review");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to submit review",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = () => {
    setUserHasReviewed(false);
    setRefreshKey((prev) => prev + 1);
    setMessage({
      type: "success",
      text: "Review deleted successfully",
    });
  };

  const handleCloseForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Section Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>Reviews & Ratings</span>
            </div>

            {isAuthenticated && !userHasReviewed && (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Write Review</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Messages */}
          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className="mb-4"
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className="flex items-center justify-between">
                <span>{message.text}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessage}
                  className="ml-2 h-auto p-1"
                >
                  ×
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Authentication prompt */}
          {!isAuthenticated && (
            <Alert className="mb-4">
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                <a
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </a>{" "}
                to write a review and see all reviews for this property.
              </AlertDescription>
            </Alert>
          )}

          {/* User already reviewed notice */}
          {isAuthenticated && userHasReviewed && !editingReview && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You have already reviewed this property. You can edit your
                review from the review list below.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {editingReview ? (
                <>
                  <Edit className="h-5 w-5" />
                  <span>Edit Your Review</span>
                </>
              ) : (
                <>
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span>Write a Review</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <ReviewForm
            propertyId={propertyId}
            existingReview={editingReview || undefined}
            isEditing={!!editingReview}
            onSubmit={handleSubmitReview}
            onCancel={handleCloseForm}
            isLoading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Review List */}
      <ReviewList
        key={refreshKey}
        propertyId={propertyId}
        currentUserId={user?._id}
        isAdmin={user?.userType === "admin" || user?.userType === "staff"}
        onEditReview={handleEditReview}
        onDeleteReview={handleDeleteReview}
      />
    </div>
  );
};

// Compact version for property cards
interface ReviewSectionCompactProps {
  propertyId: string;
  onClick?: () => void;
  className?: string;
}

export const ReviewSectionCompact: React.FC<ReviewSectionCompactProps> = ({
  propertyId,
  onClick,
  className,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [propertyId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/reviews/stats`,
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching review stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div
        className={cn(
          "flex items-center space-x-1 text-gray-500 text-sm",
          className,
        )}
      >
        <Star className="h-4 w-4" />
        <span>No reviews</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < Math.floor(stats.averageRating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300",
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium">
        {stats.averageRating.toFixed(1)}
      </span>
      <span className="text-sm text-gray-500">({stats.totalReviews})</span>
    </div>
  );
};
