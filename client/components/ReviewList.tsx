import React, { useState, useEffect } from 'react';
import { Review, ReviewStats as ReviewStatsType, ReviewFilters } from '@shared/types';
import { ReviewCard } from './ReviewCard';
import { ReviewStats } from './ReviewStats';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Star, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc, 
  Loader2,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewListProps {
  propertyId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onEditReview?: (review: Review) => void;
  onDeleteReview?: (reviewId: string) => void;
  onReplyToReview?: (reviewId: string) => void;
  className?: string;
}

interface ReviewData {
  reviews: Review[];
  stats: ReviewStatsType;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const ReviewList: React.FC<ReviewListProps> = ({
  propertyId,
  currentUserId,
  isAdmin = false,
  onEditReview,
  onDeleteReview,
  onReplyToReview,
  className,
}) => {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'newest',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: currentFilters.sortBy || 'newest',
      });

      if (currentFilters.rating) {
        params.append('rating', currentFilters.rating.toString());
      }

      const response = await fetch(`/api/properties/${propertyId}/reviews?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const result = await response.json();
      
      if (result.success) {
        setReviewData(result.data);
        setCurrentPage(page);
      } else {
        throw new Error(result.error || 'Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, filters);
  }, [propertyId, filters]);

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy: sortBy as ReviewFilters['sortBy'] };
    setFilters(newFilters);
  };

  const handleRatingFilter = (rating: string) => {
    const ratingNumber = rating === 'all' ? undefined : parseInt(rating);
    const newFilters = { ...filters, rating: ratingNumber };
    setFilters(newFilters);
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Refresh reviews to update helpful count
        fetchReviews(currentPage, filters);
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Refresh reviews
        fetchReviews(currentPage, filters);
        if (onDeleteReview) {
          onDeleteReview(reviewId);
        }
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleFlagReview = async (reviewId: string) => {
    // This would open a flag/report dialog
    console.log('Flag review:', reviewId);
  };

  const filteredReviews = reviewData?.reviews.filter(review => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      review.title.toLowerCase().includes(searchLower) ||
      review.comment.toLowerCase().includes(searchLower) ||
      review.userName.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (loading && !reviewData) {
    return (
      <div className={cn('w-full', className)}>
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading reviews...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('w-full', className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Review Statistics */}
      {reviewData && (
        <ReviewStats stats={reviewData.stats} />
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Rating Filter */}
            <Select onValueChange={handleRatingFilter} defaultValue="all">
              <SelectTrigger className="w-full md:w-40">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <SelectValue placeholder="All Ratings" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select onValueChange={handleSortChange} defaultValue="newest">
              <SelectTrigger className="w-full md:w-48">
                <div className="flex items-center space-x-2">
                  <SortDesc className="h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest_rating">Highest Rating</SelectItem>
                <SelectItem value="lowest_rating">Lowest Rating</SelectItem>
                <SelectItem value="most_helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading reviews...</span>
              </div>
            </CardContent>
          </Card>
        ) : filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="flex flex-col items-center space-y-3">
                <MessageSquare className="h-12 w-12 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {searchTerm ? 'No reviews found' : 'No reviews yet'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchTerm 
                      ? 'Try adjusting your search terms or filters'
                      : 'Be the first to review this property'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onEdit={onEditReview}
              onDelete={handleDeleteReview}
              onMarkHelpful={handleMarkHelpful}
              onFlag={handleFlagReview}
              onReply={onReplyToReview}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {reviewData && reviewData.pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReviews(currentPage - 1, filters)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, reviewData.pagination.pages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => fetchReviews(page, filters)}
                  disabled={loading}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReviews(currentPage + 1, filters)}
            disabled={currentPage === reviewData.pagination.pages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
