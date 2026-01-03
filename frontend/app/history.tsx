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
      'Clear History',
      'Are you sure you want to delete all history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('history', JSON.stringify([]));
              setHistory([]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: AttackHistory }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.hostInfo}>
          <Ionicons name="globe" size={18} color="#00ff9d" />
          <Text style={styles.host}>{item.host}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === 'sent' ? styles.statusSent : styles.statusFailed,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === 'sent' ? 'SENT' : 'FAILED'}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="link" size={14} color="#8b92a8" />
          <Text style={styles.detailLabel}>Port:</Text>
          <Text style={styles.detailValue}>{item.port}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time" size={14} color="#8b92a8" />
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{item.time}s</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="flash" size={14} color="#8b92a8" />
          <Text style={styles.detailLabel}>Method:</Text>
          <Text style={styles.detailValue}>{item.method}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Ionicons name="calendar" size={12} color="#4a5568" />
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="list" size={32} color="#00ff9d" />
          <View>
            <Text style={styles.headerTitle}>ATTACK HISTORY</Text>
            <Text style={styles.headerSubtitle}>{history.length} entries</Text>
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
            tintColor="#00ff9d"
            colors={['#00ff9d']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#1f2937" />
            <Text style={styles.emptyText}>No attack history yet</Text>
            <Text style={styles.emptySubtext}>
              Launch attacks to see them here
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
    backgroundColor: '#0a0e1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#151b2e',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff9d',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8b92a8',
    marginTop: 2,
  },
  clearButton: {
    backgroundColor: '#ff3366',
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
    backgroundColor: '#151b2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
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
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusSent: {
    backgroundColor: 'rgba(0, 255, 157, 0.2)',
    borderWidth: 1,
    borderColor: '#00ff9d',
  },
  statusFailed: {
    backgroundColor: 'rgba(255, 51, 102, 0.2)',
    borderWidth: 1,
    borderColor: '#ff3366',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    color: '#8b92a8',
    fontSize: 13,
  },
  detailValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  timestamp: {
    color: '#4a5568',
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#8b92a8',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#4a5568',
    fontSize: 14,
    marginTop: 8,
  },
});
