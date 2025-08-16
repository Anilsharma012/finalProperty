import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import PropertyCard from "../components/PropertyCard";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Property } from "@shared/types";
import {
  Heart,
  ArrowLeft,
  Search,
  Filter,
  Grid,
  List,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function Favorites() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    fetchFavorites();
  }, [isAuthenticated, navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/favorites/my", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/auth");
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch favorites`);
      }

      const data = await response.json();
      if (data.success) {
        setFavorites(data.data || []);
      } else {
        throw new Error(data.error || "Failed to fetch favorites");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setError(error instanceof Error ? error.message : "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (propertyId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/favorites/${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove from favorites");
      }

      // Remove from local state
      setFavorites(prev => prev.filter(property => property._id !== propertyId));
    } catch (error) {
      console.error("Error removing from favorites:", error);
      setError("Failed to remove from favorites");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 flex items-center justify-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              My Favorites
            </h1>
            <p className="text-sm text-gray-500">
              {favorites.length} {favorites.length === 1 ? 'property' : 'properties'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
              <Button
                onClick={fetchFavorites}
                variant="link"
                className="ml-2 p-0 h-auto text-red-600 underline"
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#C70000] mx-auto mb-4" />
              <p className="text-gray-600">Loading your favorites...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && favorites.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start browsing properties and add them to your favorites by tapping the heart icon.
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => navigate("/buy")}
                className="bg-[#C70000] hover:bg-[#A60000] text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
              <Button
                onClick={() => navigate("/categories")}
                variant="outline"
              >
                View Categories
              </Button>
            </div>
          </div>
        )}

        {/* Favorites Grid */}
        {!loading && favorites.length > 0 && (
          <div className={`${
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
              : "space-y-4"
          }`}>
            {favorites.map((property) => (
              <div key={property._id} className="relative">
                <PropertyCard
                  property={property}
                  onClick={() => navigate(`/property/${property._id}`)}
                  className={viewMode === "list" ? "flex flex-row" : ""}
                />
                
                {/* Remove from Favorites Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromFavorites(property._id!);
                  }}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white shadow-sm rounded-full"
                  title="Remove from favorites"
                >
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons for when favorites exist */}
        {!loading && favorites.length > 0 && (
          <div className="mt-8 text-center space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">
                Continue Browsing
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Find more properties that match your preferences
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate("/buy")}
                  className="bg-[#C70000] hover:bg-[#A60000] text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse More Properties
                </Button>
                <Button
                  onClick={() => navigate("/categories")}
                  variant="outline"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Explore Categories
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
