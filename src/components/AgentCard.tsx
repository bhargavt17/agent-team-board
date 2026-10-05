import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AgentDef, AgentState } from '../types';
import { colors, radii, roleColors, shadows, spacing, statusColors, typography } from '../theme';
import { PulseDot } from './PulseDot';
import { ThinkingShimmer } from '../ui/ThinkingShimmer';

interface Props {
  agent: AgentDef;
  state: AgentState;
  index?: number;
  compact?: boolean;
}

export function AgentCard({ agent, state, index = 0, compact }: Props) {
  const accent = roleColors[agent.role] ?? colors.accent;
  const statusColor = statusColors[state.status] ?? colors.textMuted;
  const isActive = state.status !== 'Idle';
  const isThinking =
    state.status === 'Thinking' || state.status === 'Writing' || state.status === 'Speaking';

  return (
    <Animated.View
      entering={FadeInDown.delay(80 + index * 70).springify().damping(15)}
      style={[
        styles.card,
        compact && styles.cardCompact,
        isActive && { borderColor: `${accent}55`, ...shadows.glow(accent) },
      ]}
    >
      <LinearGradient
        colors={[`${accent}18`, 'rgba(255,255,255,0.02)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          {isActive ? (
            <View style={[styles.avatarRing, { borderColor: `${accent}66` }]} />
          ) : null}
          <View
            style={[
              styles.avatar,
              { backgroundColor: `${accent}22`, borderColor: `${accent}66` },
            ]}
          >
            <Text style={[styles.initials, { color: accent }]}>{agent.initials}</Text>
          </View>
        </View>
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {agent.name}
          </Text>
          <Text style={styles.tagline} numberOfLines={1}>
            {agent.tagline}
          </Text>
          <View style={styles.roleRow}>
            <View style={[styles.badge, { backgroundColor: `${accent}22`, borderColor: `${accent}44` }]}>
              <Text style={[styles.badgeText, { color: accent }]}>{agent.badge}</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {agent.title}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statusRow}>
        <PulseDot color={statusColor} active={isActive} size={7} ring={isActive} />
        <Text style={[styles.status, { color: statusColor }]}>{state.status}</Text>
      </View>

      {isThinking ? (
        <View style={styles.shimmerWrap}>
          <ThinkingShimmer color={accent} />
        </View>
      ) : (
        <Text style={styles.task} numberOfLines={2}>
          {state.currentTask}
        </Text>
      )}
      {isThinking ? (
        <Text style={styles.task} numberOfLines={2}>
          {state.currentTask}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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
  avatarWrap: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 15,
    borderWidth: 1,
    opacity: 0.9,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
    marginBottom: 1,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.25,
    color: colors.textDim,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  badgeText: {
    ...typography.badge,
  },
  title: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    marginLeft: -4,
  },
  status: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  shimmerWrap: {
    marginBottom: 8,
  },
  task: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
