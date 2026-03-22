import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Global response interceptor for error handling
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
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                // Avoid redirect loop if already on login page
                if (!window.location.pathname.includes('/auth/login')) {
                    window.location.href = '/auth/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
