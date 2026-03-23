import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true,
});

let isRefreshing = false;
interface FailedRequest {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}

let failedQueue: FailedRequest[] = [];

const processQueue = (error: Error | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Request interceptor: No longer needs to manually attach JWT from localStorage
api.interceptors.request.use((config) => {
    return config;
});

// Global response interceptor for error handling and token regeneration
api.interceptors.response.use(
    (response) => {
        // If it's a GenericResponse from our API, unwrap the data field
        if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
            return {
                ...response,
                data: response.data.data,
                fullResponse: response.data // Keep metadata like message/success just in case
            };
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If 401 Unauthorized and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Avoid redirect loop if refresh itself fails or if it's a login attempt
            if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token using the refresh_token cookie
                await api.post('/auth/refresh');
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError: unknown) {
                processQueue(refreshError as Error);
                // Refresh failed, meaning the session is truly expired
                if (typeof window !== 'undefined') {
                    // Only redirect if NOT on login page AND NOT on landing page
                    if (!window.location.pathname.includes('/auth/login') && window.location.pathname !== '/') {
                        window.location.href = '/auth/login';
                    }
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
