import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, shadows } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: string;
  padded?: boolean;
  glow?: boolean;
}

export function GlassPanel({
  children,
  style,
  accent,
  padded = true,
  glow = false,
}: Props) {
  const borderColor = accent ? `${accent}33` : colors.surfaceBorder;
  return (
    <View
      style={[
        styles.wrap,
        glow ? shadows.glow(accent ?? colors.accent) : shadows.card,
        { borderColor },
        padded && styles.padded,
        style,
      ]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.045)', 'rgba(255,255,255,0.01)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {accent ? <View style={[styles.accentEdge, { backgroundColor: accent }]} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padded: {
    padding: 16,
  },
  accentEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2.5,
    opacity: 0.85,
  },
});
