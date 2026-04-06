import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFinanceStore } from '../state/useFinanceStore';
import { useAppTheme } from '../theme/theme';
import Card from '../components/Card';
import Input from '../components/Input';
import AlarmModal from '../components/AlarmModal';
import { TouchableOpacity } from 'react-native';
import { setupDailyReminder } from '../utils/notifications';

const CURRENCIES = [
  { label: 'US Dollar ($)', value: '$' },
  { label: 'Euro (€)', value: '€' },
  { label: 'British Pound (£)', value: '£' },
  { label: 'Indian Rupee (₹)', value: '₹' },
  { label: 'Japanese Yen (¥)', value: '¥' }
];

export default function SettingsScreen() {
  const { currency, setCurrency, reminder, setReminder, userProfile, setFirstName, themePreference, setThemePreference, monthlyBudget, setMonthlyBudget, alarms, addAlarm, updateAlarm, deleteAlarm } = useFinanceStore();
  const { colors, spacing, borderRadius } = useAppTheme();
  const styles = getStyles({ colors, spacing, borderRadius });
  const [localTime, setLocalTime] = useState(reminder.time); // Legacy

  const [alarmModalVisible, setAlarmModalVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);

  const openAlarmModal = (alarm = null) => {
    setEditingAlarm(alarm);
    setAlarmModalVisible(true);
  };
  
  const handleSaveAlarm = (alarmData) => {
    if (alarmData.id) {
       updateAlarm(alarmData);
    } else {
       addAlarm(alarmData);
    }
  };

  const handleToggleAlarm = (alarm) => {
    updateAlarm({ ...alarm, enabled: !alarm.enabled });
  };

  const hour = localTime.split(':')[0];
  const minute = localTime.split(':')[1];

  const handleReminderToggle = async (val) => {
    setReminder({ enabled: val });
    if (val) {
      const success = await setupDailyReminder(localTime, true);
      if (!success) {
        Alert.alert("Permission Required", "Please enable notifications for this app in your device settings.");
        setReminder({ enabled: false });
      }
    } else {
      setupDailyReminder(localTime, false);
    }
  };

  const handleTimeChange = (newHour, newMinute) => {
    const newTime = `${newHour}:${newMinute}`;
    setLocalTime(newTime);
    setReminder({ time: newTime });
    if (reminder.enabled) {
      setupDailyReminder(newTime, true);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Settings</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Input 
          label="First Name" 
          placeholder="What should we call you?"
          value={userProfile?.firstName || ''}
          onChangeText={setFirstName}
        />
        <View style={{ marginTop: spacing.md }}>
          <Input 
            label="Monthly Budget" 
            placeholder="e.g. 10000"
            keyboardType="numeric"
            value={monthlyBudget ? monthlyBudget.toString() : ''}
            onChangeText={(val) => setMonthlyBudget(Number(val) || 0)}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>App Theme</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[styles.themeLabel, themePreference === 'light' && {color: colors.primary, fontWeight: 'bold'}]}>Light</Text>
            <Switch 
              value={themePreference === 'dark'} 
              onValueChange={(isDark) => setThemePreference(isDark ? 'dark' : 'light')} 
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={themePreference === 'dark' ? colors.primary : '#f4f3f4'}
              style={{marginHorizontal: 8}}
            />
            <Text style={[styles.themeLabel, themePreference === 'dark' && {color: colors.primary, fontWeight: 'bold'}]}>Dark</Text>
          </View>
        </View>

        <Text style={styles.label}>Default Currency</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={currency}
            onValueChange={(val) => setCurrency(val)}
            style={styles.picker}
          >
            {CURRENCIES.map(curr => (
              <Picker.Item key={curr.value} label={curr.label} value={curr.value} />
            ))}
          </Picker>
        </View>
        <Text style={styles.helperText}>All dashboard and transaction values will be displayed with this currency placeholder.</Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.sectionTitle}>Daily Alarms (Reminders)</Text>
            <Text style={styles.subtitle}>Set custom alarms for tracking.</Text>
          </View>
          <TouchableOpacity onPress={() => openAlarmModal()} style={{backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.sm}}>
             <Text style={{color: colors.background, fontWeight: 'bold'}}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {alarms && alarms.length > 0 ? (
          <View style={{marginTop: spacing.md}}>
            {alarms.map(alarm => (
              <View key={alarm.id} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm}}>
                <TouchableOpacity onPress={() => openAlarmModal(alarm)} style={{flex: 1}}>
                  <Text style={{fontSize: 18, fontWeight: 'bold', color: colors.text}}>{alarm.time}  <Text style={{fontSize: 14, fontWeight: '500'}}>{alarm.name}</Text></Text>
                  {alarm.description ? <Text style={{color: colors.textSecondary, fontSize: 12, marginTop: 4}}>{alarm.description}</Text> : null}
                </TouchableOpacity>
                <Switch 
                  value={alarm.enabled} 
                  onValueChange={() => handleToggleAlarm(alarm)}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={alarm.enabled ? colors.primary : '#f4f3f4'}
                />
              </View>
            ))}
          </View>
        ) : (
          <Text style={{color: colors.textSecondary, marginTop: spacing.md}}>No alarms set. Add one to stay gently reminded!</Text>
        )}
      </Card>
      
      {alarmModalVisible && (
        <AlarmModal 
          visible={alarmModalVisible}
          initialAlarm={editingAlarm}
          onClose={() => setAlarmModalVisible(false)}
          onSave={handleSaveAlarm}
        />
      )}

      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const getStyles = ({ colors, spacing, borderRadius }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    color: colors.text,
  },
  card: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  helperText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pickerWrapper: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  timeContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timePickers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  halfPicker: {
    flex: 0.4,
  },
  colon: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 12,
    paddingBottom: 4,
    color: colors.text,
  }
});
