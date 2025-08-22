import React, { useState, useEffect } from 'react';
import { Review } from '@shared/types';
import { ReviewCard } from '../ReviewCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Star, 
  Filter, 
  Search, 
  MessageSquare, 
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Send,
  AlertTriangle,
  Eye,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminReviewManagementProps {
  className?: string;
}

interface ReviewWithProperty extends Review {
  property?: {
    _id: string;
    title: string;
  };
}

export const AdminReviewManagement: React.FC<AdminReviewManagementProps> = ({
  className,
}) => {
  const [reviews, setReviews] = useState<ReviewWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [flaggedFilter, setFlaggedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Reply dialog state
  const [replyDialog, setReplyDialog] = useState<{
    isOpen: boolean;
    review: ReviewWithProperty | null;
    message: string;
    loading: boolean;
  }>({
    isOpen: false,
    review: null,
    message: '',
    loading: false,
  });

  // Status update state
  const [statusUpdate, setStatusUpdate] = useState<{
    reviewId: string | null;
    loading: boolean;
  }>({
    reviewId: null,
    loading: false,
  });

  useEffect(() => {
    fetchReviews();
  }, [currentPage, statusFilter, ratingFilter, flaggedFilter, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (ratingFilter !== 'all') {
        params.append('rating', ratingFilter);
      }

      if (flaggedFilter !== 'all') {
        params.append('flagged', flaggedFilter);
      }

      const response = await fetch(`/api/admin/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const result = await response.json();
      
      if (result.success) {
        setReviews(result.data.reviews);
        setTotalPages(result.data.pagination.pages);
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

  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected' | 'pending') => {
    setStatusUpdate({ reviewId, loading: true });

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchReviews(); // Refresh the list
      } else {
        throw new Error('Failed to update review status');
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Failed to update review status');
    } finally {
      setStatusUpdate({ reviewId: null, loading: false });
    }
  };

  const flagReview = async (reviewId: string, flagged: boolean, flagReasons?: string[]) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ flagged, flagReasons }),
      });

      if (response.ok) {
        fetchReviews(); // Refresh the list
      } else {
        throw new Error('Failed to flag review');
      }
    } catch (error) {
      console.error('Error flagging review:', error);
      alert('Failed to flag review');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
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
        fetchReviews(); // Refresh the list
      } else {
        throw new Error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const handleReplySubmit = async () => {
    if (!replyDialog.review || !replyDialog.message.trim()) {
      return;
    }

    setReplyDialog(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`/api/admin/reviews/${replyDialog.review._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: replyDialog.message.trim() }),
      });

      if (response.ok) {
        setReplyDialog({
          isOpen: false,
          review: null,
          message: '',
          loading: false,
        });
        fetchReviews(); // Refresh the list
      } else {
        throw new Error('Failed to submit reply');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply');
    } finally {
      setReplyDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const openReplyDialog = (review: ReviewWithProperty) => {
    setReplyDialog({
      isOpen: true,
      review,
      message: review.adminReply?.message || '',
      loading: false,
    });
  };

  const closeReplyDialog = () => {
    setReplyDialog({
      isOpen: false,
      review: null,
      message: '',
      loading: false,
    });
  };

  const filteredReviews = reviews.filter(review => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      review.title.toLowerCase().includes(searchLower) ||
      review.comment.toLowerCase().includes(searchLower) ||
      review.userName.toLowerCase().includes(searchLower) ||
      review.property?.title.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading && reviews.length === 0) {
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
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Review Management</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
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

            <Select value={flaggedFilter} onValueChange={setFlaggedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by flag status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="true">Flagged Only</SelectItem>
                <SelectItem value="false">Not Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
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

            <div className="text-sm text-gray-600">
              {filteredReviews.length} of {reviews.length} reviews
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900">No reviews found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search terms or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(review.status)}
                      {review.flagged && (
                        <Badge variant="destructive">
                          <Flag className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                      {review.property && (
                        <span className="text-sm text-gray-600">
                          Property: <span className="font-medium">{review.property.title}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Status Actions */}
                      {review.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateReviewStatus(review._id!, 'approved')}
                            disabled={statusUpdate.reviewId === review._id && statusUpdate.loading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateReviewStatus(review._id!, 'rejected')}
                            disabled={statusUpdate.reviewId === review._id && statusUpdate.loading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {review.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReviewStatus(review._id!, 'pending')}
                          disabled={statusUpdate.reviewId === review._id && statusUpdate.loading}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Pending
                        </Button>
                      )}

                      {review.status === 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReviewStatus(review._id!, 'approved')}
                          disabled={statusUpdate.reviewId === review._id && statusUpdate.loading}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}

                      {/* Reply Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReplyDialog(review)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {review.adminReply ? 'Edit Reply' : 'Reply'}
                      </Button>

                      {/* Flag/Unflag Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => flagReview(review._id!, !review.flagged)}
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        {review.flagged ? 'Unflag' : 'Flag'}
                      </Button>

                      {/* Delete Button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteReview(review._id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <ReviewCard
                    review={review}
                    isAdmin={true}
                    className="border-0 shadow-none"
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyDialog.isOpen} onOpenChange={closeReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>
                {replyDialog.review?.adminReply ? 'Edit Admin Reply' : 'Add Admin Reply'}
              </span>
            </DialogTitle>
          </DialogHeader>

          {replyDialog.review && (
            <div className="space-y-4">
              {/* Review Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">{replyDialog.review.userName}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < replyDialog.review!.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <h4 className="font-medium mb-1">{replyDialog.review.title}</h4>
                <p className="text-sm text-gray-700">{replyDialog.review.comment}</p>
              </div>

              {/* Reply Form */}
              <div className="space-y-2">
                <Label htmlFor="reply">Admin Reply</Label>
                <Textarea
                  id="reply"
                  value={replyDialog.message}
                  onChange={(e) => setReplyDialog(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Write your reply..."
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={closeReplyDialog}
                  disabled={replyDialog.loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReplySubmit}
                  disabled={replyDialog.loading || !replyDialog.message.trim()}
                >
                  {replyDialog.loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Submit Reply</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviewManagement;

export default AdminReviewManagement;
