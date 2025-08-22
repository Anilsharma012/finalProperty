import { RequestHandler } from "express";
import { getDatabase } from "../db/mongodb";
import { Review, ReviewStats, ReviewFilters, ApiResponse } from "@shared/types";
import { ObjectId } from "mongodb";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for review image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads", "reviews");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

export const uploadReviewImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Get reviews for a specific property
export const getPropertyReviews: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { propertyId } = req.params;
    const { rating, sortBy = "newest", page = "1", limit = "10" } = req.query;

    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid property ID",
      });
    }

    // Build filter object - only show approved reviews for public
    const filter: any = {
      propertyId: propertyId,
      status: "approved",
    };

    if (rating) {
      filter.rating = parseInt(rating as string);
    }

    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case "oldest":
        sort.createdAt = 1;
        break;
      case "highest_rating":
        sort.rating = -1;
        break;
      case "lowest_rating":
        sort.rating = 1;
        break;
      case "most_helpful":
        sort.helpful = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await db
      .collection("reviews")
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const total = await db.collection("reviews").countDocuments(filter);

    // Get review statistics
    const stats = await getReviewStatistics(propertyId);

    const response: ApiResponse<{
      reviews: Review[];
      stats: ReviewStats;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }> = {
      success: true,
      data: {
        reviews: reviews as unknown as Review[],
        stats,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching property reviews:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews",
    });
  }
};

// Create a new review
export const createReview: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = (req as any).userId;
    const userType = (req as any).userType;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { propertyId, rating, title, comment } = req.body;

    // Validate required fields
    if (!propertyId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: propertyId, rating, title, comment",
      });
    }

    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid property ID",
      });
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5",
      });
    }

    // Check if property exists
    const property = await db
      .collection("properties")
      .findOne({ _id: new ObjectId(propertyId) });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }

    // Check if user has already reviewed this property
    const existingReview = await db
      .collection("reviews")
      .findOne({ propertyId: propertyId, userId: userId });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this property",
      });
    }

    // Get user information
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Handle image uploads
    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: any) => {
        images.push(`/uploads/reviews/${file.filename}`);
      });
    }

    // Create review object
    const reviewData: Omit<Review, "_id"> = {
      propertyId: propertyId,
      userId: userId,
      userName: user.name,
      userType: userType,
      rating: ratingNum,
      title: title.trim(),
      comment: comment.trim(),
      images: images,
      verified: true, // Can implement verification logic later
      status: "approved", // Auto-approve for now, can change to "pending" if moderation needed
      flagged: false,
      helpful: 0,
      helpfulVotes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("reviews").insertOne(reviewData);

    const response: ApiResponse<{ _id: string }> = {
      success: true,
      data: { _id: result.insertedId.toString() },
      message: "Review created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create review",
    });
  }
};

// Update a review (only by the author)
export const updateReview: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = (req as any).userId;
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid review ID",
      });
    }

    // Find the review
    const review = await db
      .collection("reviews")
      .findOne({ _id: new ObjectId(reviewId) });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Check if user owns this review
    if (review.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "You can only edit your own reviews",
      });
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (rating !== undefined) {
      const ratingNum = parseInt(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          error: "Rating must be between 1 and 5",
        });
      }
      updateData.rating = ratingNum;
    }

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (comment !== undefined) {
      updateData.comment = comment.trim();
    }

    // Handle new image uploads
    if (req.files && Array.isArray(req.files)) {
      const newImages: string[] = [];
      req.files.forEach((file: any) => {
        newImages.push(`/uploads/reviews/${file.filename}`);
      });
      updateData.images = [...(review.images || []), ...newImages];
    }

    await db
      .collection("reviews")
      .updateOne({ _id: new ObjectId(reviewId) }, { $set: updateData });

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Review updated successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update review",
    });
  }
};

// Delete a review (only by the author or admin)
export const deleteReview: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = (req as any).userId;
    const userType = (req as any).userType;
    const { reviewId } = req.params;

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid review ID",
      });
    }

    // Find the review
    const review = await db
      .collection("reviews")
      .findOne({ _id: new ObjectId(reviewId) });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Check permissions - either owner or admin
    if (
      review.userId !== userId &&
      userType !== "admin" &&
      userType !== "staff"
    ) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own reviews",
      });
    }

    await db.collection("reviews").deleteOne({ _id: new ObjectId(reviewId) });

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Review deleted successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete review",
    });
  }
};

// Mark review as helpful
export const markReviewHelpful: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = (req as any).userId;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid review ID",
      });
    }

    // Find the review
    const review = await db
      .collection("reviews")
      .findOne({ _id: new ObjectId(reviewId) });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Check if user already voted
    const helpfulVotes = review.helpfulVotes || [];
    if (helpfulVotes.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: "You have already marked this review as helpful",
      });
    }

    // Add user to helpful votes and increment count
    await db.collection("reviews").updateOne(
      { _id: new ObjectId(reviewId) },
      {
        $push: { helpfulVotes: userId },
        $inc: { helpful: 1 },
        $set: { updatedAt: new Date() },
      },
    );

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Review marked as helpful" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark review as helpful",
    });
  }
};

// Admin: Get all reviews with filtering options
export const getAllReviews: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const {
      status,
      rating,
      flagged,
      sortBy = "newest",
      page = "1",
      limit = "20",
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (rating) {
      filter.rating = parseInt(rating as string);
    }

    if (flagged !== undefined) {
      filter.flagged = flagged === "true";
    }

    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case "oldest":
        sort.createdAt = 1;
        break;
      case "highest_rating":
        sort.rating = -1;
        break;
      case "lowest_rating":
        sort.rating = 1;
        break;
      case "most_helpful":
        sort.helpful = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await db
      .collection("reviews")
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const total = await db.collection("reviews").countDocuments(filter);

    // Get property details for each review
    const reviewsWithProperty = await Promise.all(
      reviews.map(async (review) => {
        const property = await db
          .collection("properties")
          .findOne({ _id: new ObjectId(review.propertyId) });
        return {
          ...review,
          property: property
            ? { _id: property._id, title: property.title }
            : null,
        };
      }),
    );

    const response: ApiResponse<{
      reviews: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }> = {
      success: true,
      data: {
        reviews: reviewsWithProperty,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews",
    });
  }
};

// Admin: Update review status
export const updateReviewStatus: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { reviewId } = req.params;
    const { status, flagged, flagReasons } = req.body;

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid review ID",
      });
    }

    if (status && !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be pending, approved, or rejected",
      });
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    if (flagged !== undefined) {
      updateData.flagged = flagged;
      if (flagged && flagReasons) {
        updateData.flagReasons = flagReasons;
      } else if (!flagged) {
        updateData.$unset = { flagReasons: 1 };
      }
    }

    await db
      .collection("reviews")
      .updateOne({ _id: new ObjectId(reviewId) }, { $set: updateData });

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Review status updated successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating review status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update review status",
    });
  }
};

// Admin: Reply to a review
export const replyToReview: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const adminId = (req as any).userId;
    const { reviewId } = req.params;
    const { message } = req.body;

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid review ID",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Reply message is required",
      });
    }

    // Get admin information
    const admin = await db
      .collection("users")
      .findOne({ _id: new ObjectId(adminId) });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "Admin user not found",
      });
    }

    // Find the review
    const review = await db
      .collection("reviews")
      .findOne({ _id: new ObjectId(reviewId) });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Add admin reply
    const adminReply = {
      message: message.trim(),
      adminId: adminId,
      adminName: admin.name,
      repliedAt: new Date(),
    };

    await db.collection("reviews").updateOne(
      { _id: new ObjectId(reviewId) },
      {
        $set: {
          adminReply: adminReply,
          updatedAt: new Date(),
        },
      },
    );

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Reply added successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error replying to review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reply to review",
    });
  }
};

// Admin: Delete admin reply
export const deleteAdminReply: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { reviewId } = req.params;

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid review ID",
      });
    }

    await db.collection("reviews").updateOne(
      { _id: new ObjectId(reviewId) },
      {
        $unset: { adminReply: 1 },
        $set: { updatedAt: new Date() },
      },
    );

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Admin reply deleted successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting admin reply:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete admin reply",
    });
  }
};

// Helper function to calculate review statistics
async function getReviewStatistics(propertyId: string): Promise<ReviewStats> {
  try {
    const db = getDatabase();

    const reviews = await db
      .collection("reviews")
      .find({ propertyId: propertyId, status: "approved" })
      .toArray();

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = parseFloat((ratingSum / totalReviews).toFixed(1));

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
    };
  } catch (error) {
    console.error("Error calculating review statistics:", error);
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

// Get review statistics for a property (public endpoint)
export const getPropertyReviewStats: RequestHandler = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid property ID",
      });
    }

    const stats = await getReviewStatistics(propertyId);

    const response: ApiResponse<ReviewStats> = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching review statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch review statistics",
    });
  }
};

// Get user's own reviews
export const getUserReviews: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = (req as any).userId;
    const { page = "1", limit = "10" } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await db
      .collection("reviews")
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const total = await db
      .collection("reviews")
      .countDocuments({ userId: userId });

    // Get property details for each review
    const reviewsWithProperty = await Promise.all(
      reviews.map(async (review) => {
        const property = await db
          .collection("properties")
          .findOne({ _id: new ObjectId(review.propertyId) });
        return {
          ...review,
          property: property
            ? {
                _id: property._id,
                title: property.title,
                images: property.images,
              }
            : null,
        };
      }),
    );

    const response: ApiResponse<{
      reviews: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }> = {
      success: true,
      data: {
        reviews: reviewsWithProperty,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user reviews",
    });
  }
};
