import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFinanceStore } from '../state/useFinanceStore';
import { useAppTheme } from '../theme/theme';
import Card from '../components/Card';

export default function InsightsScreen({ navigation }) {
  const { colors, typography, spacing, borderRadius, isDark } = useAppTheme();
  const styles = getStyles({ colors, typography, spacing, borderRadius, isDark });
  const { transactions, currency } = useFinanceStore();

  // Calculate expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const categoryData = Object.keys(expensesByCategory).map((key, index) => {
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6'];
    return {
      value: expensesByCategory[key],
      text: key,
      color: colors[index % colors.length]
    };
  }).sort((a,b) => b.value - a.value);

  const highestCategory = categoryData.length > 0 ? categoryData[0] : null;
  const totalExpensesSum = categoryData.reduce((sum, item) => sum + item.value, 0);

  // Last 7 days trend
  const barData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const dayExpense = transactions
      .filter(t => t.type === 'expense' && t.date === dateStr)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    barData.push({
      dateStr: dateStr,
      value: dayExpense,
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
    });
  }

  const maxBarValue = Math.max(...barData.map(d => d.value), 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Spending Insights</Text>
      
      {highestCategory ? (
        <Card style={styles.highlightCard}>
          <Text style={styles.highlightLabel}>Highest Spending Category</Text>
          <Text style={styles.highlightValue}>{highestCategory.text}</Text>
          <Text style={styles.highlightAmount}>{currency}{highestCategory.value.toFixed(2)}</Text>
        </Card>
      ) : (
        <Card style={styles.highlightCard}>
          <Text style={styles.highlightLabel}>Not enough data</Text>
        </Card>
      )}

      {/* Custom Bar Chart built with Native Views */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Last 7 Days</Text>
        <View style={styles.barChartContainer}>
          {barData.map((data, index) => {
            const heightPercentage = (data.value / maxBarValue) * 100;
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.barWrapper}
                onPress={() => navigation.navigate('Transactions', { filterDate: data.dateStr, filterLabel: data.label })}
              >
                <Text style={styles.barValue} numberOfLines={1} adjustsFontSizeToFit>
                  {currency}{Math.round(data.value)}
                </Text>
                <View style={styles.barPlaceholder}>
                  <View style={[styles.barFill, { height: `${heightPercentage}%` }]} />
                </View>
                <Text style={styles.barLabel}>{data.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Category Breakdown list with progress bars */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Category Breakdown</Text>
        {categoryData.length > 0 ? (
          <View style={styles.breakdownList}>
            {categoryData.map((item, idx) => {
              const percentage = (item.value / totalExpensesSum) * 100;
              return (
                <View key={idx} style={styles.breakdownRow}>
                  <View style={styles.breakdownHeader}>
                    <View style={styles.breakdownHeaderLeft}>
                      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                      <Text style={styles.breakdownName}>{item.text}</Text>
                    </View>
                    <Text style={styles.breakdownPercentage}>{percentage.toFixed(0)}%</Text>
                  </View>
                  <View style={styles.breakdownTrack}>
                    <View style={[styles.breakdownFill, { width: `${percentage}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>Add some expenses to see the breakdown.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

const getStyles = ({ colors, typography, spacing, borderRadius, isDark }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    color: colors.text,
  },
  highlightCard: {
    backgroundColor: colors.primary,
  },
  highlightLabel: {
    color: isDark ? '#000000' : '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  highlightValue: {
    color: isDark ? '#000000' : '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  highlightAmount: {
    color: isDark ? '#000000' : '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  chartCard: {
    marginTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    color: colors.text,
  },
  barChartContainer: {
    flexDirection: 'row',
    height: 180,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 8,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barPlaceholder: {
    width: '70%',
    height: 120, // max bar height
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: colors.primaryLight,
    width: '100%',
    borderRadius: borderRadius.sm,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 6,
    height: 14,
  },
  barLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  breakdownList: {
    width: '100%',
  },
  breakdownRow: {
    marginBottom: spacing.md,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  breakdownName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  breakdownPercentage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  breakdownTrack: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  }
});
