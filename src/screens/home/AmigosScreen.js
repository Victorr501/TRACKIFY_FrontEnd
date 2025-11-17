import React from 'react';
import { View, Text, StyleSheet } from 'react-native';



const AmigosScreen = () => {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pantalla Amigos</Text>
            <Text style={styles.subtitle}>Próximamente podrás ver y gestionar a tus amigos aquí.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default AmigosScreen;