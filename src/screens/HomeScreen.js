import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AuthService from '../services/AuthService';

const HomeScreen = ({navigation}) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        //Intentamos obtener el usuario actual
        const loadUser = async () => {
            try{
                const res = await AuthService.getCurrentUser();
                setUser(res.user);
            } catch (err){
                console.log("Token inválido o sesión expirada");
                await AuthService.loadUser();
                navigation.replace("Login")
            }
        };
        loadUser();
    }, []);

    const handleLogout = async () => {
        await AuthService.logout();
        Alert.alert('Sesión cerrada');
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🏠 Home</Text>
            <Text style={styles.subtitle}>
                {user ? `Bienvenido, ${user.username}` : 'Cargando usuario...'}
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </View>
    )
};


//Diseño de la pagina
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f4f7',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 10,
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default HomeScreen;