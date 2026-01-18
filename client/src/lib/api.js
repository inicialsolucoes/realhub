import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const pushEndpoint = localStorage.getItem('pushEndpoint');
    if (pushEndpoint) {
        config.headers['X-Push-Endpoint'] = pushEndpoint;
    }
    
    return config;
});

export default api;
