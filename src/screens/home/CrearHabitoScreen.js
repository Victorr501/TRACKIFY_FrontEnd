import React, { useMemo, useState, useEffect } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView
} from 'react-native';
import HabitService from '../../services/HabitService';
import AuthService from '../../services/AuthService';

const daysOfWeek = [
    { key: 'monday', label: 'Lun' },
    { key: 'tuesday', label: 'Mar' },
    { key: 'wednesday', label: 'Mié' },
    { key: 'thursday', label: 'Jue' },
    { key: 'friday', label: 'Vie' },
    { key: 'saturday', label: 'Sáb' },
    { key: 'sunday', label: 'Dom' },
];

const colorOptions = ['#6366F1', '#F97316', '#22C55E', '#F43F5E', '#0EA5E9', '#A855F7'];

const iconOptions = ['🔥', '📚', '💧', '💪', '🧘', '📝'];


const CrearHabitoScreen = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [selectedDays, setSelectedDays] = useState([]);
    const [color, setColor] = useState(colorOptions[0]);
    const [icon, setIcon] = useState(iconOptions[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [id, setId] = useState();

    const canSubmit = useMemo(() => {
        if (!name.trim()) {
            return false;
        }

        if (frequency === 'weekly' && selectedDays.length === 0) {
            return false;
        }

        return true;
    }, [name, frequency, selectedDays]);

    const toggleDay = (dayKey) => {
        setSelectedDays((prev) =>
            prev.includes(dayKey)
                ? prev.filter((day) => day !== dayKey)
                : [...prev, dayKey]
        );
    };

    const handleFrequencyChange = (value) => {
        setFrequency(value);
        if (value === 'daily') {
            setSelectedDays([]);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setFrequency('daily');
        setSelectedDays([]);
        setColor(colorOptions[0]);
        setIcon(iconOptions[0]);
    };

    const handleSubmit = async () => {
        if (!canSubmit || isSubmitting) {
            return;
        }


        const payload = {
            user_id: id,
            name: name.trim(),
            description: description.trim() ? description.trim() : null,
            frequency,
            target_days: frequency === 'weekly' ? selectedDays : [],
            color,
            icon,
        };

        console.log(payload)

        const sanitizedPayload = Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== null && value !== '')
        );

        try {
            setIsSubmitting(true);
            await HabitService.create(sanitizedPayload);
            Alert.alert('Hábito creado', 'Tu hábito se ha creado correctamente.');
            resetForm();
        } catch (error) {
            console.error('Error creando hábito:', error.response?.data || error.message || error);
            Alert.alert(
                'Error',
                'No se pudo crear el hábito. Inténtalo nuevamente más tarde.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    //Metodo inicial
    useEffect(() => {
        //Intentamos obtener el usuario actual
        const loadUser = async () => {
            try{
                const res = await AuthService.getCurrentUser();
                setId(Number(res.user.sub));

            } catch (err){
                console.log(err);
                await AuthService.loadUser();
                navigation.replace("Login")
            }
        };
        loadUser();
    }, []);

    return (
        <ScrollView 
            contentContainerStyle={styles.container}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            >
            <Text style={styles.title}>Crear un nuevo hábito</Text>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput
                style={styles.input}
                placeholder="Ej. Beber agua"
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Describe tu hábito"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            <Text style={styles.label}>Frecuencia *</Text>
            <View style={styles.frequencyContainer}>
                <TouchableOpacity
                    style={[
                        styles.frequencyButton,
                        frequency === 'daily' && styles.frequencyButtonActive,
                    ]}
                    onPress={() => handleFrequencyChange('daily')}
                >
                    <Text
                        style={[
                            styles.frequencyButtonText,
                            frequency === 'daily' && styles.frequencyButtonTextActive,
                        ]}
                    >
                        Diario
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.frequencyButton,
                        frequency === 'weekly' && styles.frequencyButtonActive,
                    ]}
                    onPress={() => handleFrequencyChange('weekly')}
                >
                    <Text
                        style={[
                            styles.frequencyButtonText,
                            frequency === 'weekly' && styles.frequencyButtonTextActive,
                        ]}
                    >
                        Semanal
                    </Text>
                </TouchableOpacity>
            </View>

            {frequency === 'weekly' && (
                <View style={styles.daysContainer}>
                    <Text style={styles.label}>Días objetivo *</Text>
                    <View style={styles.daysGrid}>
                        {daysOfWeek.map((day) => {
                            const isSelected = selectedDays.includes(day.key);
                            return (
                                <TouchableOpacity
                                    key={day.key}
                                    style={[
                                        styles.dayButton,
                                        isSelected && styles.dayButtonSelected,
                                    ]}
                                    onPress={() => toggleDay(day.key)}
                                >
                                    <Text
                                        style={[
                                            styles.dayButtonText,
                                            isSelected && styles.dayButtonTextSelected,
                                        ]}
                                    >
                                        {day.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}

            <Text style={styles.label}>Color</Text>
            <View style={styles.colorContainer}>
                {colorOptions.map((option) => {
                    const isSelected = color === option;
                    return (
                        <TouchableOpacity
                            key={option}
                            style={[styles.colorOption, { backgroundColor: option }]}
                            onPress={() => setColor(option)}
                        >
                            {isSelected && <Text style={styles.colorCheck}>✓</Text>}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={styles.label}>Icono</Text>
            <View style={styles.iconContainer}>
                {iconOptions.map((option) => {
                    const isSelected = icon === option;
                    return (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.iconOption,
                                isSelected && styles.iconOptionSelected,
                            ]}
                            onPress={() => setIcon(option)}
                        >
                            <Text style={styles.iconText}>{option}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                style={[styles.submitButton, (!canSubmit || isSubmitting) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
            >
                <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Creando...' : 'Crear hábito'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flexGrow: 1,        // 👈 esto hace que todo el contenido pueda expandirse y desplazarse
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#111827',
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    multilineInput: {
        minHeight: 100,
    },
    frequencyContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    frequencyButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
    },
    frequencyButtonActive: {
        backgroundColor: '#6366F1',
        borderColor: '#6366F1',
    },
    frequencyButtonText: {
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '600',
    },
    frequencyButtonTextActive: {
        color: '#FFFFFF',
    },
    daysContainer: {
        marginTop: 8,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    dayButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    dayButtonSelected: {
        backgroundColor: '#0EA5E9',
        borderColor: '#0EA5E9',
    },
    dayButtonText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '600',
    },
    dayButtonTextSelected: {
        color: '#FFFFFF',
    },
    colorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorCheck: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    iconContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    iconOptionSelected: {
        backgroundColor: '#F3F4F6',
        borderColor: '#6366F1',
    },
    iconText: {
        fontSize: 22,
    },
    submitButton: {
        marginTop: 32,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#22C55E',
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#acf1d2ff',
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default CrearHabitoScreen;