import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import PropertyChatModal from "../components/PropertyChatModal";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  MessageCircle,
  Settings,
  Users,
  Phone,
  Send,
  CheckCircle,
  ArrowLeft,
  Home,
  User,
  AlertCircle,
} from "lucide-react";
import { Property } from "@shared/types";

export default function ChatDemo() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showChatModal, setShowChatModal] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Demo property for testing chat
  const demoProperty: Property = {
    _id: "demo-property-123",
    title: "3 BHK Luxury Apartment in Sector 12",
    description: "Beautiful apartment with modern amenities",
    price: 8500000,
    priceType: "sale",
    propertyType: "residential",
    subCategory: "3bhk",
    location: {
      area: "Sector 12",
      address: "Sector 12, Rohtak, Haryana",
      landmark: "Near PGI Rohtak",
    },
    specifications: {
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
      parking: true,
    },
    images: ["/placeholder.svg"],
    amenities: ["Parking", "Lift", "Security"],
    ownerId: "owner-123",
    ownerType: "seller",
    contactInfo: {
      name: "John Doe",
      phone: "+91 9876543210",
      email: "john@example.com",
    },
    status: "active",
    approvalStatus: "approved",
    featured: false,
    premium: false,
    contactVisible: true,
    views: 125,
    inquiries: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const fetchMyConversations = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("/api/conversations/my", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConversations(data.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyConversations();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-4">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please login to access the chat system.
              <Button
                onClick={() => navigate("/auth")}
                variant="link"
                className="ml-2 p-0 h-auto underline"
              >
                Login here
              </Button>
            </AlertDescription>
          </Alert>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            onClick={() => navigate(-1)}
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
              OLX-Style Chat Demo
            </h1>
          </div>

          <Button
            onClick={() => navigate("/conversations")}
            variant="ghost"
            size="sm"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <User className="h-4 w-4 mr-2" />
            My Chats
          </Button>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-6">
        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              OLX-Style Chat System - Fully Implemented
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  ✅ API Endpoints Implemented:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    <code>
                      POST /conversations {`{propertyId, participants}`}
                    </code>
                  </li>
                  <li>
                    <code>GET /conversations/my</code>
                  </li>
                  <li>
                    <code>GET /conversations/:id/messages</code>
                  </li>
                  <li>
                    <code>
                      POST /conversations/:id/messages {`{text,imageUrl}`}
                    </code>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  ✅ Features Implemented:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>🎫 Ticket+chat per property</li>
                  <li>⏱️ 5-second polling (configurable)</li>
                  <li>👨‍💼 Admin Support Inbox</li>
                  <li>📱 Mobile-responsive UI</li>
                  <li>🔔 Real-time message updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Property */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Property - Try the Chat System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <img
                src="/placeholder.svg"
                alt="Demo Property"
                className="w-20 h-20 rounded object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {demoProperty.title}
                </h3>
                <p className="text-[#C70000] font-semibold">
                  ₹{demoProperty.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {demoProperty.location.area}
                </p>

                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => setShowChatModal(true)}
                    className="bg-[#C70000] hover:bg-[#A60000] text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>

                  <Button
                    onClick={() => navigate("/conversations")}
                    variant="outline"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View All Chats
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current User Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>My Recent Conversations</span>
              <Button
                onClick={fetchMyConversations}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-sm">
                  Start a chat using the demo property above!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 3).map((conv: any, index) => (
                  <div
                    key={conv._id || index}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/chat/${conv._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {conv.propertyTitle || "General Chat"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {conv.lastMessage?.message || "No messages yet"}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}

                {conversations.length > 3 && (
                  <Button
                    onClick={() => navigate("/conversations")}
                    variant="link"
                    className="w-full"
                  >
                    View all {conversations.length} conversations
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Features */}
        {user?.userType === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Admin Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                As an admin, you have access to the Support Inbox to manage all
                user conversations.
              </p>
              <Button
                onClick={() => navigate("/admin")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Open Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-800">Chat API</p>
                <p className="text-xs text-green-600">Active</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-800">Messaging</p>
                <p className="text-xs text-green-600">Live</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-800">
                  Support Inbox
                </p>
                <p className="text-xs text-green-600">Ready</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Home className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-800">
                  Property Chat
                </p>
                <p className="text-xs text-green-600">Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Modal */}
      <PropertyChatModal
        property={demoProperty}
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />

      <BottomNavigation />
    </div>
  );
}
