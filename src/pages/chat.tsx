// Chat.tsx
import { useState, useEffect, useRef } from 'react';
import Sidebar from "../components/sidebar/SIdebar";
import Topbar from "../components/topbar/Topbar";
import { Search, Send, Paperclip, Smile } from 'lucide-react';
import type { User } from '../redux/features/chat';
import { useGetChatUsersQuery, useGetMessagesQuery, useSendMessageMutation } from '../redux/features/chat';
import { useGetMyNotificationsQuery, useMarkNotificationAsReadMutation } from '../redux/features/notificationApi';

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [clearedUserIds, setClearedUserIds] = useState<Set<string>>(new Set());
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: users = [], refetch: refetchUsers } = useGetChatUsersQuery(undefined, {
    pollingInterval: 3000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: chatNotifData } = useGetMyNotificationsQuery(
    { page: 1, limit: 100, isRead: false, type: "CHAT_MESSAGE" },
    {
      pollingInterval: 3000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const [markNotificationRead] = useMarkNotificationAsReadMutation();

  // ONLY use notification API for unread counts — never fall back to user.unreadCount
  // After markNotificationRead, tag invalidation refetches this and returns 0 automatically
  const unreadBySenderId = (chatNotifData?.notifications || []).reduce(
    (acc: Record<string, number>, n: any) => {
      const senderId = n?.data?.senderId;
      if (!senderId || n?.isRead) return acc; // Don't count if already read
      const key = String(senderId);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );

  const { data: messages = [] } = useGetMessagesQuery(selectedUser?._id || '', {
    skip: !selectedUser?._id,
    pollingInterval: 3000,
  });

  const [sendMsg] = useSendMessageMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedUser?._id) return;
    refetchUsers();
  }, [selectedUser?._id, refetchUsers]);

  // When messages arrive for the selected user, mark their notifications as read
  useEffect(() => {
    if (!selectedUser?._id || messages.length === 0) return;

    const unreadNotifsForUser = (chatNotifData?.notifications || []).filter(
      (n: any) =>
        n?.type === "CHAT_MESSAGE" &&
        String(n?.data?.senderId) === String(selectedUser._id) &&
        !n?.isRead
    );

    if (unreadNotifsForUser.length > 0) {
      Promise.all(
        unreadNotifsForUser.map((n: any) => markNotificationRead(n._id).unwrap())
      ).catch((err) => console.error("Failed to mark notifications as read:", err));
    }
  }, [messages, selectedUser?._id]);

  const handleSelectUser = async (user: User) => {
    // Optimistically hide badge immediately
    setClearedUserIds((prev) => new Set(prev).add(String(user._id)));
    setSelectedUser(user);

    const unreadNotifsForUser = (chatNotifData?.notifications || []).filter(
      (n: any) =>
        n?.type === "CHAT_MESSAGE" &&
        String(n?.data?.senderId) === String(user._id) &&
        !n?.isRead
    );

    if (unreadNotifsForUser.length > 0) {
      try {
        await Promise.all(
          unreadNotifsForUser.map((n: any) => markNotificationRead(n._id).unwrap())
        );
        // After this, chatNotifData refetches via tag invalidation
        // unreadBySenderId[userId] will naturally become 0 — no refresh needed
      } catch (error) {
        console.error("Failed to mark chat notifications as read:", error);
        // Restore badge on failure
        setClearedUserIds((prev) => {
          const next = new Set(prev);
          next.delete(String(user._id));
          return next;
        });
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      await sendMsg({ receiverId: selectedUser._id, message: newMessage }).unwrap();
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredUsers = users.filter((user: any) =>
    user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#070A09]">
      <div className="w-[250px] flex-shrink-0 border-r border-[rgba(59,175,122,0.2)]">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-shrink-0">
          <Topbar />
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Users List */}
          <div className="w-[380px] flex-shrink-0 border-r border-[rgba(59,175,122,0.2)] bg-[#090D0C] flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-[rgba(59,175,122,0.2)]">
              <h2 className="text-[24px] font-inter font-semibold text-white mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0D1211] border border-[rgba(59,175,122,0.2)] rounded-[12px] pl-10 pr-4 py-2.5 text-white font-inter text-[14px] focus:outline-none focus:border-[#3BB774]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-neutral-600 text-sm">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const userId = String(user._id);

                  // Key change: ONLY use unreadBySenderId (notification API)
                  // clearedUserIds handles the optimistic gap between click and API refetch
                  // After tag invalidation completes, unreadBySenderId[userId] becomes 0 naturally
                  const isOptimisticallyCleared = clearedUserIds.has(userId);
                  const unreadCount = isOptimisticallyCleared ? 0 : (unreadBySenderId[userId] ?? 0);

                  return (
                    <div
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className={`p-4 border-b border-[rgba(59,175,122,0.1)] cursor-pointer transition hover:bg-[#0D1211] ${
                        selectedUser?._id === user._id
                          ? 'bg-[#0D1211] border-l-4 border-l-[#3BB774]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3BB774&color=fff`}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {user.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#090D0C] rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-white font-inter font-medium text-[15px] truncate">
                              {user.name}
                            </h3>
                            {user.lastMessageTime && (
                              <span className="text-neutral-500 font-inter text-[12px] flex-shrink-0 ml-2">
                                {formatTime(user.lastMessageTime)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-neutral-400 font-inter text-[13px] truncate">
                              {user.lastMessage}
                            </p>
                            {unreadCount > 0 && (
                              <div className="w-5 h-5 bg-[#3BB774] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-inter text-[11px] font-medium">
                                  {unreadCount > 4 ? '4+' : unreadCount}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedUser ? (
            <div className="flex-1 flex flex-col bg-[#070A09] min-w-0">
              <div className="flex-shrink-0 h-[72px] border-b border-[rgba(59,175,122,0.2)] bg-[#090D0C] px-6 flex items-center">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=3BB774&color=fff`}
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {selectedUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#090D0C] rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-inter font-semibold text-[16px]">{selectedUser.name}</h3>
                    {/* <p className="text-neutral-500 font-inter text-[12px]">
                      {selectedUser.isOnline ? 'Active now' : 'Offline'}
                    </p> */}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-neutral-600 text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isCurrentUser = message.senderId !== selectedUser._id;
                    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                    return (
                      <div key={message._id} className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        {!isCurrentUser && showAvatar && (
                          <img
                            src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=3BB774&color=fff`}
                            alt={selectedUser.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        {!isCurrentUser && !showAvatar && <div className="w-8" />}

                        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          <div className={`px-4 py-2.5 rounded-[16px] ${
                            isCurrentUser
                              ? 'bg-[#3BB774] text-white'
                              : 'bg-[#0D1211] text-white border border-[rgba(59,175,122,0.2)]'
                          }`}>
                            <p className="font-inter text-[14px] break-words whitespace-pre-wrap">{message.message}</p>
                          </div>
                          <span className="text-neutral-500 font-inter text-[11px] mt-1">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>

                        {isCurrentUser && showAvatar && (
                          <img
                            src="https://ui-avatars.com/api/?name=Admin&background=3BB774&color=fff"
                            alt="Admin"
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        {isCurrentUser && !showAvatar && <div className="w-8" />}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex-shrink-0 border-t border-[rgba(59,175,122,0.2)] bg-[#090D0C] p-4">
                <div className="flex items-end gap-3">
                  <button className="p-2.5 hover:bg-[#0D1211] rounded-lg transition text-neutral-400 hover:text-white mb-1">
                    <Paperclip size={20} />
                  </button>
                  <div className="flex-1 bg-[#0D1211] border border-[rgba(59,175,122,0.2)] rounded-[16px] px-4 py-2.5 flex items-center gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 bg-transparent text-white font-inter text-[14px] focus:outline-none resize-none"
                      style={{ maxHeight: '120px' }}
                    />
                    <button className="text-neutral-400 hover:text-white transition">
                      <Smile size={20} />
                    </button>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-[#3BB774] hover:bg-[#34a06d] disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-[12px] transition mb-1"
                  >
                    <Send size={20} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#070A09]">
              <div className="text-center">
                <div className="w-24 h-24 bg-[#3BB774]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="text-[#3BB774]" size={40} />
                </div>
                <h3 className="text-white font-inter font-semibold text-[20px] mb-2">Select a conversation</h3>
                <p className="text-neutral-400 font-inter text-[14px]">Choose a user from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}