import React, { useRef, useMemo, useState, use } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, Switch } from 'react-native';
import UserService from "../../services/UserService"

const PerfilScreen = () => {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    //Para ver los modales
    const [modalEditarVisible, setModalEditarVisible] = useState(false);

    const [nombre, setNombre] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [bio, setBio] = useState(user.bio);
    const [notificaciones, setNotificaciones] = useState(true);


    //Metodos vacios
    const handleEditUser = () => {
        Alert.alert("Editar usuario", "Funcionalidad en desarrollo");
        console.log(user)
    };

    const handleChangePassword = () => {
        Alert.alert("Editar contraseña", "Funcionalidad en desarrollo");
    };

    const handleDeleteUser = () => {
        Alert.alert("Eliminar usuario", "Funcionalidad en desarrollo");
    };

    //Metodo inicial
    useEffect(() => {
        //Intentamos obtener el usuario actual
        const loadUser = async () => {
            try{
                const res = await AuthService.getCurrentUser();
                const userLog = await UserService.getById(res.sub);
                console.log(userLog)
                setUser(userLog);

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

    if(isLoading){
        return(
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>👤 Perfil del Usuario</Text>

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Nombre de usuario:</Text>
                <Text style={styles.value}>{user?.username || "Usuario anónimo"}</Text>

                <Text style={styles.label}>Biografía:</Text>
                <Text style={styles.value}>{user?.biografia || "Aún no tienes biografía"}</Text>
            </View>

            {/* --- Botones */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setModalEditarVisible(true)}>
                <Text style={styles.buttonText}>Editar usuario</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={null}>
                <Text style={styles.buttonText}>Editar contraseña</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={null}>
                <Text style={[styles.buttonText, styles.deleteButtonText]}>Eliminar usuario</Text>
                </TouchableOpacity>
            </View>

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

        </View>
    );
};
    
const styles = StyleSheet.create({
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
    paddingHorizontal: 15,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#b91c1c',
  },
  // 🎨 Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 25,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 8,
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
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PerfilScreen;