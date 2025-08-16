import { RequestHandler } from "express";
import { getDatabase } from "../db/mongodb";
import { Property, ApiResponse } from "@shared/types";
import { ObjectId } from "mongodb";

// Get user's favorite properties
export const getFavorites: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    // Get user's favorites list
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user || !user.favorites || user.favorites.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Convert string IDs to ObjectIds
    const favoriteIds = user.favorites.map((id: string) => new ObjectId(id));

    // Get favorite properties details
    const favoriteProperties = await db
      .collection("properties")
      .find({
        _id: { $in: favoriteIds },
        status: "active",
        approvalStatus: "approved",
      })
      .sort({ createdAt: -1 })
      .toArray();

    const response: ApiResponse<Property[]> = {
      success: true,
      data: favoriteProperties as unknown as Property[],
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch favorites",
    });
  }
};

// Add property to favorites
export const addToFavorites: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = (req as any).userId;
    const { propertyId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid property ID",
      });
    }

    // Check if property exists and is active
    const property = await db.collection("properties").findOne({
      _id: new ObjectId(propertyId),
      status: "active",
      approvalStatus: "approved",
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found or not available",
      });
    }

    // Add to user's favorites
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $addToSet: { favorites: propertyId },
        $set: { updatedAt: new Date() },
      },
    );

    res.json({
      success: true,
      message: "Property added to favorites",
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add to favorites",
    });
  }
};

// Remove property from favorites
export const removeFromFavorites: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = (req as any).userId;
    const { propertyId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid property ID",
      });
    }

    // Remove from user's favorites
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: { favorites: propertyId },
        $set: { updatedAt: new Date() },
      },
    );

    res.json({
      success: true,
      message: "Property removed from favorites",
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove from favorites",
    });
  }
};

// Check if property is in user's favorites
export const checkFavorite: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = (req as any).userId;
    const { propertyId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid property ID",
      });
    }

    // Check if property is in user's favorites
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      favorites: propertyId,
    });

    res.json({
      success: true,
      data: { isFavorite: !!user },
    });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check favorite status",
    });
  }
};
