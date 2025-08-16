import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  MessageCircle,
  ArrowLeft,
  User,
  Clock,
  Phone,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  Image,
} from "lucide-react";

interface Conversation {
  _id: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice?: number;
  propertyImage?: string;
  participants: string[];
  otherParticipant?: {
    name: string;
    userType: string;
  };
  lastMessage?: {
    message: string;
    senderId: string;
    senderName: string;
    createdAt: Date;
  };
  unreadCount?: number;
  lastMessageAt: Date;
  createdAt: Date;
}

export default function ConversationsList() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    fetchConversations();
  }, [isAuthenticated, navigate]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/conversations/my", {
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
        throw new Error(`HTTP ${response.status}: Failed to fetch conversations`);
      }

      const data = await response.json();
      if (data.success) {
        setConversations(data.data || []);
      } else {
        throw new Error(data.error || "Failed to fetch conversations");
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError(error instanceof Error ? error.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - messageDate.getTime()) / 36e5;

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffHours < 48) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const openConversation = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
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
              <MessageCircle className="h-5 w-5 mr-2 text-[#C70000]" />
              My Conversations
            </h1>
            <p className="text-sm text-gray-500">
              {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <Search className="h-4 w-4" />
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
                onClick={fetchConversations}
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
              <p className="text-gray-600">Loading conversations...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && conversations.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start browsing properties and use the chat feature to connect with property owners.
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

        {/* Conversations List */}
        {!loading && conversations.length > 0 && (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => openConversation(conversation._id)}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3">
                  {/* Property Image or Avatar */}
                  <div className="flex-shrink-0">
                    {conversation.propertyImage ? (
                      <img
                        src={conversation.propertyImage}
                        alt={conversation.propertyTitle}
                        className="w-12 h-12 rounded object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Property Info */}
                    {conversation.propertyTitle && (
                      <div className="mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.propertyTitle}
                        </h3>
                        {conversation.propertyPrice && (
                          <p className="text-sm text-[#C70000] font-semibold">
                            ₹{conversation.propertyPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Other Participant */}
                    {conversation.otherParticipant && (
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <User className="h-3 w-3 mr-1" />
                        <span>{conversation.otherParticipant.name}</span>
                        <span className="ml-1 text-xs bg-gray-100 px-1 rounded">
                          {conversation.otherParticipant.userType}
                        </span>
                      </div>
                    )}

                    {/* Last Message */}
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        <span className="font-medium">
                          {conversation.lastMessage.senderName}:
                        </span>{" "}
                        {conversation.lastMessage.message}
                      </p>
                    )}
                  </div>

                  {/* Time and Unread Badge */}
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(conversation.lastMessageAt)}
                    </div>
                    
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <div className="bg-[#C70000] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
