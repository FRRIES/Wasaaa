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
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface APIConfig {
  id: string;
  name: string;
  url: string;
  token?: string;
}

interface Method {
  id: string;
  name: string;
  api_ids: string[];
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
  const [apiToken, setApiToken] = useState('');
  const [methodName, setMethodName] = useState('');
  const [selectedApiIds, setSelectedApiIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [apisRes, methodsRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/configs`),
        axios.get(`${API_URL}/api/methods`),
        axios.get(`${API_URL}/api/settings`),
      ]);

      setApis(apisRes.data);
      setMethods(methodsRes.data);
      setMaxTime(settingsRes.data.max_time_allowed.toString());
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
      await axios.post(`${API_URL}/api/configs`, {
        name: apiName,
        url: apiUrl,
        token: apiToken || null,
      });

      setApiName('');
      setApiUrl('');
      setApiToken('');
      setShowAddAPI(false);
      loadData();
      Alert.alert('Success', 'API added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add API');
    }
  };

  const deleteAPI = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this API?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/api/configs/${id}`);
            loadData();
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

    try {
      await axios.post(`${API_URL}/api/methods`, { name: methodName });
      setMethodName('');
      setShowAddMethod(false);
      loadData();
      Alert.alert('Success', 'Method added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add method');
    }
  };

  const deleteMethod = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/api/methods/${id}`);
            loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete method');
          }
        },
      },
    ]);
  };

  const openLinkModal = (method: Method) => {
    setSelectedMethodForLink(method);
    setSelectedApiIds(method.api_ids || []);
    setShowLinkModal(true);
  };

  const toggleApiSelection = (apiId: string) => {
    if (selectedApiIds.includes(apiId)) {
      setSelectedApiIds(selectedApiIds.filter((id) => id !== apiId));
    } else {
      setSelectedApiIds([...selectedApiIds, apiId]);
    }
  };

  const linkApisToMethod = async () => {
    if (!selectedMethodForLink) return;

    try {
      await axios.post(`${API_URL}/api/methods/link`, {
        method_id: selectedMethodForLink.id,
        api_ids: selectedApiIds,
      });

      setShowLinkModal(false);
      setSelectedMethodForLink(null);
      setSelectedApiIds([]);
      loadData();
      Alert.alert('Success', 'APIs linked successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to link APIs');
    }
  };

  const updateMaxTime = async () => {
    try {
      await axios.post(`${API_URL}/api/settings`, {
        max_time_allowed: parseInt(maxTime),
      });
      Alert.alert('Success', 'Settings updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* APIs Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="cloud" size={24} color="#00d4ff" />
            <Text style={styles.sectionTitle}>API Endpoints</Text>
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
          <Text style={styles.emptyText}>No APIs configured yet</Text>
        )}
      </View>

      {/* Methods Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="hammer" size={24} color="#ff6b6b" />
            <Text style={styles.sectionTitle}>Methods</Text>
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
                {method.api_ids?.length || 0} API(s) linked
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
          <Text style={styles.emptyText}>No methods configured yet</Text>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="time" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.label}>Max Time Allowed (seconds)</Text>
          <TextInput
            style={styles.input}
            value={maxTime}
            onChangeText={setMaxTime}
            keyboardType="numeric"
            placeholder="300"
            placeholderTextColor="#6b7280"
          />
          <TouchableOpacity style={styles.saveButton} onPress={updateMaxTime}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add API Modal */}
      <Modal visible={showAddAPI} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New API</Text>
              <TouchableOpacity onPress={() => setShowAddAPI(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={apiName}
              onChangeText={setApiName}
              placeholder="API Name"
              placeholderTextColor="#6b7280"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="API URL (use [host], [port], [time], [method] as placeholders)"
              placeholderTextColor="#6b7280"
              multiline
            />

            <TextInput
              style={styles.input}
              value={apiToken}
              onChangeText={setApiToken}
              placeholder="Token (optional)"
              placeholderTextColor="#6b7280"
            />

            <TouchableOpacity style={styles.modalButton} onPress={addAPI}>
              <Text style={styles.modalButtonText}>Add API</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Method Modal */}
      <Modal visible={showAddMethod} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Method</Text>
              <TouchableOpacity onPress={() => setShowAddMethod(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={methodName}
              onChangeText={setMethodName}
              placeholder="Method Name (e.g., httpbypass)"
              placeholderTextColor="#6b7280"
            />

            <TouchableOpacity style={styles.modalButton} onPress={addMethod}>
              <Text style={styles.modalButtonText}>Add Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Link APIs Modal */}
      <Modal visible={showLinkModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Link APIs to {selectedMethodForLink?.name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowLinkModal(false);
                  setSelectedMethodForLink(null);
                  setSelectedApiIds([]);
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
                    selectedApiIds.includes(item.id) && styles.apiItemSelected,
                  ]}
                  onPress={() => toggleApiSelection(item.id)}
                >
                  <View style={styles.checkbox}>
                    {selectedApiIds.includes(item.id) && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.apiItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={linkApisToMethod}
            >
              <Text style={styles.modalButtonText}>Link APIs</Text>
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
