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

