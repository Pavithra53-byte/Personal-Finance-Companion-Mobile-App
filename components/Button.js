import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../theme/theme';

export default function Button({ title, onPress, type = 'primary', disabled = false, loading = false, style }) {
  const { colors, typography, spacing, borderRadius } = useAppTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    if (type === 'danger') return colors.danger;
    return type === 'primary' ? colors.primary : colors.background;
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    if (type === 'danger') return '#FFFFFF';
    return type === 'primary' ? colors.background : colors.primary;
  };

  const styles = StyleSheet.create({
    button: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
    },
    text: {
      fontSize: typography.h3.fontSize,
      fontWeight: 'bold',
    }
  });

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: getBackgroundColor() },
        style
      ]} 
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
