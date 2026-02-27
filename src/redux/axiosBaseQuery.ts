/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { axiosInstance } from "../lib/axios";

const axiosBaseQuery =
    (): BaseQueryFn<{
        url: string;
        method?: AxiosRequestConfig["method"]; // ✅ Type এ শুধু type থাকবে, value না
        data?: AxiosRequestConfig["data"];
        params?: AxiosRequestConfig["params"];
        headers?: AxiosRequestConfig["headers"];
    }, unknown, { status?: number; data: any }> =>
        async ({ url, method, data, params, headers }) => {
            try {
                const result = await axiosInstance({
                    url: url,
                    method: method || "GET", // ✅ Default value এখানে, runtime এ
                    data,
                    params,
                    headers,
                });
                return { data: result.data };
            } catch (axiosError) {
                const err = axiosError as AxiosError;
                return {
                    error: {
                        status: err.response?.status,
                        data: err.response?.data || err.message,
                    },
                };
            }
        };

export default axiosBaseQuery;