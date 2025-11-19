'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiTrash2, FiSend, FiArchive, FiX, FiPhone, FiUser, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  replied: boolean;
  replyText?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [counts, setCounts] = useState({
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
    total: 0,
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [activeFilter, messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setCounts(data.counts);
      } else {
        toast.error('Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    if (activeFilter === 'all') {
      setFilteredMessages(messages);
    } else {
      setFilteredMessages(messages.filter(m => m.status === activeFilter));
    }
  };

  const markAs = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        toast.success(`Message marked as ${status}`);
        fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status: status as any });
        }
      } else {
        toast.error('Failed to update message');
      }
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Message deleted');
        fetchMessages();
        setSelectedMessage(null);
      } else {
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const openMessage = async (message: Message) => {
    setSelectedMessage(message);
    
    // Mark as read if unread
    if (message.status === 'unread') {
      markAs(message.id, 'read');
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedMessage.id, 
          replyText 
        }),
      });

      if (res.ok) {
        toast.success('Reply saved! You can now email the customer.');
        setReplyText('');
        fetchMessages();
        setSelectedMessage(null);
      } else {
        toast.error('Failed to save reply');
      }
    } catch (error) {
      console.error('Error saving reply:', error);
      toast.error('Failed to save reply');
    }
  };

  const filters = [
    { key: 'all', label: 'All', count: counts.total, icon: FiMail },
    { key: 'unread', label: 'Unread', count: counts.unread, icon: FiMail },
    { key: 'read', label: 'Read', count: counts.read, icon: FiMail },
    { key: 'replied', label: 'Replied', count: counts.replied, icon: FiSend },
    { key: 'archived', label: 'Archived', count: counts.archived, icon: FiArchive },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'read': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      case 'replied': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'archived': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="glass-nav bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiMail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contact Messages</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage and respond to customer inquiries
                </p>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{counts.unread}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Unread</div>
              </div>
              <div className="text-center px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{counts.replied}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Replied</div>
              </div>
              <div className="text-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{counts.total}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeFilter === filter.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
              }`}
            >
              <filter.icon className="w-4 h-4" />
              <span>{filter.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filter.key
                  ? 'bg-white/20'
                  : 'bg-gray-200 dark:bg-dark-600'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {filteredMessages.length === 0 ? (
          <div className="glass-card text-center py-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMail className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {activeFilter === 'unread' ? '✅ All Caught Up!' : '📬 No Messages Yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              {activeFilter === 'unread' 
                ? 'Great job! You\'ve read all your messages. New ones will appear here.'
                : 'Messages from your website contact form will appear here. Check back later!'}
            </p>
            {activeFilter === 'all' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <span>💡</span>
                <span>Messages are sent from your contact page</span>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-glass">
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => openMessage(message)}
                  className={`glass-card cursor-pointer hover:shadow-lg transition ${
                    selectedMessage?.id === message.id
                      ? 'ring-2 ring-primary-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${
                          message.status === 'unread' ? 'font-bold' : ''
                        }`}>
                          {message.name}
                        </h3>
                        {message.status === 'unread' && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{message.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                  </div>
                  
                  {message.subject && (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {message.subject}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {message.message}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                    <FiClock className="w-3 h-3 mr-1" />
                    {formatDate(message.createdAt)}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <div className="glass-card">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {selectedMessage.subject || 'No Subject'}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <FiUser className="w-4 h-4 mr-1" />
                          {selectedMessage.name}
                        </div>
                        <div className="flex items-center">
                          <FiMail className="w-4 h-4 mr-1" />
                          {selectedMessage.email}
                        </div>
                        {selectedMessage.phone && (
                          <div className="flex items-center">
                            <FiPhone className="w-4 h-4 mr-1" />
                            {selectedMessage.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-6 mb-6">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-500 mb-6">
                    Received: {formatDate(selectedMessage.createdAt)}
                  </div>

                  {selectedMessage.replied && selectedMessage.replyText && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Your Reply:</h4>
                      <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                        {selectedMessage.replyText}
                      </p>
                      {selectedMessage.repliedAt && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Replied: {formatDate(selectedMessage.repliedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {!selectedMessage.replied && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Write a reply:
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={6}
                        className="input-field"
                        placeholder="Type your reply here..."
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center space-x-2">
                      {selectedMessage.status !== 'read' && (
                        <button
                          onClick={() => markAs(selectedMessage.id, 'read')}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition"
                        >
                          <FiMail className="w-4 h-4" />
                          <span>Mark Read</span>
                        </button>
                      )}
                      {selectedMessage.status !== 'archived' && (
                        <button
                          onClick={() => markAs(selectedMessage.id, 'archived')}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition"
                        >
                          <FiArchive className="w-4 h-4" />
                          <span>Archive</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>

                    {!selectedMessage.replied && (
                      <button
                        onClick={sendReply}
                        disabled={!replyText.trim()}
                        className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiSend className="w-4 h-4" />
                        <span>Save Reply</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-card h-full flex items-center justify-center text-center py-16">
                  <div>
                    <FiMail className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Select a message
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose a message from the list to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
