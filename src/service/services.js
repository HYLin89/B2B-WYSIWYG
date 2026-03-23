import axios from "axios";

const base = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
    baseURL: base,
    timeOut:5000,
});

api.interceptors.request.use(
    (config) => {
        const login_token = localStorage.getItem('token');
        if (login_token){
            config.headers.Authorization = `Bearer ${login_token}`;
        }
        return config
    },
    (error) => {
        return Promise.reject(error);
    }
)