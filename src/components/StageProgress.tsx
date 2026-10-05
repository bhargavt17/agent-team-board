import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STAGES } from '../data/agents';
import { StageId } from '../types';
import { colors, radii, spacing, stageColors, typography } from '../theme';

interface Props {
  stage: StageId;
  stageIndex: number;
  progress: number;
  productName: string;
}

export function StageProgress({ stage, stageIndex, progress, productName }: Props) {
  const label =
    stage === 'complete' ? 'Session complete' : STAGES[stageIndex]?.label ?? 'In progress';

  return (
    <View style={styles.wrap}>
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
        <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress))}%` }]} />
      </View>

      <View style={styles.stages}>
        {STAGES.map((s, i) => {
          const done = i < stageIndex || stage === 'complete';
          const active = i === stageIndex && stage !== 'complete';
          const tint = stageColors[i];
          return (
            <View key={s.id} style={styles.stageItem}>
              <View
                style={[
                  styles.stageDot,
                  {
                    backgroundColor: done || active ? tint : colors.borderSubtle,
                    shadowColor: active ? tint : 'transparent',
                  },
                  active && styles.stageDotActive,
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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
    color: colors.textMuted,
    marginBottom: 4,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  pctBox: {
    alignItems: 'flex-end',
  },
  pct: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: -0.5,
  },
  pctLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accent,
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
    paddingVertical: 4,
    paddingHorizontal: 8,
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
  stageDotActive: {
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
