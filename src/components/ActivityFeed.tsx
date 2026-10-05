import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getAgent } from '../data/agents';
import { ActivityItem } from '../types';
import { colors, radii, roleColors, spacing, typography } from '../theme';

interface Props {
  items: ActivityItem[];
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function ActivityFeed({ items }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>LIVE ACTIVITY</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>Waiting for the first signal…</Text>
      ) : (
        items.map((item) => {
          const isSystem = item.agentId === 'system';
          const agent = isSystem ? null : getAgent(item.agentId);
          const accent = agent ? roleColors[agent.role] : colors.textMuted;
          return (
            <View key={item.id} style={styles.row}>
              <View style={[styles.rail, { backgroundColor: accent }]} />
              <View style={styles.body}>
                <View style={styles.top}>
                  <Text style={[styles.who, { color: accent }]}>
                    {isSystem ? 'SYSTEM' : agent?.name}
                  </Text>
                  <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
                </View>
                <Text style={styles.message}>{item.message}</Text>
                {!isSystem && agent ? (
                  <Text style={styles.role}>{agent.title}</Text>
                ) : null}
              </View>
            </View>
          );
        })
      )}
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
    gap: spacing.md,
  },
  eyebrow: {
    ...typography.section,
    color: colors.textMuted,
    marginBottom: 4,
  },
  empty: {
    ...typography.caption,
    color: colors.textMuted,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rail: {
    width: 3,
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 4,
  },
  body: {
    flex: 1,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  who: {
    fontSize: 13,
    fontWeight: '700',
  },
  time: {
    ...typography.mono,
    color: colors.textDim,
  },
  message: {
    ...typography.body,
    color: colors.text,
    lineHeight: 21,
  },
  role: {
    marginTop: 4,
    ...typography.caption,
    color: colors.textMuted,
  },
});
