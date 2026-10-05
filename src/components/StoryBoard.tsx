import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { UserStory, StoryStatus } from '../types';
import { colors, radii, spacing, typography } from '../theme';
import { StoryCard } from './StoryCard';

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
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>STORY BOARD</Text>
        <Text style={styles.count}>{stories.length} stories</Text>
      </View>
      {stories.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Stories forming…</Text>
          <Text style={styles.emptyBody}>
            The team is still in discovery. Cards will appear as breakdown starts.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {COLUMNS.map((col) => (
            <View key={col.id} style={[styles.column, { width: colWidth }]}>
              <View style={styles.colHeader}>
                <View style={[styles.dot, { backgroundColor: col.tint }]} />
                <Text style={styles.colLabel}>{col.label}</Text>
                <View style={styles.colCount}>
                  <Text style={styles.colCountText}>{grouped[col.id].length}</Text>
                </View>
              </View>
              {grouped[col.id].map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
              {grouped[col.id].length === 0 ? (
                <View style={styles.colEmpty}>
                  <Text style={styles.colEmptyText}>—</Text>
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
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
  },
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
  count: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  row: {
    gap: spacing.md,
    paddingBottom: 4,
  },
  column: {
    backgroundColor: colors.bg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.sm,
    minHeight: 160,
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
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    flex: 1,
  },
  colCount: {
    backgroundColor: colors.surfaceHover,
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  colCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  colEmpty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  colEmptyText: {
    color: colors.textDim,
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
