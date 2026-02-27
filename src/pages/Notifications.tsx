// Notifications.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Sidebar from "../components/sidebar/SIdebar";
import Topbar from "../components/topbar/Topbar";
import { Bell, Clock, Search, CheckCheck, Trash2, Filter } from "lucide-react";
import { useDeleteNotificationMutation, useGetMyNotificationsQuery, useMarkAllNotificationsAsReadMutation, useMarkNotificationAsReadMutation } from "../redux/features/notificationApi";

export default function Notification() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string | undefined>();
  const [isRead, setIsRead] = useState<boolean | undefined>();

  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isDeletingNotif, setIsDeletingNotif] = useState(false);

  // Main list with filters and pagination
  const { data: notificationsData, isLoading, refetch: refetchNotifications } = useGetMyNotificationsQuery({
    page,
    limit: 10,
    isRead,
    // Don't filter by type in API - we'll filter client-side to show all types
    search: search || undefined,
  });

  const [markRead] = useMarkNotificationAsReadMutation();
  const [markAllRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();

  const notifications = notificationsData?.notifications ?? [];
  const myUserId = localStorage.getItem("userId");

  const filteredNotifications = notifications.filter((n: any) => {
    // Filter out user's own chat messages
    if (n.type === "CHAT_MESSAGE" && n.data?.senderId) {
      return String(n.data.senderId) !== String(myUserId);
    }
    // Apply type filter if selected
    if (type && n.type !== type) {
      return false;
    }
    return true;
  });

  const meta = notificationsData?.meta;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const handleMarkSingleAsRead = async (
    e: React.MouseEvent,
    id: string,
  ) => {
    e.stopPropagation();
    setIsMarkingRead(true);
    try {
      await markRead(id).unwrap();
      // Don't refetch manually - optimistic update + tag invalidation handles it
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this notification?")) {
      setIsDeletingNotif(true);
      try {
        await deleteNotif(id).unwrap();
        // Don't refetch manually - optimistic update + tag invalidation handles it
      } catch (err) {
        console.error("Failed to delete notification:", err);
      } finally {
        setIsDeletingNotif(false);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#050807] via-[#070A09] to-[#0A0D0B]">
      <div className="w-[250px] flex-shrink-0 border-r border-[rgba(59,175,122,0.15)] h-full overflow-y-auto backdrop-blur-sm">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-10 bg-[#070A09]/80 backdrop-blur-md border-b border-[rgba(59,175,122,0.1)]">
          <Topbar />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="w-full mx-auto p-5">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-[28px] font-bold text-white tracking-tight mb-2">
                Activity Center
              </h1>
              <p className="text-neutral-500 text-sm mb-6">
                Manage your system alerts and notifications
              </p>

              <div className="flex items-center justify-between border-b border-[rgba(59,175,122,0.1)] pb-4">
                <div className="flex items-center gap-2.5 text-[#3BB774]">
                  <Bell size={20} />
                  <span className="font-semibold text-base">My Notifications</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button className="text-white px-4 py-2 rounded-lg border-2 border-[rgba(59,175,122,0.2)] bg-[#070A09] hover:bg-[#3BB774]/10" onClick={async () => {
                    await markAllRead().unwrap();
                  }}>
                    mark as read
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-[#3BB774]/30 border-t-[#3BB774] rounded-full animate-spin" />
                  <p className="text-neutral-400 text-sm">Loading notifications...</p>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0D1210] border border-[rgba(59,175,122,0.2)] flex items-center justify-center">
                  <Bell size={32} className="text-neutral-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  No notifications yet
                </h3>
                <p className="text-neutral-500 text-sm">
                  When you get notifications, they'll show up here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((n: any) => (
                  <div
                    key={n._id}
                    onClick={async () => {
                      if (!n.isRead) {
                        try {
                          await markRead(n._id).unwrap();
                          // Don't refetch manually - optimistic update + tag invalidation handles it
                        } catch (err) {
                          console.error("Failed to mark as read:", err);
                        }
                      }
                    }}
                    className={`group relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${n.isRead
                      ? "border-[rgba(59,175,122,0.1)] bg-[#0A0F0D]/30 hover:bg-[#0D1210]/50 hover:border-[rgba(59,175,122,0.2)]"
                      : "border-[#3BB774]/40 bg-gradient-to-br from-[#0B2B21]/80 to-[#0A0F0D]/50 shadow-lg shadow-[#3BB774]/10 hover:shadow-[#3BB774]/20 hover:border-[#3BB774]/60 hover:scale-[1.005]"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex-1 pr-3">
                        <h3
                          className={`font-semibold text-base mb-0.5 ${n.isRead ? "text-neutral-300" : "text-white"
                            }`}
                        >
                          <span>{n.title}</span>
                        </h3>
                        <p
                          className={`text-xs leading-relaxed ${n.isRead ? "text-neutral-500" : "text-neutral-400"
                            }`}
                        >
                          {n.body}
                        </p>
                      </div>

                      {!n.isRead && (
                        <div className="w-2.5 h-2.5 bg-[#3BB774] rounded-full shadow-lg shadow-[#3BB774]/50 animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-xs text-neutral-500 flex items-center gap-1 px-2 py-1 bg-[#070A09]/50 rounded-md border border-[rgba(59,175,122,0.1)]">
                        <Clock size={12} />
                        {formatTime(n.createdAt)}
                      </span>

                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => handleMarkSingleAsRead(e, n._id)}
                          disabled={isMarkingRead || n.isRead}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-[#3BB774] hover:bg-[#2d8f5c] rounded-md transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCheck size={12} />
                          Mark as read
                        </button>

                        <button
                          onClick={(e) => handleDelete(e, n._id)}
                          disabled={isDeletingNotif}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-red-600/90 hover:bg-red-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPage > 1 && (
              <div className="flex justify-between items-center mt-5 px-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#0D1210] border border-[rgba(59,175,122,0.2)] rounded-lg hover:bg-[#3BB774]/10 hover:border-[#3BB774] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0D1210] disabled:hover:border-[rgba(59,175,122,0.2)] transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-neutral-400">Page</span>
                  <span className="px-3 py-1.5 bg-[#3BB774]/20 border border-[#3BB774]/40 rounded-md text-white font-semibold">
                    {meta.page}
                  </span>
                  <span className="text-neutral-400">of {meta.totalPage}</span>
                </div>

                <button
                  disabled={page === meta.totalPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#0D1210] border border-[rgba(59,175,122,0.2)] rounded-lg hover:bg-[#3BB774]/10 hover:border-[#3BB774] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0D1210] disabled:hover:border-[rgba(59,175,122,0.2)] transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}