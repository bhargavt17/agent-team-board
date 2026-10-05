import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { UserStory, StoryStatus } from '../types';
import { colors, radii, spacing, typography } from '../theme';
import { StoryCard } from './StoryCard';
import { GlassPanel } from '../ui/GlassPanel';

const COLUMNS: { id: StoryStatus; label: string; tint: string }[] = [
  { id: 'backlog', label: 'Backlog', tint: '#6E7F9F' },
  { id: 'ready', label: 'Ready', tint: '#38BDF8' },
  { id: 'in_progress', label: 'In Progress', tint: '#A78BFA' },
  { id: 'review', label: 'Review', tint: '#FBBF24' },
  { id: 'done', label: 'Done', tint: '#34D399' },
];

interface Props {
  stories: UserStory[];
}

export function StoryBoard({ stories }: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const colWidth = isWide ? Math.max(170, Math.min(220, (width - 80) / 5)) : 200;

  const grouped = useMemo(() => {
    const map: Record<StoryStatus, UserStory[]> = {
      backlog: [],
      ready: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const s of stories) map[s.status].push(s);
    return map;
  }, [stories]);

  return (
    <GlassPanel style={styles.wrap} padded>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>STORY BOARD</Text>
        <View style={styles.countPill}>
          <Text style={styles.count}>{stories.length} stories</Text>
        </View>
      </View>
      {stories.length === 0 ? (
        <Animated.View entering={FadeIn} style={styles.empty}>
          <Text style={styles.emptyTitle}>Stories forming…</Text>
          <Text style={styles.emptyBody}>
            The team is still in discovery. Cards appear the moment Claude returns the backlog.
          </Text>
        </Animated.View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {COLUMNS.map((col) => (
            <Animated.View
              key={col.id}
              layout={LinearTransition.springify().damping(18)}
              style={[
                styles.column,
                {
                  width: colWidth,
                  borderColor: `${col.tint}28`,
                },
              ]}
            >
              <View style={styles.colHeader}>
                <View style={[styles.dot, { backgroundColor: col.tint }]} />
                <Text style={styles.colLabel}>{col.label}</Text>
                <View style={[styles.colCount, { backgroundColor: `${col.tint}18` }]}>
                  <Text style={[styles.colCountText, { color: col.tint }]}>
                    {grouped[col.id].length}
                  </Text>
                </View>
              </View>
              {grouped[col.id].map((story, i) => (
                <StoryCard key={`${story.id}-${story.status}`} story={story} index={i} />
              ))}
              {grouped[col.id].length === 0 ? (
                <View style={styles.colEmpty}>
                  <Text style={styles.colEmptyText}>Drop zone</Text>
                </View>
              ) : null}
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  eyebrow: {
    ...typography.section,
    color: colors.textMuted,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.borderGlow,
  },
  count: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  row: {
    gap: spacing.md,
    paddingBottom: 4,
  },
  column: {
    backgroundColor: 'rgba(3, 6, 15, 0.55)',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.sm,
    minHeight: 180,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  colLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    flex: 1,
    textTransform: 'uppercase',
  },
  colCount: {
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  colCountText: {
    fontSize: 10,
    fontWeight: '800',
  },
  colEmpty: {
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
  },
  colEmptyText: {
    color: colors.textDim,
    fontSize: 11,
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  empty: {
    paddingVertical: 28,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  emptyBody: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 320,
  },
});
