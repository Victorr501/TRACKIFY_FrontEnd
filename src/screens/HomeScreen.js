import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert,  SafeAreaView,  Platform   } from 'react-native';
import AuthService from '../services/AuthService';
import PerfilScreen from './home/PerfilScreen';
import CrearHabitoScreen from './home/CrearHabitoScreen';

// --- Simulaciones de pantallas del Home ---
const HabitosScreen = () => (
  <Text style={styles.contentText}>🧱 Aquí se mostrarán tus hábitos</Text>
);

const EstadisticasScreen = () => (
  <Text style={styles.contentText}>📊 Aquí irán tus estadísticas de progreso</Text>
);


// --- Botones ---
const BottomTabBar = ({ onTabPress }) => {
  const [activeTab, setActiveTab] = useState('habitos');

  const handlePress = (tabName) => {
    setActiveTab(tabName);
    onTabPress(tabName);
  };

  return (
    <View style={styles.tabBarContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'habitos' && styles.activeTab]}
        onPress={() => handlePress('habitos')}
      >
        <Text style={styles.tabIcon}>🔁</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'crear' && styles.activeTab]}
        onPress={() => handlePress('crear')}
      >
        <Text style={styles.tabIcon}>➕</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'estadisticas'&& styles.activeTab]}
        onPress={() => handlePress('estadisticas')}
      >
        <Text style={styles.tabIcon}>📊</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'perfil' && styles.activeTab]}
        onPress={() => handlePress('perfil')}
      >
        <Text style={styles.tabIcon}>👤</Text>
      </TouchableOpacity>
    </View>
  );
};

//--- Pantalla principal --- 
const HomeScreen = ({navigation}) => {
    const [user, setUser] = useState(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [activeScreen, setActiveScreen] = useState('habitos');
    const [isLoading, setIsLoading] = useState(true);


    //--- Metodos al inicar pantalla

    useEffect(() => {
        //Intentamos obtener el usuario actual
        const loadUser = async () => {
            try{
                const res = await AuthService.getCurrentUser();
                console.log(res);
                setUser(res.user);
            } catch (err){
                console.log("Token inválido o sesión expirada");
                await AuthService.loadUser();
                navigation.replace("Login")
            } finally {
              setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    const toggleMenu = () => setIsMenuVisible(!isMenuVisible);

    const renderScreenContent = () => {
      switch (activeScreen) {
        case 'habitos':
          return <HabitosScreen />;
        case 'crear':
          return <CrearHabitoScreen />;
        case 'estadisticas':
          return <EstadisticasScreen />;
        case 'perfil':
          return <PerfilScreen navigation={navigation} />;
        default:
          return <HabitosScreen />;
    }
  };

  // Metodos para los botones
  const handleLogout = async () => {
      await AuthService.logout();
      Alert.alert('Sesión cerrada');
      navigation.replace('Login');
  };

  if(isLoading){
    return(
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.greetingText}>Hola, { user.username || "Usuario"}</Text>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Menú superior desplegable */}
      {isMenuVisible && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setActiveScreen('perfil')}
          >
            <Text style={styles.menuItemText}>Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuItemText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Contenido dinámico */}
      <View style={styles.contentContainer}>{renderScreenContent()}</View>

      {/* Barra inferior */}
      <BottomTabBar onTabPress={setActiveScreen} />
    </SafeAreaView>
  )
};


//Diseño de la pagina
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    zIndex: 1,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    fontSize: 28,
    color: '#555',
  },
  menuContainer: {
    position: 'absolute',
    top: 65,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    minWidth: 150,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 18,
    color: '#333',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 26,
    color: '#888',
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  centerTabIcon: {
    fontSize: 30,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f4f7',
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
  },
});

export default HomeScreen;