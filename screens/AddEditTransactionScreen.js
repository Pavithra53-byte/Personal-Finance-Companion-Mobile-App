import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFinanceStore } from '../state/useFinanceStore';
import { useAppTheme } from '../theme/theme';
import Input from '../components/Input';
import Button from '../components/Button';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Housing', 'Salary', 'Shopping', 'Other'];

export default function AddEditTransactionScreen({ route, navigation }) {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const styles = getStyles({ colors, typography, spacing, borderRadius });
  const { transaction } = route.params || {};
  const isEditing = !!transaction;
  
  const { addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();

  const [type, setType] = useState(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount || '');
  const [category, setCategory] = useState(transaction?.category || CATEGORIES[0]);
  const [notes, setNotes] = useState(transaction?.notes || '');
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);

  const [amountError, setAmountError] = useState('');

  const handleSave = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setAmountError('Please enter a valid amount');
      return;
    }

    const payload = {
      id: isEditing ? transaction.id : undefined,
      type,
      amount: parseFloat(amount).toFixed(2),
      category,
      notes,
      date
    };

    if (isEditing) {
      updateTransaction(payload);
    } else {
      addTransaction(payload);
    }
    
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteTransaction(transaction.id);
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
        
        {/* Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, type === 'expense' && styles.toggleActiveExpense]}
            onPress={() => setType('expense')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, type === 'expense' && styles.toggleTextActive]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, type === 'income' && styles.toggleActiveIncome]}
            onPress={() => setType('income')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, type === 'income' && styles.toggleTextActive]}>Income</Text>
          </TouchableOpacity>
        </View>

        <Input 
          label="Amount" 
          placeholder="0.00" 
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={(val) => {
            setAmount(val);
            if (amountError) setAmountError('');
          }}
          error={amountError}
          autoFocus={!isEditing}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Category</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              {CATEGORIES.map(cat => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        <Input 
          label="Date (YYYY-MM-DD)" 
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        <Input 
          label="Notes (Optional)" 
          placeholder="What was this for?"
          value={notes}
          onChangeText={setNotes}
        />

        <View style={styles.btnContainer}>
          <Button 
            title={isEditing ? "Save Changes" : "Add Transaction"} 
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  toggleActiveExpense: {
    backgroundColor: colors.expense,
  },
  toggleActiveIncome: {
    backgroundColor: colors.income,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.surface,
  },
  pickerContainer: {
    marginBottom: spacing.md,
  },
  pickerLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
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
  btnContainer: {
    marginTop: spacing.xl,
  },
  saveBtn: {
    marginBottom: spacing.md,
  },
  deleteBtn: {
    backgroundColor: colors.danger,
  }
});
