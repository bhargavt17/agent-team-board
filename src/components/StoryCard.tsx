import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getAgent } from '../data/agents';
import { UserStory } from '../types';
import { colors, radii, roleColors, spacing, typography } from '../theme';

interface Props {
  story: UserStory;
}

export function StoryCard({ story }: Props) {
  const agent = getAgent(story.assigneeId);
  const accent = roleColors[agent.role] ?? colors.accent;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.key}>{story.key}</Text>
        <View style={styles.points}>
          <Text style={styles.pointsText}>{story.points} pts</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={3}>
        {story.title}
      </Text>
      <View style={styles.footer}>
        <View style={[styles.assignee, { backgroundColor: `${accent}22` }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  },
  points: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
    marginBottom: 8,
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
