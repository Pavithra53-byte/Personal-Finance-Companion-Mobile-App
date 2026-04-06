import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { useFinanceStore } from '../state/useFinanceStore';
import { useAppTheme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';

export default function AlarmsScreen({ navigation }) {
  const { colors, typography, spacing, borderRadius, isDark } = useAppTheme();
  const styles = getStyles({ colors, typography, spacing, borderRadius, isDark });
  const { alarms, updateAlarm, deleteAlarm, currency } = useFinanceStore();

  const toggleAlarm = (alarm) => {
    updateAlarm({ ...alarm, enabled: !alarm.enabled });
  };

  const renderItem = ({ item }) => (
    <Card style={styles.alarmCard}>
      <View style={styles.alarmHeader}>
        <Text style={styles.alarmTime}>{item.time}</Text>
        <Switch
          value={item.enabled}
          onValueChange={() => toggleAlarm(item)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={isDark ? colors.text : colors.surface}
        />
      </View>
      <Text style={styles.alarmName}>{item.name}</Text>
      {item.date && <Text style={styles.alarmDate}>{item.date}</Text>}
      {item.description && <Text style={styles.alarmDesc}>{item.description}</Text>}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('AddEditAlarm', { alarmId: item.id })}>
          <Ionicons name="pencil" size={20} color={colors.primary} style={{ marginRight: 16 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteAlarm(item.id)}>
          <Ionicons name="trash" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={alarms}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={<Text style={styles.headerTitle}>Daily Alarms</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>No alarms added.</Text>}
      />
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditAlarm')}
      >
        <Ionicons name="add" size={32} color={isDark ? '#000000' : '#FFFFFF'} />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = ({ colors, typography, spacing, borderRadius, isDark }) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: spacing.lg, color: colors.text },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  alarmCard: { marginBottom: spacing.md },
  alarmHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  alarmTime: { fontSize: 32, fontWeight: 'bold', color: colors.text },
  alarmName: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 },
  alarmDate: { fontSize: 14, color: colors.primary, marginBottom: 4, fontWeight: '500' },
  alarmDesc: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  fab: {
    position: 'absolute', bottom: 100, right: 24,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8
  }
});
