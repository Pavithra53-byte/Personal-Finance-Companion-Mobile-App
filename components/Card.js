import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/theme';

export default function Card({ children, style }) {
  const { colors, borderRadius, spacing, isDark } = useAppTheme();
  
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: isDark ? 4 : 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: isDark ? 12 : 8,
      elevation: isDark ? 4 : 2,
      marginBottom: spacing.md,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
  });

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}
