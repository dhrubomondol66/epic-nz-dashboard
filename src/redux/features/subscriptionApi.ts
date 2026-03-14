/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../baseApi";

export interface Subscription {
    _id: string;
    userId: {
        _id?: string;
        fullName?: string;
        email?: string;
    } | string;
    plan_type: string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    start_date: string;
    end_date: string;
    status: string;
    ai_features_access: boolean;
    ads_free: boolean;
    total_spent: number;
    auto_renew: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export const subscriptionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllSubscriptions: builder.query<Subscription[], void>({
            query: () => ({
                url: "subscription/all",
                method: "GET",
            }),
            transformResponse: (response: any) =>
                response?.data?.result || response?.data || [],
            providesTags: ["Subscriptions"],
        }),
    }),
});

export const { useGetAllSubscriptionsQuery } = subscriptionApi;
