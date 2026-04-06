import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/theme';

export default function Input({ label, error, ...props }) {
  const { colors, typography, spacing, borderRadius } = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.caption.fontSize,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      fontWeight: '600',
    },
    input: {
      backgroundColor: colors.background, // Slightly inset color vs surface
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: typography.body.fontSize,
      color: colors.text,
      minHeight: 48,
    },
    inputError: {
      borderColor: colors.danger,
    },
    errorText: {
      color: colors.danger,
      fontSize: 12,
      marginTop: 4,
    }
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
