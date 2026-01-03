import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Method {
  id: string;
  name: string;
  api_ids: string[];
}

export default function AttackPanel() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('80');
  const [time, setTime] = useState('60');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingTarget, setCheckingTarget] = useState(false);
  const [targetStatus, setTargetStatus] = useState<any>(null);
  const [attackSent, setAttackSent] = useState(false);
  const [maxTimeAllowed, setMaxTimeAllowed] = useState(300);

  useEffect(() => {
    loadMethods();
    loadSettings();
  }, []);

  const loadMethods = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/methods`);
      setMethods(response.data);
      if (response.data.length > 0) {
        setSelectedMethod(response.data[0].name);
      }
    } catch (error) {
      console.error('Error loading methods:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`);
      setMaxTimeAllowed(response.data.max_time_allowed);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkTarget = async () => {
    if (!host) {
      Alert.alert('Error', 'Please enter a host');
      return;
    }

    setCheckingTarget(true);
    setTargetStatus(null);

    try {
      // Determine check type based on host format
      const checkType = host.includes('http') ? 'http' : 'ping';
      const cleanHost = host.replace(/^https?:\/\//, '').split('/')[0];

      const response = await axios.post(`${API_URL}/api/check-target`, {
        host: cleanHost,
        check_type: checkType,
      });

      setTargetStatus(response.data);
    } catch (error) {
      console.error('Error checking target:', error);
      setTargetStatus({ status: 'error', message: 'Failed to check target' });
    } finally {
      setCheckingTarget(false);
    }
  };

  const sendAttack = async () => {
    if (!host || !port || !time || !selectedMethod) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const timeNum = parseInt(time);
    if (timeNum > maxTimeAllowed) {
      Alert.alert('Error', `Time cannot exceed ${maxTimeAllowed} seconds`);
      return;
    }

    setLoading(true);
    setAttackSent(false);

    try {
      const response = await axios.post(`${API_URL}/api/attack`, {
        host: host.replace(/^https?:\/\//, '').split('/')[0],
        port: parseInt(port),
        time: timeNum,
        method: selectedMethod,
      });

      if (response.data.success) {
        setAttackSent(true);
        setTimeout(() => setAttackSent(false), 5000);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to send attack');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Target Status Check Panel */}
        <View style={styles.statusPanel}>
          <View style={styles.panelHeader}>
            <Ionicons name="pulse" size={24} color="#00d4ff" />
            <Text style={styles.panelTitle}>Target Status</Text>
          </View>

          <TouchableOpacity
            style={styles.checkButton}
            onPress={checkTarget}
            disabled={checkingTarget}
          >
            {checkingTarget ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.checkButtonText}>Check Target</Text>
              </>
            )}
          </TouchableOpacity>

          {targetStatus && (
            <View
              style={[
                styles.statusBox,
                targetStatus.status === 'alive' && styles.statusAlive,
                targetStatus.status === 'unreachable' && styles.statusDead,
                targetStatus.status === 'error' && styles.statusError,
              ]}
            >
              <Ionicons
                name={
                  targetStatus.status === 'alive'
                    ? 'checkmark-circle'
                    : targetStatus.status === 'unreachable'
                    ? 'close-circle'
                    : 'alert-circle'
                }
                size={24}
                color="#fff"
              />
              <Text style={styles.statusText}>
                {targetStatus.status === 'alive'
                  ? 'Target is Online'
                  : targetStatus.status === 'unreachable'
                  ? 'Target Unreachable'
                  : 'Error Checking Target'}
              </Text>
            </View>
          )}
        </View>

        {/* Attack Panel */}
        <View style={styles.attackPanel}>
          <View style={styles.panelHeader}>
            <Ionicons name="flash" size={24} color="#ff6b6b" />
            <Text style={styles.panelTitle}>Attack Configuration</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Host / Domain</Text>
            <TextInput
              style={styles.input}
              value={host}
              onChangeText={setHost}
              placeholder="example.com or 192.168.1.1"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Port</Text>
              <TextInput
                style={styles.input}
                value={port}
                onChangeText={setPort}
                placeholder="80"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time (seconds)</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="60"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Method</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedMethod}
                onValueChange={setSelectedMethod}
                style={styles.picker}
                dropdownIconColor="#00d4ff"
              >
                {methods.length === 0 ? (
                  <Picker.Item label="No methods available" value="" />
                ) : (
                  methods.map((method) => (
                    <Picker.Item
                      key={method.id}
                      label={method.name}
                      value={method.name}
                    />
                  ))
                )}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.attackButton,
              (loading || methods.length === 0) && styles.attackButtonDisabled,
            ]}
            onPress={sendAttack}
            disabled={loading || methods.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="rocket" size={24} color="#fff" />
                <Text style={styles.attackButtonText}>Launch Attack</Text>
              </>
            )}
          </TouchableOpacity>

          {attackSent && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={32} color="#fff" />
              <Text style={styles.successText}>Attack Sent</Text>
            </View>
          )}
        </View>

        <Text style={styles.maxTimeNote}>
          Max time allowed: {maxTimeAllowed} seconds
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statusPanel: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  attackPanel: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  checkButton: {
    backgroundColor: '#0f3460',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 12,
  },
  statusAlive: {
    backgroundColor: '#10b981',
  },
  statusDead: {
    backgroundColor: '#ef4444',
  },
  statusError: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
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
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    height: 50,
  },
  attackButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
    gap: 12,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  attackButtonDisabled: {
    backgroundColor: '#475569',
    shadowOpacity: 0,
  },
  attackButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successBox: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  successText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  maxTimeNote: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
