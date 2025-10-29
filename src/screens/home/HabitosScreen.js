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
import UserService from '../../services/UserService';

const HabitosScreen = () => {
    const [userId, setUserId] = useState(null);
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [completingId, setCompletingId] = useState(null);
    const [completedHabits, setCompletedHabits] = useState({});
    const [streakInfo, setStreakInfo] = useState({ current: 0, max: 0 });

    useEffect(() => {
        if (userId && habits.length > 0) {
            updateHabitLogsState(); // 🔥 sincroniza hábitos completados desde el backend
        }
    }, [userId, habits]);

    const getDateKey = useCallback((value) => {
        if (!value) {
        return null;
        }

        const date = value instanceof Date ? new Date(value) : new Date(String(value));
        if (Number.isNaN(date.getTime())) {
        return null;
        }

        const normalized = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        );

        return normalized.toISOString().split('T')[0];
    }, []);

    //Calcula la racha
    const calculateStreakInfo = useCallback((logs, maxUserStreak = 0, userStreak = 0) => {
        if (!Array.isArray(logs) || logs.length === 0) {
        return { current: userStreak, max: maxUserStreak };
        }

        const completedDates = logs
        .filter((log) => log?.completed)
        .map((log) => getDateKey(log.date))
        .filter(Boolean);

        if (completedDates.length === 0) {
        return { current: 0, max: 0 };
        }

        const uniqueDates = Array.from(new Set(completedDates)).sort();

        let maxStreak = 0;
        let currentStreakCounter = 0;
        let currentStreak = 0;
        let previousDate = null;

        uniqueDates.forEach((dateKey, index) => {
        if (!previousDate) {
            currentStreakCounter = 1;
        } else {
            const prev = new Date(previousDate);
            const current = new Date(dateKey);
            const diffInDays = Math.round(
            (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffInDays === 1) {
            currentStreakCounter += 1;
            } else {
            currentStreakCounter = 1;
            }
        }

        previousDate = dateKey;

        if (currentStreakCounter > maxStreak) {
            maxStreak = currentStreakCounter;
        }

        if (index === uniqueDates.length - 1) {
            currentStreak = currentStreakCounter;
        }
        });

        // 🧠 --- Ajuste inteligente de racha ---
        const lastDate = new Date(uniqueDates[uniqueDates.length - 1]);
        const today = new Date();
        const diffWithToday = Math.round(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // 🟢 Caso 1: Último hábito fue hoy → racha actual válida
        if (diffWithToday === 0) {
        return { current: currentStreak, max: Math.max(maxStreak, currentStreak, maxUserStreak) };
        }

        // 🟡 Caso 2: Último hábito fue ayer → mantener racha (aún no ha hecho nada hoy)
        if (diffWithToday === 1) {
        return { current: currentStreak, max: Math.max(maxStreak, currentStreak, maxUserStreak) };
        }

        // 🔴 Caso 3: Han pasado 2 o más días → se rompe la racha
        if (diffWithToday > 1) {
        return { current: 0, max: Math.max(maxStreak, currentStreak, maxUserStreak) };
        }

        return { current: currentStreak, max: Math.max(maxStreak, currentStreak, maxUserStreak) };
    },
    [getDateKey]
    );

    //Esto carga los logs
    const updateHabitLogsState = useCallback(async () => {
        if (!userId) {
        return null;
        }

        try {
        const response = await HabitLogsService.getUserLogs(userId);
        const logsData = Array.isArray(response) ? response : response?.data ?? [];

        const user = await UserService.getById(userId);

        const todayKey = getDateKey(new Date());
        const todaysCompletion = {};

        logsData.forEach((log) => {
            if (!log?.habit_id || !log?.completed) {
            return;
            }

            const logDateKey = getDateKey(log.date);
            if (!logDateKey || logDateKey !== todayKey) {
            return;
            }

            todaysCompletion[log.habit_id] = true;
        });

        setCompletedHabits(todaysCompletion);
        const streak = calculateStreakInfo(logsData, user.max_streak, user.streak_count);
        setStreakInfo(streak);
        await UserService.update(userId, {
            streak_count: streak.current,
            max_streak: streak.max,
        })
        } catch (err) {
        console.error('Error al actualizar los registros de hábitos:', err);
        return null;
        }
    }, [calculateStreakInfo, getDateKey, userId]);

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
            await updateHabitLogsState();
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
        await updateHabitLogsState();
        } finally {
        setRefreshing(false);
        }
    }, [fetchHabits, userId]);
    

    //Añadir habito
    const handleCompleteHabit = useCallback(
        async (habitId) => {
            if (!habitId || completingId) return;

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

            const response = await HabitLogsService.getUserLogs(userId);
            const logsData = Array.isArray(response) ? response : response?.data ?? [];

            logsData.push({ habit_id: habitId, date: today, completed: true });

            const streak = calculateStreakInfo(logsData);
            setStreakInfo(streak);

            await UserService.update(userId, {
                streak_count: streak.current,
                max_streak: streak.max,
            });
            } catch (err) {
            const backendMessage = err?.response?.data?.detail;

            if (err?.response?.status === 400 && backendMessage) {
                setCompletedHabits((prev) => ({ ...prev, [habitId]: true }));
                Alert.alert('Ya completado', backendMessage);
            } else {
                console.error('Error al registrar el hábito completado:', err);
                Alert.alert(
                'Error',
                'Ocurrió un problema al registrar tu hábito. Intenta de nuevo más tarde.'
                );
            }
            } finally {
            setCompletingId(null);
            }
        },[completingId, userId, calculateStreakInfo, getDateKey]
    );

    // Eliminar hábito
    const handleDeleteHabit = useCallback(
    async (habitId) => {
        if (!habitId) return;

        Alert.alert(
        'Eliminar hábito',
        '¿Seguro que deseas eliminar este hábito? Esta acción no se puede deshacer.',
        [
            { text: 'Cancelar', style: 'cancel' },
            {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
                try {
                await HabitService.delete(habitId); // <- asegúrate de tener este endpoint en tu backend
                setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
                Alert.alert('Eliminado', 'El hábito ha sido eliminado correctamente.');
                } catch (err) {
                console.error('Error al eliminar el hábito:', err);
                Alert.alert('Error', 'No se pudo eliminar el hábito. Intenta de nuevo más tarde.');
                }
            },
            },
        ]
        );
    },
    [setHabits]
    );

    //Esta es la tarjeta que muestra
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

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[
                    styles.completeButton,
                    (isCompleted || isProcessing) && styles.completeButtonDisabled,
                    ]}
                    onPress={() => handleCompleteHabit(item.id)}
                    disabled={isCompleted || isProcessing}
                >
                    {isProcessing ? (
                    <ActivityIndicator size="small" color="#fff" />
                    ) : (
                    <Text style={styles.completeButtonText}>
                        {isCompleted ? '✅' : '☐'}
                    </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteHabit(item.id)}
                >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
                </View>
            </View>
        );
        },
        [completedHabits, completingId, handleCompleteHabit]
    );

    const keyExtractor = useCallback((item) => item.id?.toString() ?? Math.random().toString(), []);


    //Si hay algun error o si hay algo que no cuadra
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


    //Lista de habitos
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
    backgroundColor: '#6366F1', // morado
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 90, // tamaño más pequeño pero igual al de eliminar
    alignItems: 'center',
    justifyContent: 'center',
    },

    completeButtonDisabled: {
    backgroundColor: '#a5b4fc',
    },

    completeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13, // un poco más pequeño
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
    actionsContainer: {
        flexDirection: 'column', // 🔥 uno encima del otro
        alignItems: 'flex-end',  // los mantiene a la derecha
        justifyContent: 'center',
        marginLeft: 10, // pequeña separación respecto al texto
    },

    deleteButton: {
        backgroundColor: '#EF4444', // rojo
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        marginLeft: 8,
        minWidth: 90, // mismo ancho que el de completar
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },

    deleteButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
});

export default HabitosScreen;