import { baseApi } from "../baseApi";

// Types
export interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    message: string;
    isRead: boolean;
    timestamp: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    lastMessageSenderId?: string;
    unreadCount?: number;
    isOnline?: boolean;
}


// API Slice
export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all users for chat list
        getChatUsers: builder.query<User[], void>({
            query: () => ({
                url: "chat/conversations",
                method: "GET",
            }),
            transformResponse: (response: any) => {
                if (!response.data) return [];

                return response.data.map((item: any) => {
                    const userData = item.user || item.participant || {};
                    const lastMessageSenderId = item.lastMessage?.sender?._id || item.lastMessage?.sender || "";

                    // Logic: In a 1-on-1 chat, if the last message sender is NOT the specific user 
                    // we are chatting with, it must be the admin (or someone else).
                    // We only want to show unread notifications for messages FROM the other user.
                    const isFromOtherUser = lastMessageSenderId === userData._id;
                    const actualUnreadCount = isFromOtherUser ? (item.unreadCount ?? item.unread_count ?? 0) : 0;

                    return {
                        _id: userData._id || "",
                        name: userData.full_name || userData.name || "Unknown",
                        email: userData.email || "",
                        avatar: userData.profile_picture || userData.avatar || "",
                        lastMessage: item.lastMessage?.message?.text || item.lastMessage?.message || item.lastMessage || "",
                        lastMessageTime: item.lastMessage?.createdAt || item.updatedAt || "",
                        lastMessageSenderId: lastMessageSenderId,
                        unreadCount: actualUnreadCount,
                        isOnline: userData.isOnline || false,
                    };
                });
            },
            providesTags: ["Chats"],
        }),

        // Get messages between admin and a specific user
        getMessages: builder.query<Message[], string>({
            query: (userId) => ({
                url: `chat/messages/${userId}`,
                method: "GET",
            }),
            transformResponse: (response: any) => {
                if (!response.data) return [];
                return response.data.map((msg: any) => ({
                    _id: msg._id,
                    senderId: msg.sender?._id || msg.sender,
                    receiverId: msg.receiver?._id || msg.receiver,
                    message: msg.message?.text || msg.message || "",
                    timestamp: msg.createdAt || msg.timestamp,
                    isRead: msg.isRead || false,
                }));
            },
            providesTags: (_result, _error, userId) => [{ type: "Chats", id: userId }],
        }),

        // Send a message
        sendMessage: builder.mutation<{ success: boolean; data: any }, { receiverId: string; message: string }>({
            query: ({ receiverId, message }) => ({
                url: `chat/send_message/${receiverId}`,
                method: "POST",
                data: {
                    message: {
                        text: message
                    }
                },
            }),
            invalidatesTags: (_result, _error, { receiverId }) => [
                "Chats",
                { type: "Chats", id: receiverId }
            ],
        }),
    }),
});

export const {
    useGetChatUsersQuery,
    useGetMessagesQuery,
    useSendMessageMutation,
} = chatApi;