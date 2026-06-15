import axios from 'axios';

const envBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const baseURL = envBaseUrl.endsWith('/api') ? envBaseUrl : `${envBaseUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
