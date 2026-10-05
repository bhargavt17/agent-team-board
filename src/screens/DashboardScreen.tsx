import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TEAM } from '../data/agents';
import { AgentCard } from '../components/AgentCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { StageProgress } from '../components/StageProgress';
import { StoryBoard } from '../components/StoryBoard';
import { SimulationEngine } from '../simulation/engine';
import { ProductBrief, SimulationState } from '../types';
import { colors, radii, spacing, typography } from '../theme';
import { AmbientBackground } from '../ui/AmbientBackground';
import { GlassPanel } from '../ui/GlassPanel';
import { PressableScale } from '../ui/PressableScale';
import { PulseDot } from '../components/PulseDot';

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

  const activeCount = TEAM.filter(
    (a) => state.agents[a.id]?.status !== 'Idle',
  ).length;

  return (
    <AmbientBackground intensity="ops">
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
        <Animated.View entering={FadeInDown.springify().damping(16)} style={styles.topBar}>
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>AGENT TEAM BOARD</Text>
            <View style={styles.brandMeta}>
              <PulseDot
                color={state.running ? colors.success : colors.textMuted}
                size={6}
                active={state.running}
              />
              <Text style={styles.brandSub}>
                {state.running ? 'Live · parallel streams' : 'Session complete'}
                {' · '}
                {live ? 'Claude Opus 5.5' : 'Scripted fallback'}
              </Text>
            </View>
          </View>
          <PressableScale onPress={onReset} style={styles.resetBtn}>
            <Text style={styles.resetText}>New brief</Text>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify().damping(16)}>
          <StageProgress
            stage={state.stage}
            stageIndex={state.stageIndex}
            progress={state.progress}
            productName={brief.name}
          />
        </Animated.View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>TEAM ROSTER</Text>
          <View style={styles.activePill}>
            <Text style={styles.sectionHint}>{activeCount} active</Text>
          </View>
        </View>

        <View style={[styles.roster, isWide && styles.rosterWide]}>
          {TEAM.map((agent, index) => (
            <View
              key={agent.id}
              style={[
                styles.rosterItem,
                isWide ? styles.rosterItemWide : styles.rosterItemNarrow,
              ]}
            >
              <AgentCard
                agent={agent}
                state={state.agents[agent.id]}
                index={index}
              />
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

        <GlassPanel style={styles.briefCard} accent={colors.violet}>
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
        </GlassPanel>
      </ScrollView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
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
  brandBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  brand: {
    ...typography.section,
    color: colors.accent,
  },
  brandMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginLeft: -4,
  },
  brandSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(14, 22, 40, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  resetText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
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
  activePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.borderGlow,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.4,
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
