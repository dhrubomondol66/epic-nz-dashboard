// // redux/features/locationApi.ts
// import { createApi } from "@reduxjs/toolkit/query/react";
// import axiosBaseQuery from "../axiosBaseQuery";

// export const locationApi = createApi({
//     reducerPath: "locationApi", // Unique reducer path
//     baseQuery: axiosBaseQuery(), // Use the custom axiosBaseQuery
//     endpoints: (builder) => ({
//         getAllLocations: builder.query({
//             query: (status = "all") => ({ // Returns an object with URL and params
//                 url: `location/all?status=${status}`,
//                 method: "GET", // HTTP method
//             }),
//         }),
//     }),
// });

// export const { useGetAllLocationsQuery } = locationApi; // Export the hook for the component
// src/redux/features/locationApi.ts
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
        }),
    }),
});

export const {
    useGetAllLocationsQuery,
    useGetHikesLocationsQuery,
} = locationApi;

