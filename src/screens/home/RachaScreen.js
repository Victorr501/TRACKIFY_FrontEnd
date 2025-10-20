import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HabitLongsService from '../../services/HabitLongsService';
import UserService from '../../services/UserService';
import AuthService from '../../services/AuthService';

const dayHeaders = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const getMonthLabel = (date) =>
  date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^(.)/, (match) => match.toUpperCase());

const buildCalendarMatrix = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmpty = (firstDay.getDay() + 6) % 7; // Ajuste para que el lunes sea el primer día
  const totalCells = Math.ceil((leadingEmpty + daysInMonth) / 7) * 7;

  const matrix = [];
  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - leadingEmpty + 1;
    matrix.push(dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null);
  }

  return matrix;
};

const normalizeDate = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString().split('T')[0];
};

const RachaScreen = ({ }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [user, setUser] = useState();

  const streakCount = user?.streak_count ?? 0;
  const maxStreak = user?.max_streak ?? 0;
  const streakIcon = streakCount > 0 ? '🔥' : '🧊';
  const streakLabel = streakCount > 0 ? 'Racha activa' : 'Sin racha';

  const completedDates = useMemo(() => {
    const dates = new Set();

    logs.forEach((log) => {
      if (!log?.completed) return;

      const normalized = normalizeDate(log.date);
      if (normalized) {
        dates.add(normalized);
      }
    });

    return dates;
    }, [logs]);

    const fetchLogs = async () => {
        if (!user?.id) {
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await HabitLongsService.getUserLogs(user.id);
      setLogs(Array.isArray(response) ? response : response?.data ?? []);
    } catch (err) {
      console.error('Error al obtener los registros de hábitos:', err);
      setError('No pudimos cargar tus registros de racha. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const calendarDays = useMemo(() => buildCalendarMatrix(currentMonth), [currentMonth]);

  const isDayCompleted = (day) => {
    if (!day) return false;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const formatted = normalizeDate(new Date(year, month, day));

    return formatted ? completedDates.has(formatted) : false;
  };

  //Metodo inicial
    useEffect(() => {
        //Intentamos obtener el usuario actual
        const loadUser = async () => {
            try{
                const res = await AuthService.getCurrentUser();
                const userLog = await UserService.getById(res.user.sub);
                setUser(userLog);
            } catch (err){
                console.log(err);
                await AuthService.loadUser();
                navigation.replace("Login")
            }
        };
        loadUser();
    }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.streakCard}>
        <Text style={styles.streakIcon}>{streakIcon}</Text>
        <View>
          <Text style={styles.streakLabel}>{streakLabel}</Text>
          <Text style={styles.streakValue}>{streakCount} días</Text>
          <Text style={styles.streakSubtext}>Mejor racha: {maxStreak} días</Text>
        </View>
      </View>

      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{getMonthLabel(currentMonth)}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>▶</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dayHeaderRow}>
        {dayHeaders.map((day) => (
          <Text key={day} style={styles.dayHeaderText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          const completed = isDayCompleted(day);
          return (
            <View
              // eslint-disable-next-line react/no-array-index-key
              key={`${day ?? 'empty'}-${index}`}
              style={[styles.dayCell, completed && styles.completedDay]}
            >
              <Text style={[styles.dayText, completed && styles.completedDayText]}>{day ?? ''}</Text>
            </View>
          );
        })}
      </View>

      {loading && (
        <View style={styles.feedbackContainer}>
          <ActivityIndicator size="small" color="#ff7f50" />
          <Text style={styles.feedbackText}>Cargando tu racha...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchLogs} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && logs.length === 0 && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            Aún no tienes registros de hábitos completados. ¡Empieza una racha hoy!
          </Text>
        </View>
      )}

      <View style={styles.legendContainer}>
        <View style={[styles.legendItem, styles.legendCompleted]} />
        <Text style={styles.legendText}>Día completado</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f7f7f7',
    flexGrow: 1,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  streakIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  streakLabel: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff7f50',
  },
  streakSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  monthButtonText: {
    fontSize: 18,
    color: '#555',
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayHeaderText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  dayText: {
    fontSize: 15,
    color: '#555',
  },
  completedDay: {
    backgroundColor: '#ffe8dd',
  },
  completedDayText: {
    color: '#ff6f3c',
    fontWeight: '700',
  },
  feedbackContainer: {
    marginTop: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#c0392b',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: '#ff7f50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  legendItem: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendCompleted: {
    backgroundColor: '#ffbfa1',
  },
  legendText: {
    color: '#666',
    fontSize: 13,
  },
});

export default RachaScreen;