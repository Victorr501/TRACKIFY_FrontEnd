import { register } from 'react-native/types_generated/Libraries/Renderer/shims/ReactNativeViewConfigRegistry';
import api from './api.js';
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
        const response = await api.post('/auth/register', {
            username: data.username,
            email: data.email,
            password: data.password,
        });
        return response.data;
    },


    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    },
}