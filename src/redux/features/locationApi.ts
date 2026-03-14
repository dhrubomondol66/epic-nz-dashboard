/* eslint-disable @typescript-eslint/no-explicit-any */

import { baseApi } from "../baseApi";
import type { Submission } from "../../@types/ISubmission.type";

const locationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllLocations: builder.query<Submission[], string>({
            query: (status = "all") => ({
                url: `location/all?status=${status === "all" ? "" : status}`,
                method: "GET",
            }),
            transformResponse: (response: any) => {
                const data = response?.data?.result || response?.data || [];
                return Array.isArray(data) ? data : [];
            },
            providesTags: ["Locations"] as any,
        }),

        getHikesLocations: builder.query<Submission[], void>({
            query: () => ({
                url: "location/hikes",
                method: "GET",
            }),
            transformResponse: (response: any) => {
                const data = response?.data?.result || response?.data || [];
                return Array.isArray(data) ? data : [];
            },
            providesTags: ["Locations"] as any,
        }),
        createLocation: builder.mutation<any, FormData>({
            query: (data) => ({
                url: "location/submit",
                method: "POST",
                data,
            }),
            invalidatesTags: ["Locations" as any],
        }),
        approveLocation: builder.mutation<any, string>({
            query: (id) => ({
                url: `location/approve/${id}`,
                method: "PATCH",
                data: { status: "APPROVED" },
            }),
            invalidatesTags: ["Locations" as any],
        }),
        rejectLocation: builder.mutation<any, string>({
            query: (id) => ({
                url: `location/reject/${id}`,
                method: "PATCH",
                data: { status: "REJECTED" },
            }),
            invalidatesTags: ["Locations" as any],
        }),
        updateLocation: builder.mutation<any, { id: string; data: FormData }>({
            query: ({ id, data }) => ({
                url: `location/update/${id}`,
                method: "PATCH",
                data,
            }),
            invalidatesTags: ["Locations" as any],
        }),
    }),
});

export const {
    useGetAllLocationsQuery,
    useGetHikesLocationsQuery,
    useCreateLocationMutation,
    useUpdateLocationMutation,
    useApproveLocationMutation,
    useRejectLocationMutation,
} = locationApi;

