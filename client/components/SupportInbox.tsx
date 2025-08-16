import { useState, useEffect } from 'react';
import api from '../lib/api-helper';

interface Conversation {
  _id: string;
  propertyTitle?: string;
  participants: string[];
  lastMessage?: {
    message: string;
    senderName: string;
    createdAt: string;
  };
  messageCount: number;
  status: string;
  createdAt: string;
}

export default function SupportInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const r = await api('/admin/conversations?limit=20');
      
      if (r.ok) {
        const data = r.json;
        if (data.success && Array.isArray(data.data)) {
          setConversations(data.data);
        } else {
          setConversations([]);
        }
      } else {
        setError(`API Error: ${r.status}`);
        setConversations([]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to fetch conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div data-testid="support-inbox" className="p-6">
        <h2 className="text-xl font-semibold mb-4">Support Inbox</h2>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-[#C70000] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="support-inbox" className="p-6">
        <h2 className="text-xl font-semibold mb-4">Support Inbox</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchConversations}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="support-inbox" className="p-6">
      <h2 className="text-xl font-semibold mb-4">Support Inbox</h2>
      
      {conversations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tickets</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div key={conversation._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">
                  {conversation.propertyTitle || 'General Inquiry'}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {conversation.status}
                </span>
              </div>
              
              {conversation.lastMessage && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{conversation.lastMessage.senderName}:</span>{' '}
                  {conversation.lastMessage.message}
                </p>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{conversation.messageCount} messages</span>
                <span>{new Date(conversation.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
