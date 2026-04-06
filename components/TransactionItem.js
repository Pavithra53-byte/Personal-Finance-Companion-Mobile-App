import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/theme';
import { useFinanceStore } from '../state/useFinanceStore';

export const getCategoryIcon = (category) => {
  const map = {
    'Food': 'restaurant-outline',
    'Transport': 'car-outline',
    'Entertainment': 'film-outline',
    'Housing': 'home-outline',
    'Salary': 'cash-outline',
    'Shopping': 'cart-outline',
  };
  return map[category] || 'ellipsis-horizontal-outline';
};

export default function TransactionItem({ transaction, onPress }) {
  const { currency } = useFinanceStore();
  const { colors, spacing, borderRadius, isDark } = useAppTheme();
  
  const isIncome = transaction.type === 'income';
  const prefix = isIncome ? '+' : '-';
  const amountColor = isIncome ? colors.income : colors.text;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 3,
      elevation: 1,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    details: {
      flex: 1,
      justifyContent: 'center',
    },
    category: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    notes: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    amountContainer: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    amount: {
      fontSize: 16,
      fontWeight: 'bold',
    }
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={getCategoryIcon(transaction.category)} size={24} color={colors.textSecondary} />
      </View>
      <View style={styles.details}>
        <Text style={styles.category}>{transaction.category}</Text>
        {transaction.notes ? (
          <Text style={styles.notes} numberOfLines={1}>{transaction.notes}</Text>
        ) : null}
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {prefix}{currency}{Number(transaction.amount).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
