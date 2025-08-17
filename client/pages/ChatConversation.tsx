import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Phone, MoreVertical, Circle, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../hooks/useAuth";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  senderId: string;
  text: string;
  createdAt: Date;
}

interface Conversation {
  _id: string;
  buyer: string;
  seller: string;
  property: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    location: { address: string };
  };
  buyerData: {
    _id: string;
    name: string;
    userType: string;
  };
  sellerData: {
    _id: string;
    name: string;
    userType: string;
  };
}

export default function ChatConversation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const socketConnection = io(window.location.origin, {
      auth: {
        token: token
      }
    });

    setSocket(socketConnection);

    // Join conversation room when conversation is loaded
    if (id) {
      socketConnection.emit('join-conversation', id);
    }

    // Listen for new messages
    socketConnection.on('message:new', (messageData) => {
      if (messageData.conversation === id) {
        const newMsg: Message = {
          _id: messageData._id,
          conversationId: messageData.conversation,
          sender: messageData.sender,
          senderId: messageData.sender,
          text: messageData.text,
          createdAt: new Date(messageData.createdAt)
        };
        
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m._id === newMsg._id)) {
            return prev;
          }
          return [...prev, newMsg];
        });
      }
    });

    socketConnection.on('connect', () => {
      console.log('Socket.io connected');
    });

    socketConnection.on('disconnect', () => {
      console.log('Socket.io disconnected');
    });

    return () => {
      if (id) {
        socketConnection.emit('leave-conversation', id);
      }
      socketConnection.disconnect();
    };
  }, [token, isAuthenticated, id]);

  // Fetch conversation details
  const fetchConversation = async () => {
    if (!token || !id) return;

    try {
      const response = await fetch(`/api/conversations/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const conv = data.data.find((c: any) => c._id === id);
        if (conv) {
          setConversation(conv);
        } else {
          setError("Conversation not found");
        }
      } else {
        setError(data.error || "Failed to load conversation");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!token || !id) return;

    try {
      const response = await fetch(`/api/conversations/${id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessages(data.data || []);
      } else {
        setError(data.error || "Failed to load messages");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!id) {
      navigate("/chat");
      return;
    }

    setLoading(true);
    setError("");

    Promise.all([fetchConversation(), fetchMessages()]).then(() => {
      setLoading(false);
    });
  }, [id, isAuthenticated, token]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id || sendingMessage || !token) return;

    setSendingMessage(true);
    setError("");

    try {
      const response = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Message will be added via Socket.io, so just clear the input
        setNewMessage("");
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#C70000] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Conversation not found</h2>
          <p className="text-gray-600 mb-4">The conversation you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/chat")} className="bg-[#C70000] hover:bg-[#A60000] text-white">
            Back to Chats
          </Button>
        </div>
      </div>
    );
  }

  // Determine other participant
  const otherParticipant = conversation.buyer === user?.id ? conversation.sellerData : conversation.buyerData;
  const property = conversation.property;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Conversation Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center space-x-3">
        <button onClick={() => navigate("/chat")} className="p-1">
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>

        <div className="w-10 h-10 bg-[#C70000] rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">
            {otherParticipant?.name?.charAt(0) || "U"}
          </span>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {otherParticipant?.name || "Unknown User"}
          </h3>
          <div className="flex items-center space-x-1">
            <Circle className="h-2 w-2 text-green-500 fill-current" />
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Property Card */}
      {property && (
        <div className="bg-white border-b p-4">
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
            <img
              src={property.images?.[0] || "/placeholder.svg"}
              alt={property.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">
                {property.title}
              </h4>
              <p className="text-xs text-gray-600">
                {property.location?.address}
              </p>
              <p className="text-sm font-semibold text-[#C70000]">
                ₹{(property.price / 100000).toFixed(1)}L
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              onClick={() => navigate(`/property/${property._id}`)}
            >
              View
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.sender === user?.id ? "justify-end" : "justify-start"
            }`}
            data-testid={message.sender === user?.id ? "msg-outgoing" : "msg-incoming"}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === user?.id
                  ? "bg-[#C70000] text-white"
                  : "bg-white text-gray-900"
              } shadow-sm`}
            >
              <p className="text-sm">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === user?.id
                    ? "text-red-100"
                    : "text-gray-500"
                }`}
              >
                {formatTime(message.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            className="bg-[#C70000] hover:bg-[#A60000] text-white p-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
