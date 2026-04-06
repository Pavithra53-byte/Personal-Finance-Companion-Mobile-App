import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Input from './Input';
import { useAppTheme } from '../theme/theme';

export default function AlarmModal({ visible, onClose, onSave, initialAlarm }) {
  const { colors, spacing, borderRadius } = useAppTheme();
  const styles = getStyles({ colors, spacing, borderRadius });

  const [name, setName] = useState(initialAlarm?.name || '');
  const [description, setDescription] = useState(initialAlarm?.description || '');
  const [hour, setHour] = useState(initialAlarm?.time ? initialAlarm.time.split(':')[0] : '08');
  const [minute, setMinute] = useState(initialAlarm?.time ? initialAlarm.time.split(':')[1] : '00');
  
  const handleSave = () => {
    if (!name) return;
    onSave({
      id: initialAlarm?.id,
      name,
      description,
      time: `${hour}:${minute}`,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{initialAlarm ? 'Edit Alarm' : 'New Alarm'}</Text>
          
          <Input 
            label="Alarm Name" 
            placeholder="e.g. Log Daily Expenses"
            value={name}
            onChangeText={setName}
          />
          <View style={{height: 16}} />
          <Input 
            label="Short Description" 
            placeholder="e.g. Save receipt details"
            value={description}
            onChangeText={setDescription}
          />
          
          <View style={styles.timeContainer}>
            <Text style={styles.label}>Time</Text>
            <View style={styles.timePickers}>
              <View style={[styles.pickerWrapper, styles.halfPicker]}>
                <Picker
                  selectedValue={hour}
                  onValueChange={setHour}
                  style={styles.picker}
                >
                  {Array.from({length: 24}).map((_, i) => {
                    const val = i.toString().padStart(2, '0');
                    return <Picker.Item key={val} label={val} value={val} />;
                  })}
                </Picker>
              </View>
              <Text style={styles.colon}>:</Text>
              <View style={[styles.pickerWrapper, styles.halfPicker]}>
                <Picker
                  selectedValue={minute}
                  onValueChange={setMinute}
                  style={styles.picker}
                >
                  {['00', '15', '30', '45'].map(val => (
                    <Picker.Item key={val} label={val} value={val} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = ({ colors, spacing, borderRadius }) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timeContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  timePickers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerWrapper: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  halfPicker: {
    flex: 0.4,
  },
  colon: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 12,
    color: colors.text,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveText: {
    color: colors.background,
    fontWeight: 'bold',
  }
});
