import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFinanceStore } from '../state/useFinanceStore';
import { useAppTheme } from '../theme/theme';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import TransactionItem from '../components/TransactionItem';
import { getQuoteOfTheDay } from '../utils/quotes';

export default function HomeScreen({ navigation }) {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const styles = getStyles({ colors, typography, spacing, borderRadius });
  const { 
    getCurrentBalance, 
    getTotalIncome, 
    getTotalExpenses, 
    savingsGoal,
    monthlyBudget,
    getSpendingStreak,
    getWeeklySummary,
    upcomingBills,
    transactions,
    currency,
    userProfile
  } = useFinanceStore();

  const balance = getCurrentBalance();
  const income = getTotalIncome();
  const expense = getTotalExpenses();

  const savingsProgress = Math.min(savingsGoal.current / savingsGoal.target, 1);
  const recentTransactions = transactions.slice(0, 5);
  
  const streak = getSpendingStreak();
  const summary = getWeeklySummary();
  
  const thisMonthExpenses = React.useMemo(() => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const prefix = `${year}-${month}`;
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(prefix))
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const monthlyProgress = Math.min(thisMonthExpenses / monthlyBudget, 1);
  const budgetColor = monthlyProgress >= 1 ? '#d32f2f' : monthlyProgress >= 0.8 ? '#fbc02d' : '#388e3c';
  const getBudgetMessage = () => {
    if (monthlyProgress >= 1) return "🚨 You’ve exceeded your budget";
    if (monthlyProgress >= 0.8) return "⚠️ You’re close to your monthly limit";
    return "✅ Keep up the good work";
  };

  const upcomingBillsList = React.useMemo(() => {
    if (!upcomingBills) return [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const limitDays = new Date();
    limitDays.setDate(today.getDate() + 5);
    
    return upcomingBills.filter(b => {
      const bDate = new Date(b.date);
      return bDate >= today && bDate <= limitDays;
    }).sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [upcomingBills]);

  const getDayDiffText = (dateStr) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const bDate = new Date(dateStr);
    bDate.setHours(0,0,0,0);
    const diffTime = bDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  const personalizedQuote = React.useMemo(() => getQuoteOfTheDay(userProfile?.firstName), [userProfile?.firstName]);
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Personalized Greeting */}
      <View style={styles.quoteContainer}>
        <Text style={styles.greetingText}>
          {userProfile?.firstName ? `${greetingTime}, ${userProfile.firstName} 👋` : `${greetingTime} 👋`}
        </Text>
        <Text style={styles.quoteText}>{personalizedQuote}</Text>
      </View>

      <View style={styles.topGrid}>
        <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.balanceLabel, { color: colors.background }]}>Total Balance</Text>
          <Text style={[styles.balanceAmount, { color: colors.background }]}>{currency}{balance.toFixed(0)}</Text>
        </Card>
        
        <View style={styles.rightStacked}>
          <Card style={[styles.smallCard, { backgroundColor: colors.surface, marginBottom: spacing.md }]}>
            <Text style={[styles.smallCardLabel, { color: colors.textSecondary }]}>Income</Text>
            <Text style={[styles.smallCardValue, { color: colors.text }]}>+{currency}{income.toFixed(0)}</Text>
          </Card>
          <Card style={[styles.smallCard, { backgroundColor: colors.warning }]}>
            <Text style={[styles.smallCardLabel, { color: colors.background }]}>Expenses</Text>
            <Text style={[styles.smallCardValue, { color: colors.background }]}>-{currency}{expense.toFixed(0)}</Text>
          </Card>
        </View>
      </View>

      {/* Spending Streak */}
      {streak > 0 && (
        <Card style={[styles.streakCard, { borderColor: budgetColor }]}>
          <Text style={styles.streakTitle}>🔥 {streak} {streak === 1 ? 'Day' : 'Days'} of Smart Spending</Text>
          <Text style={styles.streakMessage}>
            {streak >= 3 ? "Great consistency! Keep it going 💰" : "You’re building strong financial habits"}
          </Text>
        </Card>
      )}

      {/* Monthly Spending Threshold */}
      <Card style={{ marginBottom: spacing.lg }}>
        <View style={styles.goalHeader}>
          <Text style={styles.sectionTitle}>Monthly Budget</Text>
          <Text style={[styles.goalFraction, { color: budgetColor }]}>
            {currency}{thisMonthExpenses.toFixed(0)} / {currency}{monthlyBudget} ({(monthlyProgress * 100).toFixed(0)}%)
          </Text>
        </View>
        <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden' }}>
          <View style={{ width: `${monthlyProgress * 100}%`, height: '100%', backgroundColor: budgetColor }} />
        </View>
        <Text style={[styles.goalRemaining, { color: colors.textSecondary }]}>
          {getBudgetMessage()}
        </Text>
      </Card>

      {/* Upcoming Bills */}
      {upcomingBillsList.length > 0 && (
        <Card style={styles.billsCard}>
          <Text style={styles.sectionTitle}>Upcoming Bills ⚠️</Text>
          {upcomingBillsList.map((bill, index) => (
            <View key={bill.id || index} style={styles.billItem}>
              <Text style={styles.billTitle}>• {bill.title || 'Bill'}</Text>
              <Text style={styles.billDue}>– {getDayDiffText(bill.date)}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Smart Weekly Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <Text style={styles.summaryText}>You spent {currency}{summary.spent.toFixed(0)} across {summary.count} transactions</Text>
        <Text style={[styles.summaryTrend, { color: summary.trend === 'up' ? '#d32f2f' : summary.trend === 'down' ? '#388e3c' : colors.textSecondary }]}>
          {summary.trend === 'up' ? '↑' : summary.trend === 'down' ? '↓' : ''} {summary.trend === 'same' ? 'Spending unchanged from last week' : `${summary.percentage}% compared to last week ${summary.trend === 'up' ? '⚠️' : '📉'}`}
        </Text>
      </Card>

      {/* Savings Goal Progress */}
      <Card>
        <View style={styles.goalHeader}>
          <Text style={styles.sectionTitle}>Savings Goal</Text>
          <Text style={styles.goalFraction}>
            {currency}{savingsGoal.current} / {currency}{savingsGoal.target}
          </Text>
        </View>
        <ProgressBar progress={savingsProgress} />
        <Text style={styles.goalRemaining}>
          {currency}{Math.max(savingsGoal.target - savingsGoal.current, 0).toFixed(2)} left to reach your goal
        </Text>
      </Card>

      {/* Recent Transactions */}
      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Recent</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {recentTransactions.length > 0 ? (
        recentTransactions.map(tx => (
          <TransactionItem 
            key={tx.id} 
            transaction={tx} 
            onPress={() => navigation.navigate('AddEditTransaction', { transaction: tx })}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubText}>Start by adding your first entry below!</Text>
        </View>
      )}

        {/* Floating Action Button - Fake placement for home screen to match design demands */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditTransaction')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
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
  quoteContainer: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  quoteText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  topGrid: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'stretch',
  },
  balanceCard: {
    flex: 1,
    marginRight: spacing.md,
    marginBottom: 0,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  rightStacked: {
    flex: 1,
    justifyContent: 'space-between',
  },
  smallCard: {
    flex: 1,
    padding: spacing.md,
    marginBottom: 0,
    justifyContent: 'center',
  },
  smallCardLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  smallCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  goalFraction: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  goalRemaining: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  streakCard: {
    borderWidth: 1.5,
    marginBottom: spacing.lg,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  streakMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  billsCard: {
    marginBottom: spacing.lg,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  billDue: {
    fontSize: 14,
    color: colors.warning || '#fbc02d',
    fontWeight: 'bold',
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 6,
  },
  summaryTrend: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  seeAll: {
    color: colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 104,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 32,
    color: colors.background,
    lineHeight: 34,
  }
});
