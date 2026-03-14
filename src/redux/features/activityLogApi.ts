/* eslint-disable @typescript-eslint/no-explicit-any */
// src/redux/features/activityLogApi.ts
import { baseApi } from "../baseApi";

export interface ActivityLog {
    _id: string;
    actorId: string;
    actorRole: string;
    action: string;
    entityType: string;
    message: string;
    status: string;
    ip: string;
    userAgent: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

const activityLogApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getActivityLogs: builder.query<ActivityLog[], void>({
            query: () => ({
                url: "activity-logs",
                method: "GET",
            }),
            transformResponse: (response: any) => {
                // ✅ THIS IS THE FIX
                if (response?.data && Array.isArray(response.data)) {
                    return response.data;
                }
                return [];
            },
        }),
    }),
});

export const { useGetActivityLogsQuery } = activityLogApi;
