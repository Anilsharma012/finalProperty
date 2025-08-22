import React, { useState, useRef } from "react";
import { Review, ReviewSubmission } from "@shared/types";
import { ReviewRating } from "./ReviewRating";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Camera, X, Star, AlertCircle, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  propertyId?: string;
  existingReview?: Review;
  isEditing?: boolean;
  onSubmit: (reviewData: ReviewSubmission, images?: File[]) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  propertyId,
  existingReview,
  isEditing = false,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    if (!title.trim()) {
      newErrors.title = "Please enter a review title";
    } else if (title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters long";
    }

    if (!comment.trim()) {
      newErrors.comment = "Please enter your review comment";
    } else if (comment.trim().length < 10) {
      newErrors.comment = "Comment must be at least 10 characters long";
    }

    if (images.length > 5) {
      newErrors.images = "Maximum 5 images allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const reviewData: ReviewSubmission = {
      propertyId: propertyId || existingReview!.propertyId,
      rating,
      title: title.trim(),
      comment: comment.trim(),
    };

    try {
      await onSubmit(reviewData, images);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 5) {
      setErrors({ ...errors, images: "Maximum 5 images allowed" });
      return;
    }

    setErrors({ ...errors, images: "" });

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);

    setImages(newImages);
    setPreviews(newPreviews);
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Select Rating";
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-400" />
          <span>{isEditing ? "Edit Your Review" : "Write a Review"}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-sm font-medium">
              Rating *
            </Label>
            <div className="flex items-center space-x-3">
              <ReviewRating
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
              <span className="text-sm font-medium text-gray-700">
                {getRatingText(rating)}
              </span>
            </div>
            {errors.rating && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {errors.rating}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Title Section */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Review Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              maxLength={100}
              className={errors.title ? "border-red-500" : ""}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {title.length}/100 characters
              </span>
              {errors.title && (
                <span className="text-xs text-red-500">{errors.title}</span>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Your Review *
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your detailed experience with this property..."
              rows={5}
              maxLength={1000}
              className={errors.comment ? "border-red-500" : ""}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {comment.length}/1000 characters
              </span>
              {errors.comment && (
                <span className="text-xs text-red-500">{errors.comment}</span>
              )}
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Photos (Optional)</Label>
            <div className="space-y-3">
              {/* Upload Button */}
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 5}
                  className="flex items-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>Add Photos</span>
                </Button>
                <span className="text-xs text-gray-500">
                  ({images.length}/5 photos)
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {errors.images}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || rating === 0}
              className="min-w-24"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isEditing ? "Updating..." : "Publishing..."}</span>
                </div>
              ) : (
                <span>{isEditing ? "Update Review" : "Publish Review"}</span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
