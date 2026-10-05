import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { getAgent } from '../data/agents';
import { ActivityItem } from '../types';
import { colors, radii, roleColors, spacing, typography } from '../theme';
import { GlassPanel } from '../ui/GlassPanel';
import { ThinkingShimmer } from '../ui/ThinkingShimmer';

interface Props {
  items: ActivityItem[];
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function ActivityFeed({ items }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const prevLen = useRef(items.length);

  useEffect(() => {
    if (items.length > prevLen.current) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
    prevLen.current = items.length;
  }, [items.length]);

  return (
    <GlassPanel style={styles.wrap} padded={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LIVE ACTIVITY</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>STREAM</Text>
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <Text style={styles.empty}>Waiting for the first signal…</Text>
        ) : (
          items.map((item, index) => {
            const isSystem = item.agentId === 'system';
            const agent = isSystem ? null : getAgent(item.agentId);
            const accent = agent ? roleColors[agent.role] : colors.textMuted;
            const streaming = item.message === '…' || item.message.endsWith('…');
            return (
              <Animated.View
                key={item.id}
                entering={
                  index === 0
                    ? FadeInDown.springify().damping(16)
                    : FadeInRight.delay(20).springify().damping(18)
                }
                style={styles.row}
              >
                <View style={[styles.rail, { backgroundColor: accent }]} />
                <View style={styles.body}>
                  <View style={styles.top}>
                    <Text style={[styles.who, { color: accent }]}>
                      {isSystem ? 'SYSTEM' : agent?.name}
                    </Text>
                    <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
                  </View>
                  {streaming && !isSystem ? (
                    <View style={styles.shimmerRow}>
                      <ThinkingShimmer color={accent} />
                    </View>
                  ) : (
                    <Text style={styles.message}>{item.message}</Text>
                  )}
                  {!isSystem && agent ? (
                    <Text style={styles.role}>{agent.title}</Text>
                  ) : null}
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 280,
    maxHeight: 520,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  eyebrow: {
    ...typography.section,
    color: colors.textMuted,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.success,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
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
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  time: {
    ...typography.mono,
    color: colors.textDim,
    opacity: 0.75,
  },
  message: {
    ...typography.body,
    color: colors.text,
    lineHeight: 21,
  },
  shimmerRow: {
    marginVertical: 4,
  },
  role: {
    marginTop: 4,
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
});
