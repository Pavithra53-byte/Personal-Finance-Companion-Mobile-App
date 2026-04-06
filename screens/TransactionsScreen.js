import React, { useState } from 'react';
import { View, Text, SectionList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useFinanceStore } from '../state/useFinanceStore';
import { useAppTheme } from '../theme/theme';
import TransactionItem from '../components/TransactionItem';

export default function TransactionsScreen({ route, navigation }) {
  const { colors, spacing, borderRadius } = useAppTheme();
  const styles = getStyles({ colors, spacing, borderRadius });
  const { filterDate, filterLabel } = route?.params || {};
  const { getTransactionsByDate } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState('');

  // This structure is [{ title: 'YYYY-MM-DD', data: [...] }]
  const sections = getTransactionsByDate();

  // Filter by date if navigated from Insights
  let activeSections = sections;
  if (filterDate) {
    activeSections = sections.filter(section => section.title === filterDate);
  }

  // Filter based on search query (notes, category)
  const filteredSections = activeSections.map(section => ({
    title: section.title,
    data: section.data.filter(tx => 
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(section => section.data.length > 0);

  const formatDate = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {filterDate ? (
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Transactions: {filterLabel || formatDate(filterDate)}</Text>
          <TouchableOpacity onPress={() => navigation.setParams({ filterDate: undefined, filterLabel: undefined })}>
            <Text style={styles.clearFilter}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes or category..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      <SectionList
        sections={filteredSections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem 
            transaction={item} 
            onPress={() => navigation.navigate('AddEditTransaction', { transaction: item })}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{formatDate(title)}</Text>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        )}
      />

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

const getStyles = ({ colors, spacing, borderRadius }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterHeader: {
    padding: spacing.lg,
    backgroundColor: colors.primaryLight + '20',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  clearFilter: {
    color: colors.primary,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
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
