// notificationApi.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../baseApi";

// Define the API with the relevant endpoints
export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch my notifications with filters
    getMyNotifications: builder.query<any, { page?: number; limit?: number; isRead?: boolean; type?: string; search?: string }>({
      query: ({ page = 1, limit = 10, isRead, type, search }) => ({
        url: "notification/me",
        method: "GET",
        params: { page, limit, isRead, type, search },
      }),
      transformResponse: (response: any) => {
        // Transform API response to expected format
        const rawNotifications = response?.data?.result || response?.data || [];
        const notifications = Array.isArray(rawNotifications)
          ? rawNotifications.map((n: any) => ({
              ...n,
              _id: n._id || n.id,
            }))
          : [];

        return {
          notifications,
          meta: response?.meta || response?.data?.meta || {
            page: response?.data?.page || 1,
            limit: response?.data?.limit || 10,
            total: response?.data?.total || notifications.length,
            totalPage: response?.data?.totalPage || 1,
          },
        };
      },
      providesTags: ["Notifications"],
    }),

    // Fetch all notifications (admin use case)
    getAllNotifications: builder.query({
      query: ({ page = 1, limit = 100 }) => ({
        url: "notification/all",
        method: "GET",
        params: { page, limit },
      }),
    }),

    // Mark a single notification as read
    markNotificationAsRead: builder.mutation<{ success: boolean }, string>({
      query: (notifyId: string) => ({
        url: `notification/read/${notifyId}`,
        method: "PATCH",
      }),
      async onQueryStarted(notifyId, { dispatch, queryFulfilled }) {
        // Optimistic update: Update all cached queries
        const patchResults: any[] = [];
        
        // Try to update common query variations
        // RTK Query serializes queries, so we need to match exactly
        const queryVariations = [
          { page: 1, limit: 100, isRead: false },
          { page: 1, limit: 100, isRead: false, type: "CHAT_MESSAGE" },
          { page: 1, limit: 10 },
          { page: 1, limit: 10, isRead: undefined },
          // Try without undefined properties
          { page: 1, limit: 100 },
          { page: 1, limit: 10 },
        ];

        queryVariations.forEach((queryArgs) => {
          try {
            const patchResult = dispatch(
              notificationApi.util.updateQueryData("getMyNotifications", queryArgs as any, (draft: any) => {
                if (!draft?.notifications) return;
                const notification = draft.notifications.find((n: any) => n._id === notifyId);
                if (notification) {
                  notification.isRead = true;
                  // If this is an unread-only query, remove the notification
                  if (queryArgs.isRead === false) {
                    const index = draft.notifications.findIndex((n: any) => n._id === notifyId);
                    if (index !== -1) {
                      draft.notifications.splice(index, 1);
                      if (draft.meta) {
                        draft.meta.total = Math.max(0, (draft.meta.total || 0) - 1);
                      }
                    }
                  }
                }
              })
            );
            if (patchResult) {
              patchResults.push(patchResult);
            }
          } catch {
            // Query not in cache or update failed, that's okay
            // RTK Query will throw if query doesn't exist in cache
          }
        });

        try {
          await queryFulfilled;
          // Delay invalidation slightly to ensure backend has processed
          // Optimistic update already handled UI, so this syncs backend state
          setTimeout(() => {
            dispatch(notificationApi.util.invalidateTags(["Notifications"]));
          }, 1000); // 1 second delay
        } catch {
          // On error, undo optimistic updates and invalidate to refetch correct state
          patchResults.forEach((patchResult) => {
            if (patchResult?.undo) {
              patchResult.undo();
            }
          });
          dispatch(notificationApi.util.invalidateTags(["Notifications"]));
        }
      },
      invalidatesTags: ["Notifications"],
    }),

    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "notification/read-all",
        method: "PATCH",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        // Optimistic update: Clear all unread queries
        const patchResults: any[] = [];
        
        const queryVariations = [
          { page: 1, limit: 100, isRead: false },
          { page: 1, limit: 100, isRead: false, type: "CHAT_MESSAGE" },
        ];

        queryVariations.forEach((queryArgs) => {
          try {
            const patchResult = dispatch(
              notificationApi.util.updateQueryData("getMyNotifications", queryArgs as any, (draft: any) => {
                if (!draft) return;
                draft.notifications = [];
                if (draft.meta) {
                  draft.meta.total = 0;
                }
              })
            );
            patchResults.push(patchResult);
          } catch {
            // Query not in cache, that's okay
          }
        });

        // Also mark all as read in general queries
        const generalQueries = [
          { page: 1, limit: 10 },
          { page: 1, limit: 10, isRead: undefined },
        ];

        generalQueries.forEach((queryArgs) => {
          try {
            const patchResult = dispatch(
              notificationApi.util.updateQueryData("getMyNotifications", queryArgs as any, (draft: any) => {
                if (!draft?.notifications) return;
                draft.notifications.forEach((n: any) => {
                  n.isRead = true;
                });
              })
            );
            patchResults.push(patchResult);
          } catch {
            // Query not in cache, that's okay
          }
        });

        try {
          await queryFulfilled;
          // Invalidate tags immediately
          dispatch(notificationApi.util.invalidateTags(["Notifications"]));
        } catch {
          patchResults.forEach((patchResult) => {
            if (patchResult?.undo) patchResult.undo();
          });
          dispatch(notificationApi.util.invalidateTags(["Notifications"]));
        }
      },
      invalidatesTags: ["Notifications"],
    }),

    // Delete a notification
    deleteNotification: builder.mutation<{ success: boolean }, string>({
      query: (deleteId: string) => ({
        url: `notification/delete/${deleteId}`,
        method: "DELETE",
      }),
      async onQueryStarted(deleteId, { dispatch, queryFulfilled }) {
        // Optimistic update: Remove from all cached queries
        const patchResults: any[] = [];
        
        const queryVariations = [
          { page: 1, limit: 100, isRead: false },
          { page: 1, limit: 100, isRead: false, type: "CHAT_MESSAGE" },
          { page: 1, limit: 10 },
          { page: 1, limit: 10, isRead: undefined },
        ];

        queryVariations.forEach((queryArgs) => {
          try {
            const patchResult = dispatch(
              notificationApi.util.updateQueryData("getMyNotifications", queryArgs as any, (draft: any) => {
                if (!draft?.notifications) return;
                const index = draft.notifications.findIndex((n: any) => n._id === deleteId);
                if (index !== -1) {
                  draft.notifications.splice(index, 1);
                  if (draft.meta) {
                    draft.meta.total = Math.max(0, (draft.meta.total || 0) - 1);
                  }
                }
              })
            );
            patchResults.push(patchResult);
          } catch {
            // Query not in cache, that's okay
          }
        });

        try {
          await queryFulfilled;
          // Invalidate tags immediately
          dispatch(notificationApi.util.invalidateTags(["Notifications"]));
        } catch {
          patchResults.forEach((patchResult) => {
            if (patchResult?.undo) patchResult.undo();
          });
          dispatch(notificationApi.util.invalidateTags(["Notifications"]));
        }
      },
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetAllNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;