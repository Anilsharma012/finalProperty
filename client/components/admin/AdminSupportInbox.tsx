import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import {
  MessageCircle,
  Search,
  Filter,
  User,
  Clock,
  Send,
  AlertCircle,
  Loader2,
  Phone,
  Eye,
  MoreVertical,
  Archive,
  Star,
  Reply,
  Image,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AdminConversation {
  _id: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice?: number;
  participants: string[];
  participantDetails: Array<{
    _id: string;
    name: string;
    userType: string;
    phone?: string;
  }>;
  lastMessage?: {
    message: string;
    senderId: string;
    senderName: string;
    createdAt: Date;
  };
  messageCount: number;
  status: "active" | "resolved" | "pending";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  createdAt: Date;
  lastMessageAt: Date;
}

interface AdminMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderType: "buyer" | "seller" | "agent" | "admin";
  message: string;
  messageType: "text" | "image" | "property_card";
  isAdminReply?: boolean;
  createdAt: Date;
}

export default function AdminSupportInbox() {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<AdminConversation | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      if (data.success) {
        setConversations(data.data || []);
      } else {
        throw new Error(data.error || "Failed to fetch conversations");
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load conversations",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/admin/conversations/${selectedConversation._id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: replyMessage.trim(),
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReplyMessage("");
          // Reload messages and conversations
          await fetchMessages(selectedConversation._id);
          await fetchConversations();
        }
      } else {
        throw new Error("Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      setError("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const updateConversationStatus = async (
    conversationId: string,
    status: string,
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/admin/conversations/${conversationId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      if (response.ok) {
        // Refresh conversations
        await fetchConversations();
        // Update selected conversation if it's the one being updated
        if (selectedConversation?._id === conversationId) {
          setSelectedConversation((prev) =>
            prev ? { ...prev, status: status as any } : null,
          );
        }
      }
    } catch (error) {
      console.error("Error updating conversation status:", error);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      searchTerm === "" ||
      conv.propertyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participantDetails.some((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === "all" || conv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow">
      {/* Conversations List */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-[#C70000]" />
              Support Inbox
            </h2>
            <Badge variant="secondary">
              {conversations.length} conversations
            </Badge>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#C70000]" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  fetchMessages(conversation._id);
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?._id === conversation._id
                    ? "bg-blue-50 border-blue-200"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.propertyTitle || "General Inquiry"}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.participantDetails
                        .map((p) => p.name)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={getStatusColor(conversation.status)}>
                      {conversation.status}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                </div>

                {conversation.lastMessage && (
                  <p className="text-sm text-gray-600 truncate mb-2">
                    <span className="font-medium">
                      {conversation.lastMessage.senderName}:
                    </span>{" "}
                    {conversation.lastMessage.message}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {conversation.messageCount} messages
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          updateConversationStatus(conversation._id, "active")
                        }
                      >
                        Mark Active
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          updateConversationStatus(conversation._id, "resolved")
                        }
                      >
                        Mark Resolved
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          updateConversationStatus(conversation._id, "pending")
                        }
                      >
                        Mark Pending
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Panel */}
      <div className="w-1/2 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedConversation.propertyTitle || "General Inquiry"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.participantDetails
                      .map((p) => p.name)
                      .join(", ")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={getStatusColor(selectedConversation.status)}
                  >
                    {selectedConversation.status}
                  </Badge>
                  {selectedConversation.participantDetails.find(
                    (p) => p.phone,
                  ) && (
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {selectedConversation.propertyPrice && (
                <div className="mt-2 text-sm text-[#C70000] font-semibold">
                  ₹{selectedConversation.propertyPrice.toLocaleString()}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#C70000]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.senderType === "admin"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.senderType === "admin"
                          ? "bg-[#C70000] text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span
                          className={`text-xs ${
                            message.senderType === "admin"
                              ? "text-red-100"
                              : "text-gray-500"
                          }`}
                        >
                          {message.senderName}
                        </span>
                        <span
                          className={`text-xs ${
                            message.senderType === "admin"
                              ? "text-red-100"
                              : "text-gray-400"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="min-h-[60px] max-h-32 resize-none"
                    disabled={sending}
                  />
                </div>
                <Button
                  onClick={sendReply}
                  disabled={!replyMessage.trim() || sending}
                  className="bg-[#C70000] hover:bg-[#A60000] text-white px-4 py-2"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="absolute bottom-4 right-4 w-80 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
