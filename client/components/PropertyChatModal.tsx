import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Send,
  Phone,
  MessageCircle,
  User,
  Clock,
  X,
  AlertCircle,
  Loader2,
  Image,
} from "lucide-react";
import { Property } from "@shared/types";
import { ChatMessage, ChatConversation } from "@shared/chat-types";

interface PropertyChatModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  _id?: string;
  senderId: string;
  senderName: string;
  senderType: "buyer" | "seller" | "agent" | "admin";
  message: string;
  messageType: "text" | "image" | "property_card";
  createdAt: Date;
  readBy?: Array<{
    userId: string;
    readAt: Date;
  }>;
}

export default function PropertyChatModal({
  property,
  isOpen,
  onClose,
}: PropertyChatModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [conversation, setConversation] = useState<ChatConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated && property._id) {
      initializeChat();
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isOpen, isAuthenticated, property._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to start a conversation");
        return;
      }

      // Find or create conversation
      const response = await fetch(
        `/api/conversations/find-or-create?propertyId=${property._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      if (data.success) {
        setConversation(data.data);
        await loadMessages(data.data._id);
        startPolling(data.data._id);
      } else {
        throw new Error(data.error || "Failed to create conversation");
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      setError(error instanceof Error ? error.message : "Failed to start chat");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
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
      console.error("Error loading messages:", error);
    }
  };

  const startPolling = (conversationId: string) => {
    // Poll for new messages every 5 seconds
    pollingRef.current = setInterval(() => {
      loadMessages(conversationId);
    }, 5000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/conversations/${conversation._id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: newMessage.trim(),
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNewMessage("");
          // Reload messages to show the new message
          await loadMessages(conversation._id);
        }
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - messageDate.getTime()) / 36e5;

    if (diffHours < 24) {
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

  const isMyMessage = (message: Message) => {
    return message.senderId === user?.id;
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please login to start a conversation about this property.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => (window.location.href = "/auth")}>
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="border-b px-4 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-[#C70000]" />
              <div>
                <DialogTitle className="text-base">
                  Property Inquiry
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {property.title}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Property Card */}
        <div className="border-b px-4 py-3 bg-gray-50 shrink-0">
          <div className="flex items-center space-x-3">
            {property.images && property.images[0] ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-12 h-12 rounded object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                <Image className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {property.title}
              </p>
              <p className="text-sm text-[#C70000] font-semibold">
                ₹{property.price.toLocaleString()}
                {property.priceType === "rent" && "/month"}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#C70000]" />
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Start the conversation!</p>
              <p className="text-xs">
                Send a message to inquire about this property.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message._id || index}
                className={`flex ${
                  isMyMessage(message) ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    isMyMessage(message)
                      ? "bg-[#C70000] text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`text-xs ${
                        isMyMessage(message) ? "text-red-100" : "text-gray-500"
                      }`}
                    >
                      {message.senderName}
                    </span>
                    <span
                      className={`text-xs ${
                        isMyMessage(message) ? "text-red-100" : "text-gray-400"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t px-4 py-3 shrink-0">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[40px] max-h-24 resize-none"
                disabled={sending}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-[#C70000] hover:bg-[#A60000] text-white px-3 py-2"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Contact Info */}
          {property.contactVisible && property.contactInfo && (
            <div className="mt-3 pt-3 border-t bg-gray-50 -mx-4 px-4 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Owner Contact:</span>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    {property.contactInfo.phone}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
