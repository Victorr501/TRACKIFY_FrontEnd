import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base de tu backend
const BASE_URL = 'http://192.168.0.17/8000';

// Instancia de Axios configurada
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type' : 'application/json'
    }
});


//Coje el token de JWT
api.interceptors.request.use(
    async (config) =>{
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//Metodo auxiliar para obtener el token guardado
async function getToken() {
    try {
        const storedToken = AsyncStorage?.getToken('access_toke');
        return storedToken;
    } catch (err) {
        console.error("Error obteniendo token:", err);
        return null;
    }
}

export default api;