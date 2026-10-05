import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TEAM } from '../data/agents';
import { AgentCard } from '../components/AgentCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { StageProgress } from '../components/StageProgress';
import { StoryBoard } from '../components/StoryBoard';
import { SimulationEngine } from '../simulation/engine';
import { ProductBrief, SimulationState } from '../types';
import { colors, radii, spacing, typography } from '../theme';

interface Props {
  brief: ProductBrief;
  apiKey: string;
  onReset: () => void;
}

export function DashboardScreen({ brief, apiKey, onReset }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 960;
  const live = apiKey.trim().length > 0;

  const engine = useMemo(
    () => new SimulationEngine({ brief, apiKey }),
    [brief, apiKey],
  );
  const [state, setState] = useState<SimulationState>(engine.getState());

  useEffect(() => {
    const unsub = engine.subscribe(setState);
    engine.start();
    return () => {
      engine.stop();
      unsub();
    };
  }, [engine]);

  return (
    <LinearGradient colors={['#060912', '#08101C', '#0A1220']} style={styles.flex}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 28,
            paddingHorizontal: isWide ? 28 : spacing.lg,
          },
        ]}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>AGENT TEAM BOARD</Text>
            <Text style={styles.brandSub}>
              {state.running ? 'Live simulation' : 'Simulation complete'}
              {' · '}
              {live ? 'Claude Opus 5.5' : 'Scripted fallback'}
            </Text>
          </View>
          <Pressable onPress={onReset} style={styles.resetBtn}>
            <Text style={styles.resetText}>New brief</Text>
          </Pressable>
        </View>

        <StageProgress
          stage={state.stage}
          stageIndex={state.stageIndex}
          progress={state.progress}
          productName={brief.name}
        />

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>TEAM ROSTER</Text>
          <Text style={styles.sectionHint}>
            {TEAM.filter((a) => state.agents[a.id]?.status !== 'Idle').length} active
          </Text>
        </View>

        <View style={[styles.roster, isWide && styles.rosterWide]}>
          {TEAM.map((agent) => (
            <View
              key={agent.id}
              style={[styles.rosterItem, isWide ? styles.rosterItemWide : styles.rosterItemNarrow]}
            >
              <AgentCard agent={agent} state={state.agents[agent.id]} />
            </View>
          ))}
        </View>

        <View style={[styles.split, isWide && styles.splitWide]}>
          <View style={[styles.splitMain, isWide && { flex: 1.55 }]}>
            <StoryBoard stories={state.stories} />
          </View>
          <View style={[styles.splitSide, isWide && { flex: 1 }]}>
            <ActivityFeed items={state.activity} />
          </View>
        </View>

        <View style={styles.briefCard}>
          <Text style={styles.sectionTitle}>PRODUCT BRIEF</Text>
          <Text style={styles.briefName}>{brief.name}</Text>
          <Text style={styles.briefBody}>{brief.description}</Text>
          {brief.goals ? (
            <Text style={styles.briefMeta}>
              <Text style={styles.briefMetaLabel}>Goals · </Text>
              {brief.goals}
            </Text>
          ) : null}
          {brief.constraints ? (
            <Text style={styles.briefMeta}>
              <Text style={styles.briefMetaLabel}>Constraints · </Text>
              {brief.constraints}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    ...typography.section,
    color: colors.accent,
  },
  brandSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  resetText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    ...typography.section,
    color: colors.textMuted,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  roster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  rosterWide: {},
  rosterItem: {},
  rosterItemWide: {
    width: '31.5%',
    minWidth: 240,
    flexGrow: 1,
  },
  rosterItemNarrow: {
    width: '100%',
  },
  split: {
    gap: spacing.lg,
  },
  splitWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  splitMain: {},
  splitSide: {},
  briefCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
    gap: 8,
  },
  briefName: {
    ...typography.title,
    color: colors.text,
  },
  briefBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  briefMeta: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  briefMetaLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
