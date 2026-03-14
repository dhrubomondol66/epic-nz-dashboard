/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosRequestConfig } from "axios";
import config from "../config";

export const axiosInstance = axios.create({
    baseURL: config.baseUrl,
    withCredentials: true,
    headers: {
        'ngrok-skip-browser-warning': 'true',
    }
});

import Cookies from 'js-cookie';

/**
 * Robustly gets a token from cookies or localStorage, 
 * filtering out "undefined" or "null" strings that can often persist.
 */
export const getValidToken = (key: 'accessToken' | 'refreshToken'): string | null => {
    const cookieValue = Cookies.get(key);
    if (cookieValue && cookieValue !== "undefined" && cookieValue !== "null") {
        return cookieValue;
    }
    const storageValue = localStorage.getItem(key);
    if (storageValue && storageValue !== "undefined" && storageValue !== "null") {
        return storageValue;
    }
    return null;
};

export const saveTokens = (accessToken?: string, refreshToken?: string, userEmail?: string) => {
    console.log("saveTokens called with:", { 
        hasAccess: !!accessToken, 
        hasRefresh: !!refreshToken, 
        email: userEmail 
    });

    if (accessToken && accessToken !== "undefined") {
        Cookies.set("accessToken", accessToken, { expires: 7, path: "/" });
        localStorage.setItem("accessToken", accessToken);
        console.log("Access token saved to storage");
    }

    if (refreshToken && refreshToken !== "undefined") {
        Cookies.set("refreshToken", refreshToken, { expires: 7, path: "/" });
        localStorage.setItem("refreshToken", refreshToken);
        console.log("Refresh token saved to storage");
    }

    if (userEmail) {
        localStorage.setItem("email", userEmail);
    }
};

export const clearTokens = () => {
    console.trace("clearTokens called! Tokens are being removed from storage.");
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

        // Use robust retrieval logic
        const token = getValidToken('accessToken');

        if (token) {
            console.log(`Axios Interceptor: Sending token for ${url}`);
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn(`Axios Interceptor: No valid token found for ${url}. Current path: ${window.location.pathname}`);
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
        console.log("Axios response:", response.config.url, response.status);
        return response;
    },
    async (error) => {
        console.log("Axios error:", error.config?.url, error.response?.status, error.response?.data);

        const originalRequest = error.config as AxiosRequestConfig & {
            _retry: boolean;
        };

        if (isPublicAuthEndpoint(originalRequest?.url || "")) {
            return Promise.reject(error);
        }

        if (originalRequest?.url?.includes("auth/refresh-token")) {
            console.error("Refresh token request failed itself, preventing loop");
            return Promise.reject(error);
        }

        if (
            (error.response?.status === 401 || (error.response?.status === 500 && error.response?.data?.message === "jwt expired")) &&
            !originalRequest._retry
        ) {
            console.log("Token expired, attempting refresh");

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
                const refreshToken = getValidToken('refreshToken');
                if (!refreshToken) {
                    console.error("No valid refresh token found in storage, forcing logout");
                    clearTokens();
                    window.location.href = "/login";
                    return Promise.reject(error);
                }

                console.log("Refresh request original URL:", "/auth/refresh-token", "Attempting relative POST to auth/refresh-token");

                const res = await axiosInstance.post(
                    "auth/refresh-token",
                    refreshToken && refreshToken !== "undefined" ? { refreshToken } : undefined
                );

                const nextAccessToken =
                    res?.data?.data?.accessToken ||
                    res?.data?.accessToken ||
                    res?.data?.token ||
                    res?.data?.data?.token;

                const nextRefreshToken =
                    res?.data?.data?.refreshToken ||
                    res?.data?.refreshToken;

                if (!nextAccessToken) {
                    throw new Error("No access token returned from refresh endpoint");
                }

                console.log("Tokens refreshed successfully");
                saveTokens(nextAccessToken, nextRefreshToken);

                processQueue(null);

                return axiosInstance(originalRequest);
            } catch (error: any) {
                console.error("Token refresh failed:", error?.response?.status);
                // Only logout on specific refresh token errors
                if (error?.response?.status === 404 || error?.response?.status === 401) {
                    console.log("Refresh token invalid, logging out");
                    clearTokens();
                    window.location.href = "/login";
                }
                processQueue(error);
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        // For other 401 errors that aren't token-related, don't logout automatically
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log("401 error on", error.config?.url, "- not logging out automatically");
        }

        return Promise.reject(error);
    }
);