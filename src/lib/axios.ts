/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosRequestConfig } from "axios";
import config from "../config";

export const axiosInstance = axios.create({
    baseURL: config.baseUrl,
    withCredentials: false,
    headers: {
        'ngrok-skip-browser-warning': 'true',
    }
});

import Cookies from 'js-cookie';

const saveTokens = (accessToken?: string, refreshToken?: string, userEmail?: string) => {
    if (accessToken && accessToken !== "undefined") {
        Cookies.set("accessToken", accessToken, { expires: 1, path: "/" });
        localStorage.setItem("accessToken", accessToken);
    }

    if (refreshToken && refreshToken !== "undefined") {
        Cookies.set("refreshToken", refreshToken, { expires: 7, path: "/" });
        localStorage.setItem("refreshToken", refreshToken);
    }

    if (userEmail) {
        localStorage.setItem("email", userEmail);
    }
};

export const clearTokens = () => {
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
};

const isPublicAuthEndpoint = (url: string) => {
    const u = url || "";
    return (
        u.includes("/auth/login") ||
        u.includes("auth/login") ||
        u.includes("/auth/forgot-password") ||
        u.includes("auth/forgot-password") ||
        u.includes("/admin/forget-password") ||
        u.includes("admin/forget-password") ||
        u.includes("/otp/forgot-password-verify-otp") ||
        u.includes("otp/forgot-password-verify-otp") ||
        u.includes("/auth/set-password") ||
        u.includes("auth/set-password") ||
        u.includes("/auth/refresh-token") ||
        u.includes("auth/refresh-token")
    );
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
    function (config) {
        const url = config.url || "";

        if (isPublicAuthEndpoint(url)) {
            return config;
        }

        // Check both cookies and localStorage
        const token = Cookies.get('accessToken') || localStorage.getItem('accessToken');

        // Ensure we don't send the string "undefined"
        if (token && token !== "undefined") {
            config.headers.Authorization = `Bearer ${token}`;

        } else {
            console.log("Axios Interceptor: No valid token found.");
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

let isRefreshing = false;

let pendingQueue: {
    resolve: (value: unknown) => void;
    reject: (value: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
    pendingQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null);
        }
    });

    pendingQueue = [];
};

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry: boolean;
        };

        if (isPublicAuthEndpoint(originalRequest?.url || "")) {
            return Promise.reject(error);
        }

        if (originalRequest?.url?.includes("/auth/refresh-token")) {
            return Promise.reject(error);
        }

        if (
            (error.response?.status === 401 || (error.response?.status === 500 && error.response?.data?.message === "jwt expired")) &&
            !originalRequest._retry
        ) {
            console.log("Your token is expired");

            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                })
                    .then(() => axiosInstance(originalRequest))
                    .catch((error) => Promise.reject(error));
            }

            isRefreshing = true;
            try {
                const refreshToken = Cookies.get('refreshToken') || localStorage.getItem('refreshToken');
                if (!refreshToken || refreshToken === "undefined") {
                    clearTokens();
                    window.location.href = "/login";
                    return Promise.reject(error);
                }

                const res = await axiosInstance.post(
                    "/auth/refresh-token",
                    refreshToken && refreshToken !== "undefined" ? { refreshToken } : undefined
                );

                const nextAccessToken =
                    res?.data?.data?.accessToken ||
                    res?.data?.accessToken ||
                    res?.data?.token;
                const nextRefreshToken =
                    res?.data?.data?.refreshToken ||
                    res?.data?.refreshToken;

                saveTokens(nextAccessToken, nextRefreshToken);

                processQueue(null);

                return axiosInstance(originalRequest);
            } catch (error: any) {
                if (error?.response?.status === 404 || error?.response?.status === 401) {
                    clearTokens();
                    window.location.href = "/login";
                }
                processQueue(error);
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);