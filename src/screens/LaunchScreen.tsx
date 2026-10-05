import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TEAM } from '../data/agents';
import { loadApiKey, saveApiKey, envApiKey } from '../ai/apiKey';
import { ProductBrief } from '../types';
import { colors, radii, roleColors, shadows, spacing, typography } from '../theme';
import { AmbientBackground } from '../ui/AmbientBackground';
import { PressableScale } from '../ui/PressableScale';
import { FadeIn } from '../ui/FadeIn';
import { PulseDot } from '../components/PulseDot';

export interface LaunchPayload {
  brief: ProductBrief;
  apiKey: string;
}

interface Props {
  onStart: (payload: LaunchPayload) => void;
}

const EXAMPLES: ProductBrief[] = [
  {
    name: 'PulseHire',
    description:
      'AI-assisted hiring ops board that tracks applications, interviews, and recruiter follow-ups in real time.',
    goals: 'Cut time-to-schedule, surface stalled candidates, delight recruiters on mobile',
    constraints: 'Must work offline-first on phones; keep v1 lean',
  },
];

export function LaunchScreen({ onStart }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goals, setGoals] = useState('');
  const [constraints, setConstraints] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [keyFromEnv, setKeyFromEnv] = useState(false);

  const heroGlow = useSharedValue(0.35);

  useEffect(() => {
    heroGlow.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [heroGlow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
  }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const env = envApiKey();
      if (env) {
        if (!cancelled) {
          setApiKey(env);
          setKeyFromEnv(true);
        }
        return;
      }
      const stored = await loadApiKey();
      if (!cancelled && stored) setApiKey(stored);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const canStart = name.trim().length > 1 && description.trim().length > 8;
  const hasKey = apiKey.trim().length > 8;

  const fillExample = () => {
    const ex = EXAMPLES[0];
    setName(ex.name);
    setDescription(ex.description);
    setGoals(ex.goals);
    setConstraints(ex.constraints);
  };

  const handleStart = async () => {
    const key = apiKey.trim();
    if (key && !keyFromEnv) {
      await saveApiKey(key);
    }
    onStart({
      brief: {
        name: name.trim(),
        description: description.trim(),
        goals: goals.trim(),
        constraints: constraints.trim(),
      },
      apiKey: key,
    });
  };

  return (
    <AmbientBackground intensity="launch">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 36 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <FadeIn from="scale" delay={40}>
            <View style={styles.heroBadge}>
              <PulseDot color={colors.success} size={6} active />
              <Text style={styles.heroBadgeText}>AGENT OPS ROOM · CLAUDE OPUS</Text>
            </View>
          </FadeIn>

          <View style={styles.heroBlock}>
            <Animated.View style={[styles.heroOrb, glowStyle]} pointerEvents="none" />
            <Animated.Text
              entering={FadeInDown.delay(120).springify().damping(14)}
              style={styles.hero}
            >
              Brief the team.{'\n'}Watch them build.
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(220).springify().damping(16)}
              style={styles.sub}
            >
              Drop your product details. Six specialists stream live on Claude Opus — parallel
              discovery, architecture, and story breakdown as tokens arrive.
            </Animated.Text>
          </View>

          <Animated.View entering={FadeInDown.delay(280).springify().damping(16)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teamStrip}
            >
              {TEAM.map((a, i) => (
                <Animated.View
                  key={a.id}
                  entering={FadeInDown.delay(320 + i * 50).springify().damping(16)}
                  style={[styles.chip, { borderColor: `${roleColors[a.role]}44` }]}
                >
                  <View
                    style={[
                      styles.chipAvatar,
                      { backgroundColor: `${roleColors[a.role]}22` },
                    ]}
                  >
                    <Text
                      style={{ color: roleColors[a.role], fontWeight: '800', fontSize: 10 }}
                    >
                      {a.initials}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.chipName}>{a.name.split(' ')[0]}</Text>
                    <Text style={styles.chipRole}>{a.tagline}</Text>
                  </View>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(420).springify().damping(15)}
            style={styles.form}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'transparent']}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={styles.providerRow}>
              <Text style={styles.providerLabel}>AI provider</Text>
              <View style={styles.providerPill}>
                <Text style={styles.providerPillText}>Claude Opus 5.5 · streaming</Text>
              </View>
            </View>

            <Field
              label="Anthropic API key"
              placeholder={
                keyFromEnv
                  ? 'Using EXPO_PUBLIC_ANTHROPIC_API_KEY from env'
                  : 'sk-ant-… (saved on this device)'
              }
              value={keyFromEnv ? '' : apiKey}
              onChangeText={(t) => {
                setKeyFromEnv(false);
                setApiKey(t);
              }}
              secure
              editable={!keyFromEnv}
            />
            {keyFromEnv ? (
              <Text style={styles.hint}>
                Key loaded from environment. Paste a different key to override for this device.
              </Text>
            ) : (
              <Text style={styles.hint}>
                {hasKey
                  ? 'Key will be stored in AsyncStorage (never committed).'
                  : 'Optional — without a key, agents use a typed scripted fallback.'}
              </Text>
            )}
            {keyFromEnv ? (
              <PressableScale
                onPress={() => {
                  setKeyFromEnv(false);
                  setApiKey('');
                }}
                style={styles.exampleBtn}
              >
                <Text style={styles.exampleText}>Use a different key</Text>
              </PressableScale>
            ) : null}

            <Field
              label="Product name"
              placeholder="e.g. PulseHire"
              value={name}
              onChangeText={setName}
            />
            <Field
              label="Description"
              placeholder="What are you building, and for whom?"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <Field
              label="Goals"
              placeholder="Outcomes that matter for v1"
              value={goals}
              onChangeText={setGoals}
              multiline
            />
            <Field
              label="Constraints"
              placeholder="Tech, time, compliance, platform limits…"
              value={constraints}
              onChangeText={setConstraints}
              multiline
            />

            <PressableScale onPress={fillExample} style={styles.exampleBtn}>
              <Text style={styles.exampleText}>Use PulseHire example</Text>
            </PressableScale>

            <PressableScale
              disabled={!canStart}
              onPress={handleStart}
              scaleTo={0.96}
              style={[styles.cta, !canStart && styles.ctaDisabled, canStart && shadows.glow(colors.accent)]}
            >
              <LinearGradient
                colors={canStart ? ['#6B9BFF', '#8B7CFF', '#22D3EE'] : ['#243352', '#243352']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGrad}
              >
                <Text style={[styles.ctaText, !canStart && { color: colors.textDim }]}>
                  {hasKey || keyFromEnv ? 'Launch live ops room' : 'Launch (scripted fallback)'}
                </Text>
              </LinearGradient>
            </PressableScale>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AmbientBackground>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  secure,
  editable = true,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  secure?: boolean;
  editable?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        multiline={multiline}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline && styles.inputMulti,
          !editable && styles.inputDisabled,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentSoft,
    borderColor: colors.borderGlow,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginBottom: spacing.lg,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.accent,
  },
  heroBlock: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  heroOrb: {
    position: 'absolute',
    top: -40,
    left: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(107, 155, 255, 0.25)',
  },
  hero: {
    ...typography.display,
    color: colors.text,
    lineHeight: 40,
    marginBottom: spacing.md,
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 23,
  },
  teamStrip: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(14, 22, 40, 0.85)',
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  chipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  chipRole: {
    fontSize: 10,
    color: colors.textMuted,
  },
  form: {
    backgroundColor: 'rgba(14, 22, 40, 0.82)',
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  providerPill: {
    backgroundColor: 'rgba(217, 119, 87, 0.15)',
    borderColor: 'rgba(217, 119, 87, 0.45)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  providerPillText: {
    color: '#E8A87C',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -4,
    lineHeight: 16,
  },
  field: { gap: 6 },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  input: {
    backgroundColor: 'rgba(3, 6, 15, 0.7)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 12 : 11,
    color: colors.text,
    fontSize: 15,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  inputMulti: {
    minHeight: 88,
    paddingTop: 12,
  },
  exampleBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  exampleText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  cta: {
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  ctaDisabled: { opacity: 0.65 },
  ctaGrad: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
