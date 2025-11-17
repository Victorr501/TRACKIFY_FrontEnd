import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AuthService from '../../services/AuthService';
import UserService from '../../services/UserService';

const AmigosScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await AuthService.getCurrentUser();
        const userLog = await UserService.getById(res.user.sub);
        setUser(userLog);
      } catch (err) {
        console.log(err);
        if (navigation?.replace) {
          navigation.replace('Login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Cargando usuario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Amigos</Text>
      {user ? (
        <Text style={styles.text}>Usuario: {user.username}</Text>
      ) : (
        <Text style={styles.text}>No se pudo cargar el usuario.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#555',
  },
});

export default AmigosScreen;