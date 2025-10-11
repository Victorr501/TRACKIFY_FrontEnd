import api from './Api.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    async logout(){
        await AsyncStorage.removeItem(TOKEN_KEY);
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    },
}

export default AuthService;