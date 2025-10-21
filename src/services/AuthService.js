import api from './Api.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from "jwt-decode";

const TOKEN_KEY = "access_token";

const AuthService = {
    
    // Login
    async login(credentials){
        const form = new URLSearchParams();
        form.append('username', credentials.email);
        form.append('password', credentials.password);

        const response = await api.post('/auth/login', form, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        });
        const token = response.data?.access_token;

        if(token){
            await AsyncStorage.setItem(TOKEN_KEY, token);
        }
        return response.data;
    },

    //Registro
    async register(data){
        console.log("📤 Enviando datos:", data);

        const form = new URLSearchParams();
        form.append("username", data.username);
        form.append("email", data.email);
        form.append("password", data.password);
        const response = await api.post('/auth/register',form.toString() , {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const token = response.data?.access_token;

        if(token){
            await AsyncStorage.setItem(TOKEN_KEY, token);
        }

        return response.data;
    },

    //Cerrar sesion
    async logout(){

        try{
            const response = await api.post('/auth/logout');
            console.log("Cierre de sesion", response.data);

            await AsyncStorage.removeItem(TOKEN_KEY);
            console.log("Token eliminado correctamente");
            return response.data;
        } catch (error){
            console.error("Error al cerrar sesión:" , error);
            await AsyncStorage.removeItem(TOKEN_KEY);
            throw error;
        }
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    },

    async isTokenValid() {
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) return false;

            const decoded = jwtDecode(token);
            const now = Date.now() / 1000; // tiempo actual en segundos

            if (decoded.exp && decoded.exp > now) {
                return true; // ✅ el token aún es válido
            } else {
                await AsyncStorage.removeItem('access_token'); // ❌ token expirado
                return false;
            }
        } catch (err) {
            console.error("Error verificando token:", err);
            return false;
        }
    }
}

export default AuthService;