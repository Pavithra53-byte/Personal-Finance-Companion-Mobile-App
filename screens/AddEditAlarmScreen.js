import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../state/useFinanceStore';
import { useAppTheme } from '../theme/theme';
import Input from '../components/Input';
import Button from '../components/Button';
import * as Notifications from 'expo-notifications';

export default function AddEditAlarmScreen({ route, navigation }) {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const styles = getStyles({ colors, typography, spacing, borderRadius });
  const { alarmId } = route.params || {};
  const { alarms, addAlarm, updateAlarm, deleteAlarm } = useFinanceStore();
  
  const existingAlarm = alarms.find(a => a.id === alarmId);
  const isEditing = !!existingAlarm;

  const [name, setName] = useState(existingAlarm?.name || '');
  const [date, setDate] = useState(existingAlarm?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(existingAlarm?.time || '08:00');
  const [description, setDescription] = useState(existingAlarm?.description || '');

  const [nameError, setNameError] = useState('');

  const scheduleNotificationLocal = async (alarmTitle, alarmDesc, alarmDate, alarmTime) => {
    try {
      const [year, month, day] = alarmDate.split('-').map(Number);
      const [hour, minute] = alarmTime.split(':').map(Number);
      const targetDate = new Date(year, month - 1, day, hour, minute);
      
      if (targetDate.getTime() > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: alarmTitle,
            body: alarmDesc || 'Time for your task!',
            sound: true,
          },
          trigger: targetDate,
        });
      }
    } catch (e) {
      console.log('Notification schedule error', e);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Please enter an alarm name');
      return;
    }

    const payload = {
      id: existingAlarm ? existingAlarm.id : undefined,
      name,
      date,
      time,
      description,
      enabled: existingAlarm ? existingAlarm.enabled : true,
    };

    if (isEditing) {
      updateAlarm(payload);
    } else {
      addAlarm(payload);
    }
    
    if (payload.enabled) {
      scheduleNotificationLocal(name, description, date, time);
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Alarm",
      "Are you sure you want to delete this alarm?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
             deleteAlarm(existingAlarm.id);
             navigation.goBack();
          } 
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.content}>
        
        <Input 
          label="Alarm Name" 
          placeholder="E.g. Pay Electricity Bill" 
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (nameError) setNameError('');
          }}
          error={nameError}
          autoFocus={!isEditing}
        />

        <Input 
          label="Date (YYYY-MM-DD)" 
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />
        
        <Input 
          label="Time (HH:MM) - 24hr format" 
          placeholder="08:00"
          value={time}
          onChangeText={setTime}
        />

        <Input 
          label="Short Description" 
          placeholder="Additional notes for the alarm"
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.btnContainer}>
          <Button 
            title={isEditing ? "Save Changes" : "Add Alarm"} 
            onPress={handleSave} 
            style={styles.saveBtn}
          />
          {isEditing && (
            <Button 
              title="Delete" 
              type="danger" 
              onPress={handleDelete} 
              style={styles.deleteBtn}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = ({ colors, typography, spacing, borderRadius }) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  btnContainer: { marginTop: spacing.xl },
  saveBtn: { marginBottom: spacing.md },
  deleteBtn: { backgroundColor: colors.danger }
});
