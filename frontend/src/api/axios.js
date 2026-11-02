import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("farm2home_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;