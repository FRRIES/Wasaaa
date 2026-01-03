import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TestSimple() {
  const [count, setCount] = useState(0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-half" size={48} color="#00ff9d" />
        <Text style={styles.title}>STRESS TESTER</Text>
        <Text style={styles.subtitle}>Test Page - Working!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Counter Test</Text>
        <Text style={styles.count}>{count}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>INCREMENT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status</Text>
        <View style={styles.statusGood}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.statusText}>App is Working!</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff9d',
    marginTop: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#8b92a8',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#151b2e',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  count: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00ff9d',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#ff3366',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusGood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0, 255, 157, 0.2)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff9d',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
