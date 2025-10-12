import React, {useState} from 'react';
import {     
    View,
    Text,
    TextInput,
    Button,
    Alert,
    StyleSheet,
    TouchableOpacity } from 'react-native';
import { isValidEmail } from '../utils/validation';
import AuthService from '../services/AuthService';

const LoginScreen = ({ navigation }) => {

    //Variables
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
      setError("");

      if (!email || !password){
        setError('Por favor rellena todos los campos.');
        return;
      }

      if (!isValidEmail(email)){
        setError('Introduce un correo electrónico válido');
        return;
      }

      try{
        const res = await AuthService.login({
          email,
          password,
        });
        console.log("Login correcto", res);
        navigation.replace('Home');
      } catch (error){
        console.error("Error de login: " , error);
        setError("Credenciales incorrectas o servidor no disponible.");
      }
    }

    //Pantalla
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar sesión</Text>

            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <View style = {styles.passwordContainer}>
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

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>
                ¿No tienes cuenta? Regístrate aquí
                </Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    )
}


//Estilo de la pagina
const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
  },
  logo: {
    fontSize: 38,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
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
  button: {
    backgroundColor: '#007AFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  registerText: {
    color: '#555',
    fontSize: 15,
  },
  registerHighlight: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default LoginScreen