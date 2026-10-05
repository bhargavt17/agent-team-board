import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TEAM } from '../data/agents';
import { ProductBrief } from '../types';
import { colors, radii, roleColors, spacing, typography } from '../theme';

interface Props {
  onStart: (brief: ProductBrief) => void;
}

const EXAMPLES: ProductBrief[] = [
  {
    name: 'PulseHire',
    description:
      'AI-assisted hiring ops board that tracks applications, interviews, and recruiter follow-ups in real time.',
    goals: 'Cut time-to-schedule, surface stalled candidates, delight recruiters on mobile',
    constraints: 'Must work offline-first on phones; no LLM calls in the critical path for v1',
  },
];

export function LaunchScreen({ onStart }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goals, setGoals] = useState('');
  const [constraints, setConstraints] = useState('');

  const canStart = name.trim().length > 1 && description.trim().length > 8;

  const fillExample = () => {
    const ex = EXAMPLES[0];
    setName(ex.name);
    setDescription(ex.description);
    setGoals(ex.goals);
    setConstraints(ex.constraints);
  };

  return (
    <LinearGradient colors={['#060912', '#0A1224', '#0B1320']} style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.heroBadgeText}>AGENT OPS ROOM</Text>
          </View>

          <Text style={styles.hero}>Brief the team.{'\n'}Watch them build.</Text>
          <Text style={styles.sub}>
            Drop your product details. Six specialists — director, EM, architect, backend,
            frontend, QA — will discover, plan, and story-break it live.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teamStrip}
          >
            {TEAM.map((a) => (
              <View
                key={a.id}
                style={[styles.chip, { borderColor: `${roleColors[a.role]}44` }]}
              >
                <View
                  style={[styles.chipAvatar, { backgroundColor: `${roleColors[a.role]}22` }]}
                >
                  <Text style={{ color: roleColors[a.role], fontWeight: '800', fontSize: 10 }}>
                    {a.initials}
                  </Text>
                </View>
                <View>
                  <Text style={styles.chipName}>{a.name.split(' ')[0]}</Text>
                  <Text style={styles.chipRole}>{a.title}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.form}>
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

            <Pressable onPress={fillExample} style={styles.exampleBtn}>
              <Text style={styles.exampleText}>Use PulseHire example</Text>
            </Pressable>

            <Pressable
              disabled={!canStart}
              onPress={() =>
                onStart({
                  name: name.trim(),
                  description: description.trim(),
                  goals: goals.trim(),
                  constraints: constraints.trim(),
                })
              }
              style={({ pressed }) => [
                styles.cta,
                !canStart && styles.ctaDisabled,
                pressed && canStart && styles.ctaPressed,
              ]}
            >
              <LinearGradient
                colors={canStart ? ['#5B8CFF', '#7B6CFF'] : ['#243352', '#243352']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGrad}
              >
                <Text style={[styles.ctaText, !canStart && { color: colors.textDim }]}>
                  Launch simulation
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
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
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.inputMulti]}
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
    borderColor: `${colors.accent}44`,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginBottom: spacing.lg,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.accent,
  },
  hero: {
    ...typography.hero,
    color: colors.text,
    lineHeight: 34,
    marginBottom: spacing.md,
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  teamStrip: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
    gap: spacing.md,
  },
  field: { gap: 6 },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 12 : 11,
    color: colors.text,
    fontSize: 15,
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
    fontWeight: '600',
    fontSize: 13,
  },
  cta: {
    marginTop: spacing.sm,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  ctaDisabled: { opacity: 0.7 },
  ctaPressed: { opacity: 0.9 },
  ctaGrad: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
