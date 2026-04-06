import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      themePreference: 'dark', // 'light' or 'dark'
      savingsGoal: {
        target: 5000,
        current: 1250,
      },
      monthlyBudget: 10000,
      currency: '$',
      reminder: { enabled: false, time: '20:00' }, // 24-hr format HH:MM
      
      userProfile: { firstName: '' },
      upcomingBills: [], // { id, title, amount, date, time }
      alarms: [], // { id, name, time, description, enabled }

      setCurrency: (currency) => set({ currency }),
      setMonthlyBudget: (monthlyBudget) => set({ monthlyBudget }),
      setThemePreference: (themePreference) => set({ themePreference }),
      setReminder: (reminder) => set((state) => ({ reminder: { ...state.reminder, ...reminder } })),
      setFirstName: (firstName) => set((state) => ({ userProfile: { ...state.userProfile, firstName } })),
      
      addBillReminder: (bill) => set((state) => ({
        upcomingBills: [...state.upcomingBills, { ...bill, id: Date.now().toString() }]
      })),
      deleteBillReminder: (id) => set((state) => ({
        upcomingBills: state.upcomingBills.filter(b => b.id !== id)
      })),

      addAlarm: (alarm) => set((state) => ({
        alarms: [...state.alarms, { ...alarm, id: Date.now().toString(), enabled: true }]
      })),
      updateAlarm: (updated) => set((state) => ({
        alarms: state.alarms.map(a => a.id === updated.id ? updated : a)
      })),
      deleteAlarm: (id) => set((state) => ({
        alarms: state.alarms.filter(a => a.id !== id)
      })),

      addTransaction: (transaction) => set((state) => ({
        transactions: [{ ...transaction, id: Date.now().toString() }, ...state.transactions]
      })),

      updateTransaction: (updatedTransaction) => set((state) => ({
        transactions: state.transactions.map((t) => 
          t.id === updatedTransaction.id ? updatedTransaction : t
        )
      })),

      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id)
      })),

      updateSavingsGoal: (target) => set((state) => ({
        savingsGoal: { ...state.savingsGoal, target }
      })),

      // Computed properties
      getTotalIncome: () => {
        return get().transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
      },

      getTotalExpenses: () => {
        return get().transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);
      },

      getCurrentBalance: () => {
        return get().getTotalIncome() - get().getTotalExpenses();
      },

      getSpendingStreak: () => {
        const transactions = get().transactions;
        const dailyLimit = get().monthlyBudget / 30; // approx daily pace
        
        let streak = 0;
        let d = new Date();
        
        for (let i = 0; i < 30; i++) {
          const dateStr = d.toISOString().split('T')[0];
          const daysExps = transactions
            .filter(t => t.type === 'expense' && t.date === dateStr)
            .reduce((sum, t) => sum + Number(t.amount), 0);
            
          if (daysExps <= dailyLimit) {
            streak++;
          } else {
            break;
          }
          d.setDate(d.getDate() - 1);
        }
        return streak;
      },

      getWeeklySummary: () => {
        const transactions = get().transactions;
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const last7Str = oneWeekAgo.toISOString().split('T')[0];
        const last14Str = twoWeeksAgo.toISOString().split('T')[0];

        const thisWeek = transactions.filter(t => t.type === 'expense' && t.date >= last7Str);
        const lastWeek = transactions.filter(t => t.type === 'expense' && t.date >= last14Str && t.date < last7Str);

        const thisWeekTotal = thisWeek.reduce((sum, t) => sum + Number(t.amount), 0);
        const lastWeekTotal = lastWeek.reduce((sum, t) => sum + Number(t.amount), 0);

        let percentage = 0;
        let trend = 'same';
        if (lastWeekTotal > 0) {
           percentage = Math.abs((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
           trend = thisWeekTotal > lastWeekTotal ? 'up' : 'down';
        } else if (thisWeekTotal > 0) {
           percentage = 100;
           trend = 'up';
        }

        return {
           spent: thisWeekTotal,
           count: thisWeek.length,
           percentage: percentage.toFixed(0),
           trend
        };
      },

      getTransactionsByDate: () => {
        const grouped = get().transactions.reduce((acc, t) => {
          const date = t.date;
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(t);
          return acc;
        }, {});
        
        // Convert to array format for SectionList
        return Object.keys(grouped)
          .sort((a, b) => new Date(b) - new Date(a))
          .map(date => ({
            title: date,
            data: grouped[date]
          }));
      }
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
