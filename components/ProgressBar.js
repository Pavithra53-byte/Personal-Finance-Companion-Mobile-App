import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAppTheme } from '../theme/theme';

export default function ProgressBar({ progress, color }) {
  const { colors, borderRadius } = useAppTheme();
  
  // Constrain progress between 0 and 1
  const validProgress = Math.min(Math.max(progress, 0), 1);
  const barColor = color || colors.primary;

  const styles = StyleSheet.create({
    container: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      width: '100%',
    },
    fill: {
      height: '100%',
      borderRadius: borderRadius.full,
    }
  });

  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${validProgress * 100}%`, backgroundColor: barColor }]} />
    </View>
  );
}
