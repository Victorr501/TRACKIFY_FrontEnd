import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import AuthService from '../../services/AuthService';
import UserService from '../../services/UserService';

const AmigosScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  //Datos de prueba
  const amigos = useMemo(
    () => [
      { id: '1', name: 'María', streak: 12, status: 'today' },
      { id: '2', name: 'Carlos', streak: 4, status: 'yesterday' },
      { id: '3', name: 'Lucía', streak: 0, status: 'expired' },
      { id: '4', name: 'Jorge', streak: 7, status: 'today' },
      { id: '5', name: 'Jorge', streak: 7, status: 'today' },
    ],
    [],
  );

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
      <FlatList
        data={amigos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FriendRow friend={item} />}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const FriendRow = ({ friend }) => {
  if (friend.status === 'none') {
    return (
      <View style={styles.row}>
        <Text style={styles.emptyIcon}>＋</Text>
        <View style={styles.info}>
          <Text style={styles.name}>Sin racha de amigos</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => {}}>
          <Text style={styles.addButtonText}>Añadir amigo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const streakVisuals = getStreakVisuals(friend);

  return (
    <View style={styles.row}>
      <Text style={styles.friendIcon}>👥</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{friend.name}</Text>
      </View>
      <View style={styles.streakContainer}>
        <Text style={[styles.streakNumber, { color: streakVisuals.color }]}>
          {streakVisuals.streak}
        </Text>
        <Text style={[styles.streakIcon, { color: streakVisuals.color }]}>
          {streakVisuals.icon}
        </Text>
      </View>
    </View>
  );
};

const getStreakVisuals = (friend) => {
  switch (friend.status) {
    case 'today':
      return { streak: friend.streak, icon: '🔥', color: '#e63946' };
    case 'yesterday':
      return { streak: friend.streak, icon: '🔥', color: '#a0a0a0' };
    case 'expired':
    default:
      return { streak: 0, icon: '🧊', color: '#74c0fc' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
    alignItems: 'stretch'

  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#555',
  },
  listContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    width: '100%',       // 👈 NUEVO: ocupa todo el ancho
    alignSelf: 'stretch' // 👈 fuerza a expandirse horizontalmente
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',   
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  friendIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  emptyIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#999',
  },
  info: {
    flex: 1,
    minWidth: 100,
  },
  name: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  streakIcon: {
    fontSize: 18,
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#4c8bf5',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default AmigosScreen;