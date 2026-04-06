import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../state/useFinanceStore';
import { useAppTheme } from '../theme/theme';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { scheduleSpecificReminder } from '../utils/notifications';

export default function BillsScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const styles = getStyles({ colors, typography, spacing, borderRadius });
  const { upcomingBills, addBillReminder, deleteBillReminder, currency } = useFinanceStore();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Web fallback text state
  const [webDateStr, setWebDateStr] = useState(new Date().toISOString().split('T')[0]);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleAddBill = async () => {
    if (!title) {
      Alert.alert("Missing Info", "Please enter a bill title (e.g., Rent).");
      return;
    }
    
    let finalDate = date;
    if (Platform.OS === 'web') {
      const parts = webDateStr.split('-');
      if (parts.length === 3) {
        finalDate = new Date(parts[0], parts[1]-1, parts[2], 9, 0, 0); // Default to 9 AM on chosen day
      }
    }

    const bill = {
      title,
      amount: amount || '0.00',
      date: finalDate.toISOString(),
      isPaid: false
    };

    addBillReminder(bill);
    await scheduleSpecificReminder(`Bill Reminder: ${title}`, `Don't forget to pay ${currency}${bill.amount}!`, finalDate);
    
    setTitle('');
    setAmount('');
    Alert.alert("Scheduled", "Your bill reminder is set!");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Upcoming Bills</Text>
      
      {/* Form Card */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Add New Bill</Text>
        <Input label="Bill Title" placeholder="e.g. Water Bill, Rent" value={title} onChangeText={setTitle} />
        <Input label="Amount (Optional)" placeholder="0.00" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
        
        {Platform.OS === 'web' ? (
          <Input label="Due Date (YYYY-MM-DD)" placeholder="YYYY-MM-DD" value={webDateStr} onChangeText={setWebDateStr} />
        ) : (
          <View style={styles.datePickerContainer}>
             <Text style={styles.label}>Due Date</Text>
             <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
             </TouchableOpacity>
             {showPicker && (
                <DateTimePicker 
                  value={date} 
                  mode="datetime" 
                  display="default" 
                  onChange={handleDateChange} 
                />
             )}
          </View>
        )}
        
        <Button title="Schedule Reminder" onPress={handleAddBill} style={{ marginTop: spacing.md }} />
      </Card>

      {/* List Card */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Scheduled Bills</Text>
      {upcomingBills.length > 0 ? (
        upcomingBills.map(bill => {
           const billDate = new Date(bill.date);
           return (
             <Card key={bill.id} style={styles.billItem}>
               <View style={styles.billLeft}>
                 <View style={styles.iconContainer}>
                   <Ionicons name="receipt-outline" size={24} color={colors.primary} />
                 </View>
                 <View>
                   <Text style={styles.billTitle}>{bill.title}</Text>
                   <Text style={styles.billDate}>
                     {billDate.toLocaleDateString()} at {billDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </Text>
                 </View>
               </View>
               <View style={styles.billRight}>
                 {Number(bill.amount) > 0 && <Text style={styles.billAmount}>{currency}{Number(bill.amount).toFixed(2)}</Text>}
                 <TouchableOpacity onPress={() => deleteBillReminder(bill.id)} style={styles.deleteBtn}>
                   <Ionicons name="trash-outline" size={20} color={colors.danger} />
                 </TouchableOpacity>
               </View>
             </Card>
           );
        })
      ) : (
        <Text style={styles.emptyText}>No upcoming bills scheduled.</Text>
      )}
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const getStyles = ({ colors, typography, spacing, borderRadius }) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: spacing.lg, color: colors.text },
  formCard: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: spacing.md, color: colors.text },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  datePickerContainer: { marginBottom: spacing.md },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 14 },
  dateText: { fontSize: 16, color: colors.text, marginLeft: 10 },
  billItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  billLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  billTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  billDate: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  billRight: { flexDirection: 'row', alignItems: 'center' },
  billAmount: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginRight: spacing.md },
  deleteBtn: { padding: 4 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl }
});
