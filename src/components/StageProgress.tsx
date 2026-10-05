import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { STAGES } from '../data/agents';
import { StageId } from '../types';
import { colors, radii, shadows, spacing, stageColors, typography } from '../theme';
import { GlassPanel } from '../ui/GlassPanel';

interface Props {
  stage: StageId;
  stageIndex: number;
  progress: number;
  productName: string;
}

export function StageProgress({ stage, stageIndex, progress, productName }: Props) {
  const label =
    stage === 'complete' ? 'Session complete' : STAGES[stageIndex]?.label ?? 'In progress';
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(100, Math.max(0, progress)), {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <GlassPanel style={styles.wrap} accent={colors.accent} glow padded={false}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>MISSION CONTROL</Text>
          <Text style={styles.title} numberOfLines={1}>
            {productName}
          </Text>
        </View>
        <View style={styles.pctBox}>
          <Text style={styles.pct}>{Math.round(progress)}%</Text>
          <Text style={styles.pctLabel}>{label}</Text>
        </View>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fillHost, fillStyle]}>
          <LinearGradient
            colors={[colors.accentHot, colors.accent, colors.cyan]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>

      <View style={styles.stages}>
        {STAGES.map((s, i) => {
          const done = i < stageIndex || stage === 'complete';
          const active = i === stageIndex && stage !== 'complete';
          const tint = stageColors[i];
          return (
            <View
              key={s.id}
              style={[
                styles.stageItem,
                active && {
                  borderColor: `${tint}66`,
                  backgroundColor: `${tint}14`,
                  ...shadows.glow(tint),
                },
                done && !active && { borderColor: `${tint}33` },
              ]}
            >
              <View
                style={[
                  styles.stageDot,
                  {
                    backgroundColor: done || active ? tint : colors.borderSubtle,
                  },
                ]}
              />
              <Text
                style={[
                  styles.stageLabel,
                  { color: done || active ? colors.textSecondary : colors.textDim },
                ]}
                numberOfLines={1}
              >
                {s.short} {s.label}
              </Text>
            </View>
          );
        })}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.section,
    color: colors.accent,
    marginBottom: 6,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  pctBox: {
    alignItems: 'flex-end',
  },
  pct: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  pctLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  fillHost: {
    height: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  stages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.bgElevated,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  stageDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
