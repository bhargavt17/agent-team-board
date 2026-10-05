import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AgentDef, AgentState } from '../types';
import { colors, radii, roleColors, spacing, statusColors, typography } from '../theme';
import { PulseDot } from './PulseDot';

interface Props {
  agent: AgentDef;
  state: AgentState;
  compact?: boolean;
}

export function AgentCard({ agent, state, compact }: Props) {
  const accent = roleColors[agent.role] ?? colors.accent;
  const statusColor = statusColors[state.status] ?? colors.textMuted;
  const isActive = state.status !== 'Idle';

  return (
    <View style={[styles.card, compact && styles.cardCompact, { borderColor: colors.surfaceBorder }]}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: `${accent}22`, borderColor: `${accent}55` }]}>
          <Text style={[styles.initials, { color: accent }]}>{agent.initials}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {agent.name}
          </Text>
          <View style={styles.roleRow}>
            <View style={[styles.badge, { backgroundColor: `${accent}22` }]}>
              <Text style={[styles.badgeText, { color: accent }]}>{agent.badge}</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {agent.title}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statusRow}>
        <PulseDot color={statusColor} active={isActive} size={7} />
        <Text style={[styles.status, { color: statusColor }]}>{state.status}</Text>
      </View>

      <Text style={styles.task} numberOfLines={2}>
        {state.currentTask}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: 'hidden',
    minWidth: 200,
    flex: 1,
  },
  cardCompact: {
    minWidth: 180,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
    marginBottom: 2,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  task: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
