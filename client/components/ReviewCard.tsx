import React, { useState } from 'react';
import { Review } from '@shared/types';
import { ReviewRating } from './ReviewRating';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  ThumbsUp, 
  Flag, 
  MoreVertical, 
  Edit, 
  Trash2, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  isAdmin?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onMarkHelpful?: (reviewId: string) => void;
  onFlag?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  isAdmin = false,
  onEdit,
  onDelete,
  onMarkHelpful,
  onFlag,
  onReply,
  className,
}) => {
  const [showFullComment, setShowFullComment] = useState(false);
  const [isMarkingHelpful, setIsMarkingHelpful] = useState(false);
  
  const isOwner = currentUserId === review.userId;
  const hasVoted = review.helpfulVotes?.includes(currentUserId || '');
  const maxCommentLength = 300;
  const shouldTruncate = review.comment.length > maxCommentLength;

  const getStatusBadge = () => {
    switch (review.status) {
      case 'approved':
        return <Badge variant="secondary" className="text-green-600 bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      case 'pending':
        return <Badge variant="secondary" className="text-yellow-600 bg-yellow-50">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="text-red-600 bg-red-50">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return null;
    }
  };

  const handleMarkHelpful = async () => {
    if (hasVoted || !onMarkHelpful || isMarkingHelpful) return;
    
    setIsMarkingHelpful(true);
    try {
      await onMarkHelpful(review._id!);
    } finally {
      setIsMarkingHelpful(false);
    }
  };

  const displayComment = shouldTruncate && !showFullComment
    ? review.comment.substring(0, maxCommentLength) + '...'
    : review.comment;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {review.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{review.userName}</h4>
                {review.verified && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {review.userType}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <ReviewRating rating={review.rating} size="sm" />
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {(isAdmin || isOwner) && getStatusBadge()}
            
            {review.flagged && (
              <Badge variant="destructive" className="text-xs">
                <Flag className="h-3 w-3 mr-1" />
                Flagged
              </Badge>
            )}

            {(isOwner || isAdmin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && onEdit && review.status === 'approved' && (
                    <DropdownMenuItem onClick={() => onEdit(review)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Review
                    </DropdownMenuItem>
                  )}
                  {(isOwner || isAdmin) && onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(review._id!)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Review
                    </DropdownMenuItem>
                  )}
                  {isAdmin && onReply && (
                    <DropdownMenuItem onClick={() => onReply(review._id!)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Admin Reply
                    </DropdownMenuItem>
                  )}
                  {!isOwner && onFlag && (
                    <DropdownMenuItem onClick={() => onFlag(review._id!)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report Review
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
            <p className="text-gray-700 leading-relaxed">
              {displayComment}
            </p>
            {shouldTruncate && (
              <Button
                variant="link"
                size="sm"
                className="px-0 h-auto text-primary"
                onClick={() => setShowFullComment(!showFullComment)}
              >
                {showFullComment ? 'Show less' : 'Read more'}
              </Button>
            )}
          </div>

          {review.images && review.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          )}

          {review.adminReply && (
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="text-blue-600 bg-blue-100">
                  Admin Response
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(review.adminReply.repliedAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-700">{review.adminReply.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                - {review.adminReply.adminName}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkHelpful}
              disabled={hasVoted || isMarkingHelpful || !currentUserId}
              className={cn(
                'flex items-center space-x-1',
                hasVoted && 'text-primary bg-primary/10'
              )}
            >
              <ThumbsUp className={cn('h-4 w-4', hasVoted && 'fill-current')} />
              <span>Helpful ({review.helpful || 0})</span>
            </Button>

            {!isOwner && currentUserId && onFlag && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFlag(review._id!)}
                className="text-gray-500 hover:text-red-600"
              >
                <Flag className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
