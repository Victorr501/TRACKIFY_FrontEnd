import React, {useState} from 'react';
import {     
    View,
    Text,
    TextInput,
    Button,
    Alert,
    StyleSheet,
    TouchableOpacity } from 'react-native';

const RegisterScreen = ({ navigation }) => {
  // Variables
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [visible, setVisible] = useState(false);
  const [repetirVisible, setRepetirVisible] = useState(false);

  // Método para registrar (vacío por ahora)
  const handleRegister = () => {
    
  };



  return (
    <View style={styles.container}>
        <Text style={styles.title}>Crear cuenta</Text>

        <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
        />

        <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
        />
        
        <View  style = {styles.passwordContainer}>
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#888"
                secureTextEntry = {!visible}
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity 
                    style={styles.eyeBtn}
                    onPress={() => setVisible(!visible)}
                >
                    <Text style={styles.eyeText}>
                        {visible ? "🙈" : "👁️"}
                    </Text>
            </TouchableOpacity>
        </View>

        <View style = {styles.passwordContainer}>
            <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#888"
            secureTextEntry = {!repetirVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            />
            <TouchableOpacity 
                    style={styles.eyeBtn}
                    onPress={() => setRepetirVisible(!repetirVisible)}
                >
                    <Text style={styles.eyeText}>
                        {repetirVisible ? "🙈" : "👁️"}
                    </Text>
            </TouchableOpacity>
        </View>
        

        {/* Botón de registro */}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>

        {/* Botón volver atrás */}
        <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
        >
            <Text style={styles.backButtonText}>Volver atrás</Text>
        </TouchableOpacity>
    </View>
  );
};

//Estilo
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
    color: '#222',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  eyeBtn: {
    position: 'absolute',
    right: 15,
  },
  eyeText: {
    fontSize: 20,
  },
});

export default RegisterScreen;