import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AttackHistory {
  id: string;
  host: string;
  port: number;
  time: number;
  method: string;
  status: string;
  timestamp: string;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<AttackHistory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem('history');
      if (historyData) {
        setHistory(JSON.parse(historyData));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const clearHistory = async () => {
    Alert.alert(
      'Limpiar Historial',
      '¿Estás seguro de eliminar todo el historial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('history', JSON.stringify([]));
              setHistory([]);
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar el historial');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  };

  const renderItem = ({ item }: { item: AttackHistory }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.hostInfo}>
          <Ionicons name="globe" size={20} color="#00d4ff" />
          <Text style={styles.host}>{item.host}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === 'sent' ? styles.statusSent : styles.statusFailed,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === 'sent' ? 'ENVIADO' : 'FALLIDO'}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="link" size={16} color="#94a3b8" />
          <Text style={styles.detailLabel}>Puerto:</Text>
          <Text style={styles.detailValue}>{item.port}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#94a3b8" />
          <Text style={styles.detailLabel}>Duración:</Text>
          <Text style={styles.detailValue}>{item.time}s</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="hammer" size={16} color="#94a3b8" />
          <Text style={styles.detailLabel}>Método:</Text>
          <Text style={styles.detailValue}>{item.method}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Ionicons name="calendar" size={14} color="#6b7280" />
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="time" size={28} color="#00d4ff" />
          <View>
            <Text style={styles.headerTitle}>Historial de Ataques</Text>
            <Text style={styles.headerSubtitle}>{history.length} registros</Text>
          </View>
        </View>
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <Ionicons name="trash" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00d4ff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#334155" />
            <Text style={styles.emptyText}>No hay historial aún</Text>
            <Text style={styles.emptySubtext}>
              Lanza ataques para verlos aquí
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  host: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusSent: {
    backgroundColor: '#10b981',
  },
  statusFailed: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  timestamp: {
    color: '#6b7280',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
  },
});
