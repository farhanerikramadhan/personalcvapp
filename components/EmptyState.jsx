import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function EmptyState({ message = 'Belum ada data.' }) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: theme.bgSoft }]}>
        <Text style={styles.icon}>∅</Text>
      </View>
      <Text style={[styles.text, { color: theme.textMute }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 80, alignItems: 'center' },
  circle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  icon: { fontSize: 32, color: '#9CA3AF' },
  text: { fontSize: 13, fontWeight: '500', letterSpacing: 0.5 },
});