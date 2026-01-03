import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface APIConfig {
  id: string;
  name: string;
  url: string;
}

interface Method {
  id: string;
  name: string;
  apiId: string;
}

export default function ConfigScreen() {
  const [apis, setApis] = useState<APIConfig[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [maxTime, setMaxTime] = useState('300');
  const [showAddAPI, setShowAddAPI] = useState(false);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedMethodForLink, setSelectedMethodForLink] = useState<Method | null>(null);

  // Form states
  const [apiName, setApiName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [methodName, setMethodName] = useState('');
  const [selectedApiId, setSelectedApiId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [apisData, methodsData, settingsData] = await Promise.all([
        AsyncStorage.getItem('apis'),
        AsyncStorage.getItem('methods'),
        AsyncStorage.getItem('settings'),
      ]);

      if (apisData) setApis(JSON.parse(apisData));
      if (methodsData) setMethods(JSON.parse(methodsData));
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        setMaxTime(settings.maxTimeAllowed?.toString() || '300');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addAPI = async () => {
    if (!apiName || !apiUrl) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const newApi: APIConfig = {
        id: Date.now().toString(),
        name: apiName,
        url: apiUrl,
      };

      const updatedApis = [...apis, newApi];
      await AsyncStorage.setItem('apis', JSON.stringify(updatedApis));
      setApis(updatedApis);

      setApiName('');
      setApiUrl('');
      setShowAddAPI(false);
      Alert.alert('Éxito', 'API agregada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la API');
    }
  };

  const deleteAPI = async (id: string) => {
    Alert.alert('Confirmar', '¿Estás seguro de eliminar esta API?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedApis = apis.filter((api) => api.id !== id);
            await AsyncStorage.setItem('apis', JSON.stringify(updatedApis));
            setApis(updatedApis);
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar la API');
          }
        },
      },
    ]);
  };

  const addMethod = async () => {
    if (!methodName) {
      Alert.alert('Error', 'Por favor ingresa un nombre de método');
      return;
    }

    if (apis.length === 0) {
      Alert.alert('Error', 'Primero debes agregar al menos una API');
      return;
    }

    try {
      const newMethod: Method = {
        id: Date.now().toString(),
        name: methodName,
        apiId: apis[0].id, // Default to first API
      };

      const updatedMethods = [...methods, newMethod];
      await AsyncStorage.setItem('methods', JSON.stringify(updatedMethods));
      setMethods(updatedMethods);

      setMethodName('');
      setShowAddMethod(false);
      Alert.alert('Éxito', 'Método agregado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el método');
    }
  };

  const deleteMethod = async (id: string) => {
    Alert.alert('Confirmar', '¿Estás seguro de eliminar este método?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedMethods = methods.filter((method) => method.id !== id);
            await AsyncStorage.setItem('methods', JSON.stringify(updatedMethods));
            setMethods(updatedMethods);
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el método');
          }
        },
      },
    ]);
  };

  const openLinkModal = (method: Method) => {
    setSelectedMethodForLink(method);
    setSelectedApiId(method.apiId);
    setShowLinkModal(true);
  };

  const linkApiToMethod = async () => {
    if (!selectedMethodForLink || !selectedApiId) return;

    try {
      const updatedMethods = methods.map((m) =>
        m.id === selectedMethodForLink.id ? { ...m, apiId: selectedApiId } : m
      );

      await AsyncStorage.setItem('methods', JSON.stringify(updatedMethods));
      setMethods(updatedMethods);

      setShowLinkModal(false);
      setSelectedMethodForLink(null);
      setSelectedApiId('');
      Alert.alert('Éxito', 'API vinculada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo vincular la API');
    }
  };

  const updateMaxTime = async () => {
    try {
      const settings = { maxTimeAllowed: parseInt(maxTime) };
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
      Alert.alert('Éxito', 'Configuración actualizada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la configuración');
    }
  };

  const initializeDefaultData = async () => {
    Alert.alert(
      'Inicializar Datos',
      '¿Deseas cargar la configuración por defecto? Esto agregará APIs y métodos de ejemplo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inicializar',
          onPress: async () => {
            try {
              const defaultApi: APIConfig = {
                id: 'default-l7-api',
                name: 'Default L7 API',
                url: 'https://api.l7srv.su/private/attack?token=SbesnilX8ololuZV8Jvo0k&host=[host]&port=[port]&time=[time]&method=[method]&concs=5',
              };

              const defaultMethods: Method[] = [
                { id: 'method-1', name: 'httpbypass', apiId: 'default-l7-api' },
                { id: 'method-2', name: 'httpflood', apiId: 'default-l7-api' },
                { id: 'method-3', name: 'tls', apiId: 'default-l7-api' },
                { id: 'method-4', name: 'udpflood', apiId: 'default-l7-api' },
              ];

              await AsyncStorage.setItem('apis', JSON.stringify([defaultApi]));
              await AsyncStorage.setItem('methods', JSON.stringify(defaultMethods));

              loadData();
              Alert.alert('Éxito', 'Configuración por defecto cargada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo inicializar la configuración');
            }
          },
        },
      ]
    );
  };

  const getApiName = (apiId: string) => {
    const api = apis.find((a) => a.id === apiId);
    return api ? api.name : 'No vinculada';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Initialize Button */}
      {apis.length === 0 && methods.length === 0 && (
        <TouchableOpacity style={styles.initButton} onPress={initializeDefaultData}>
          <Ionicons name="download" size={24} color="#fff" />
          <Text style={styles.initButtonText}>Cargar Configuración por Defecto</Text>
        </TouchableOpacity>
      )}

      {/* APIs Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="cloud" size={24} color="#00d4ff" />
            <Text style={styles.sectionTitle}>APIs</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddAPI(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {apis.map((api) => (
          <View key={api.id} style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{api.name}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {api.url}
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteAPI(api.id)}>
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}

        {apis.length === 0 && (
          <Text style={styles.emptyText}>No hay APIs configuradas</Text>
        )}
      </View>

      {/* Methods Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="hammer" size={24} color="#ff6b6b" />
            <Text style={styles.sectionTitle}>Métodos</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddMethod(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {methods.map((method) => (
          <View key={method.id} style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{method.name}</Text>
              <Text style={styles.cardSubtitle}>
                API: {getApiName(method.apiId)}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => openLinkModal(method)}
              >
                <Ionicons name="link" size={20} color="#00d4ff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteMethod(method.id)}>
                <Ionicons name="trash" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {methods.length === 0 && (
          <Text style={styles.emptyText}>No hay métodos configurados</Text>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="time" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Configuración</Text>
          </View>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.label}>Tiempo Máximo Permitido (segundos)</Text>
          <TextInput
            style={styles.input}
            value={maxTime}
            onChangeText={setMaxTime}
            keyboardType="numeric"
            placeholder="300"
            placeholderTextColor="#6b7280"
          />
          <TouchableOpacity style={styles.saveButton} onPress={updateMaxTime}>
            <Text style={styles.saveButtonText}>Guardar Configuración</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add API Modal */}
      <Modal visible={showAddAPI} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nueva API</Text>
              <TouchableOpacity onPress={() => setShowAddAPI(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={apiName}
              onChangeText={setApiName}
              placeholder="Nombre de la API"
              placeholderTextColor="#6b7280"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="URL de la API (usa [host], [port], [time], [method] como marcadores)"
              placeholderTextColor="#6b7280"
              multiline
            />

            <TouchableOpacity style={styles.modalButton} onPress={addAPI}>
              <Text style={styles.modalButtonText}>Agregar API</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Method Modal */}
      <Modal visible={showAddMethod} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nuevo Método</Text>
              <TouchableOpacity onPress={() => setShowAddMethod(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={methodName}
              onChangeText={setMethodName}
              placeholder="Nombre del método (ej: httpbypass)"
              placeholderTextColor="#6b7280"
            />

            <TouchableOpacity style={styles.modalButton} onPress={addMethod}>
              <Text style={styles.modalButtonText}>Agregar Método</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Link API Modal */}
      <Modal visible={showLinkModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Vincular API a {selectedMethodForLink?.name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowLinkModal(false);
                  setSelectedMethodForLink(null);
                  setSelectedApiId('');
                }}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={apis}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.apiItem,
                    selectedApiId === item.id && styles.apiItemSelected,
                  ]}
                  onPress={() => setSelectedApiId(item.id)}
                >
                  <View style={styles.checkbox}>
                    {selectedApiId === item.id && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.apiItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={linkApiToMethod}
            >
              <Text style={styles.modalButtonText}>Vincular API</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
  },
  initButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  initButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  addButton: {
    backgroundColor: '#0f3460',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  linkButton: {
    padding: 4,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  settingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalButton: {
    backgroundColor: '#00d4ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  apiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  apiItemSelected: {
    borderColor: '#00d4ff',
    backgroundColor: '#0f3460',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#00d4ff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apiItemText: {
    color: '#fff',
    fontSize: 16,
  },
});
