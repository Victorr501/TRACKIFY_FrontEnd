import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, Switch } from 'react-native';
import UserService from "../../services/UserService"
import AuthService from '../../services/AuthService';

const PerfilScreen = ({navigation}) => {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    //Para ver los modales
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [modalEditarContraseñaVisible, setModalEditarContraseñaVisible] = useState(false);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [notificaciones, setNotificaciones] = useState("");

    const [passwordEditarAntigua, setPasswordEditarAntigua] = useState("");
    const [passwordEditarNueva, setPasswordEditarNueva] = useState("");
    const [passwordEditarDuplicada, setPasswordEditarDuplicada] = useState("");

    const [visibleEditarAntigua, setVisibleEditarAntigua] = useState(false);
    const [visibleEditarNueva, setVisibleEditarNueva] = useState(false);
    const [visibleEditarDuplicada, setVisibleEditarDuplicada] = useState(false);

    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);

    const [error, setError] = useState('');

    //Metodos vacios
    const handleEditUser = async () => {
        // Validación simple antes de enviar
        if (!nombre.trim() || !email.trim()) {
            setError("El nombre y el correo no pueden estar vacíos");
            setModalEditarVisible(false)
            return;
        }

        try {
            setError("");

            const updateData = {
                username: nombre,
                email: email,
                bio: bio || null,
                notifications_enable: Boolean(notificaciones),
            };
        
            console.log(updateData)

            const updatedUser = await UserService.update(user.id, updateData);

            setUser(updatedUser);

            setModalEditarVisible(false);
            Alert.alert("Usuario actualizado", "Los cambios se han guardado correctamente");
        } catch(err){
            console.error("Error al actualizar usuario:", err);
            setError("No se pudo actualizar el usuario. Inténtalo más tarde");
        }
    };

    const handleChangePassword = async () => {
        if (!passwordEditarAntigua || !passwordEditarNueva || !passwordEditarDuplicada) {
        setError("Campos incompletos");
        setModalEditarContraseñaVisible(false)
        return;
        }

        if (passwordEditarNueva !== passwordEditarDuplicada) {
        setError("Contraseñas no coinciden");
        setModalEditarContraseñaVisible(false)
        return;
        }

        if (passwordEditarNueva.length < 6) {
        setError("Contraseña demasiado corta");
        setModalEditarContraseñaVisible(false)
        return;
        }

        try{
            const currentUser = await AuthService.getCurrentUser();
            const userId = currentUser.user.sub;

            const result = await UserService.changePassword(userId, passwordEditarAntigua, passwordEditarNueva);

            console.log("Contraseña actualizada:", result);

            setModalEditarContraseñaVisible(false);
            setPasswordEditarAntigua("");
            setPasswordEditarDuplicada("");
            setPasswordEditarNueva("");

            navigation.replace("Login");
        } catch(err){
            console.error("Error cambiando contraseñas:", err);
        }

    };

    const handleDeleteUser = () => {
        if (!password.trim()) {
            Alert.alert("Error", "Debes introducir tu contraseña para eliminar la cuenta.");
            return;
        }

        
        Alert.alert(
            "Confirmar eliminación",
            "Esta acción eliminará tu cuenta permanentemente. ¿Estás seguro?",
            [
                {
                    text:"Cancelar",
                    style: "cancel",
                },
                {
                    text:"Eliminar",
                    style: "destructive",
                    onPress: () => {
                        (async () => {
                            try{
                                const currentUser = await AuthService.getCurrentUser();
                                const userId = currentUser.user.sub;

                                await UserService.deleteUser(userId, password);

                                setModalDeleteVisible(false);
                                setPassword("");

                                Alert.alert("Cuenta eliminada", "Tu cuenta ha sido eliminada correctamente.");
                                navigation.replace("Login");
                            }catch (err){
                                console.error("Error al aliminar usuario:", err);
                            }
                        })()
                    } 
                }
            ]
        )
    };

    //Metodo inicial
    useEffect(() => {
        //Intentamos obtener el usuario actual
        const loadUser = async () => {
            try{
                const res = await AuthService.getCurrentUser();
                const userLog = await UserService.getById(res.user.sub);
                console.log(userLog)
                setUser(userLog);
                setNombre(userLog.username);
                setEmail(userLog.email);
                setBio(userLog.bio || null);
                setNotificaciones(userLog.notifications_enable);

            } catch (err){
                console.log(err);
                await AuthService.loadUser();
                navigation.replace("Login")
            } finally {
              setIsLoading(false);
            }
        };
        loadUser();
    }, []);


    return (
        <View style={styles.container}>
            <Text style={styles.title}>👤 Perfil del Usuario</Text>

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Nombre de usuario:</Text>
                <Text style={styles.value}>{user?.username || "Usuario anónimo"}</Text>

                <Text style={styles.label}>Biografía:</Text>
                <Text style={styles.value}>{user?.bio || "Aún no tienes biografía"}</Text>
            </View>

            {/* --- Botones */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setModalEditarVisible(true)}>
                <Text style={styles.buttonText}>Editar usuario</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => setModalEditarContraseñaVisible(true)}>
                <Text style={styles.buttonText}>Editar contraseña</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => setModalDeleteVisible(true)}>
                <Text style={[styles.buttonText, styles.deleteButtonText]}>Eliminar usuario</Text>
                </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* --- Modal 1:  Editar usuario */}
            
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalEditarVisible}
                onRequestClose={() => setModalEditarVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Editar perfil</Text>

                        <TextInput
                        style={styles.input}
                        placeholder="Nombre"
                        value={nombre}
                        onChangeText={setNombre}
                        />

                        <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        />

                        <TextInput
                        style={[styles.input, { height: 80 }]}
                        placeholder="Biografía"
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        />

                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Notificaciones</Text>
                            <Switch
                                value={notificaciones}
                                onValueChange={setNotificaciones}
                                trackColor={{ false: '#ccc', true: '#4f46e5' }}
                                thumbColor={notificaciones ? '#fff' : '#fff'}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleEditUser}
                            >
                                <Text style={styles.saveText}>Guardar cambios</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalEditarVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- Modal 2:  Editar contraseña */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalEditarContraseñaVisible}
                onRequestClose={() => setModalEditarContraseñaVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Editar contraseña</Text>

                        <View style = {styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Antigua contraseña"
                                placeholderTextColor="#888"
                                secureTextEntry = {!visibleEditarAntigua}
                                value={passwordEditarAntigua}
                                onChangeText={setPasswordEditarAntigua}
                            />
                            <TouchableOpacity 
                                    style={styles.eyeBtn}
                                    onPress={() => setVisibleEditarAntigua(!visibleEditarAntigua)}
                                >
                                    <Text style={styles.eyeText}>
                                        {visibleEditarAntigua ? "🙈" : "👁️"}
                                    </Text>
                            </TouchableOpacity>
                        </View>

                        <View style = {styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Nueva contraseña"
                                placeholderTextColor="#888"
                                secureTextEntry = {!visibleEditarNueva}
                                value={passwordEditarNueva}
                                onChangeText={setPasswordEditarNueva}
                            />
                            <TouchableOpacity 
                                    style={styles.eyeBtn}
                                    onPress={() => setVisibleEditarNueva(!visibleEditarNueva)}
                                >
                                    <Text style={styles.eyeText}>
                                        {visibleEditarNueva ? "🙈" : "👁️"}
                                    </Text>
                            </TouchableOpacity>
                        </View>

                        <View style = {styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Repite la contraseña"
                                placeholderTextColor="#888"
                                secureTextEntry = {!visibleEditarDuplicada}
                                value={passwordEditarDuplicada}
                                onChangeText={setPasswordEditarDuplicada}
                            />
                            <TouchableOpacity 
                                    style={styles.eyeBtn}
                                    onPress={() => setVisibleEditarDuplicada(!visibleEditarDuplicada)}
                                >
                                    <Text style={styles.eyeText}>
                                        {visibleEditarDuplicada ? "🙈" : "👁️"}
                                    </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleChangePassword}
                            >
                                <Text style={styles.saveText}>Guardar contraseña</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalEditarContraseñaVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* --- Modal 3:  Eliminar contraseña */}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalDeleteVisible}
                onRequestClose={() => setModalDeleteVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Eliminar cuenta</Text>

                        <View style = {styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
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

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleDeleteUser}
                            >
                                <Text style={styles.saveText}>Eliminar Cuenta</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalDeleteVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
};
    
const styles = StyleSheet.create({
  // 📱 Pantalla principal
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    color: '#222',
    marginTop: 4,
  },
  buttonsContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    alignSelf: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#b91c1c',
  },

  // 🎨 Modal general
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalContainer: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 25,
  },

  // 🧾 Inputs generales
  input: {
    borderWidth: 1.2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 14,
    color: '#333',
    backgroundColor: '#f9fafb',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },

  // 🔐 Inputs de contraseña con icono
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  eyeBtn: {
    position: 'absolute',
    right: 15,
  },
  eyeText: {
    fontSize: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },

  // ⚙️ Botones dentro de los modales
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },

  // ⚠️ Mensajes de error
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default PerfilScreen;