import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import AuthService from '../../services/AuthService';
import HabitService from '../../services/HabitService';
import HabitLogsService from '../../services/HabitLongsService';

const HabitosScreen = () => {
  const [userId, setUserId] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [completedHabits, setCompletedHabits] = useState({});

  const fetchHabits = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await HabitService.getUserHabits(userId);
      const data = Array.isArray(response) ? response : response?.data ?? [];
      setHabits(data);
    } catch (err) {
      console.error('Error al obtener los hábitos:', err);
      setError('No pudimos cargar tus hábitos. Intenta nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await AuthService.getCurrentUser();
        const id = Number(res?.user?.sub);
        if (Number.isFinite(id)) {
          setUserId(id);
        } else {
          throw new Error('ID de usuario inválido');
        }
      } catch (err) {
        console.error('Error obteniendo usuario actual:', err);
        setError('No pudimos obtener tu información de usuario.');
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const currentDayNumber = useMemo(() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 7 : jsDay;
  }, []);

  const todaysHabits = useMemo(() => {
    if (!Array.isArray(habits) || habits.length === 0) {
      return [];
    }

    return habits.filter((habit) => {
      if (habit?.frequency !== 'weekly') {
        return true;
      }

      const rawDays = habit?.target_days;

      const targetDays = Array.isArray(rawDays)
        ? rawDays
        : typeof rawDays === 'string'
        ? rawDays
            .split(',')
            .map((value) => Number(value.trim()))
            .filter((value) => Number.isInteger(value) && value >= 1 && value <= 7)
        : [];

      return targetDays.includes(currentDayNumber);
    });
  }, [currentDayNumber, habits]);

  const onRefresh = useCallback(async () => {
    if (!userId) {
      return;
    }

    setRefreshing(true);
    try {
      await fetchHabits();
    } finally {
      setRefreshing(false);
    }
  }, [fetchHabits, userId]);

  const handleCompleteHabit = useCallback(
    async (habitId) => {
      if (!habitId || completingId) {
        return;
      }

      setCompletingId(habitId);
      try {

        const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
        await HabitLogsService.create({
          habit_id: habitId,
          date: today,
          completed: true,
        });
        setCompletedHabits((prev) => ({ ...prev, [habitId]: true }));
        Alert.alert('¡Buen trabajo!', 'Has completado este hábito hoy.');
      } catch (err) {
        console.error('Error al registrar el hábito completado:', err);
        Alert.alert(
          'Error',
          'Ocurrió un problema al registrar tu hábito. Intenta de nuevo más tarde.'
        );
      } finally {
        setCompletingId(null);
      }
    },
    [completingId]
  );

  const renderHabitItem = useCallback(
    ({ item }) => {
      const isCompleted = completedHabits[item.id];
      const isProcessing = completingId === item.id;

      return (
        <View style={styles.habitCard}>
          <View style={styles.habitInfo}>
            <Text style={styles.habitIcon}>{item.icon ?? '🔁'}</Text>
            <View style={styles.habitTextContainer}>
              <Text style={styles.habitName}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.habitDescription}>{item.description}</Text>
              ) : null}
              <Text style={styles.habitFrequency}>
                Frecuencia: {item.frequency === 'weekly' ? 'Semanal' : 'Diaria'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.completeButton, (isCompleted || isProcessing) && styles.completeButtonDisabled]}
            onPress={() => handleCompleteHabit(item.id)}
            disabled={isCompleted || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.completeButtonText}>
                {isCompleted ? 'Completado' : 'Completar'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [completedHabits, completingId, handleCompleteHabit]
  );

  const keyExtractor = useCallback((item) => item.id?.toString() ?? Math.random().toString(), []);

  const listEmptyComponent = useMemo(() => {
    if (loading) {
      return null;
    }

    if (error) {
      return (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHabits}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (habits.length > 0) {
      return (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            No tienes hábitos programados para hoy.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackText}>No tienes hábitos pendientes. ¡Crea uno para comenzar!</Text>
      </View>
    );
  }, [error, fetchHabits,habits.length, loading]);

  return (
    <View style={styles.container}>
      {loading && habits.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Cargando tus hábitos...</Text>
        </View>
      ) : (
        <FlatList
          data={todaysHabits}
          keyExtractor={keyExtractor}
          renderItem={renderHabitItem}
          contentContainerStyle={todaysHabits.length === 0 ? styles.listEmptyContent : styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
          }
          ListEmptyComponent={listEmptyComponent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  listContent: {
    paddingBottom: 100,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  habitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    alignSelf: 'stretch',
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  habitIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  habitTextContainer: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  habitFrequency: {
    fontSize: 12,
    color: '#9ca3af',
  },
  completeButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  feedbackContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  feedbackText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default HabitosScreen;