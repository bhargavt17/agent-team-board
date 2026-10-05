import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { getAgent } from '../data/agents';
import { UserStory } from '../types';
import { colors, radii, roleColors, shadows, spacing, typography } from '../theme';

interface Props {
  story: UserStory;
  index?: number;
}

export function StoryCard({ story, index = 0 }: Props) {
  const agent = getAgent(story.assigneeId);
  const accent = roleColors[agent.role] ?? colors.accent;

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18)}
      entering={FadeInDown.delay(index * 40).springify().damping(16)}
      style={[styles.card, { borderColor: `${accent}28` }]}
    >
      <View style={[styles.glowEdge, { backgroundColor: accent }]} />
      <View style={styles.top}>
        <Text style={styles.key}>{story.key}</Text>
        <View style={[styles.points, { backgroundColor: `${accent}18`, borderColor: `${accent}33` }]}>
          <Text style={[styles.pointsText, { color: accent }]}>{story.points} pts</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={3}>
        {story.title}
      </Text>
      <View style={styles.footer}>
        <View style={[styles.assignee, { backgroundColor: `${accent}22`, borderColor: `${accent}44` }]}>
          <Text style={[styles.assigneeText, { color: accent }]}>{agent.initials}</Text>
        </View>
        <Text style={styles.assigneeName} numberOfLines={1}>
          {agent.name.split(' ')[0]}
        </Text>
      </View>
      {story.acceptanceCriteria.length > 0 ? (
        <Text style={styles.ac} numberOfLines={2}>
          AC · {story.acceptanceCriteria[0]}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.soft,
  },
  glowEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    opacity: 0.7,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  key: {
    ...typography.mono,
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  points: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 18,
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  assignee: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  assigneeName: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  ac: {
    fontSize: 11,
    color: colors.textDim,
    lineHeight: 15,
  },
});
