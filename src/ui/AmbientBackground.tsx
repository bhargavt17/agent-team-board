import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';

interface Props {
  children?: React.ReactNode;
  intensity?: 'launch' | 'ops';
}

function Orb({
  color,
  size,
  top,
  left,
  delay = 0,
}: {
  color: string;
  size: number;
  top: number | string;
  left: number | string;
  delay?: number;
}) {
  const pulse = useSharedValue(0.55);
  const drift = useSharedValue(0);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.9, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    drift.value = withDelay(
      delay,
      withRepeat(
        withTiming(14, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [delay, drift, pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ translateY: drift.value }, { scale: 0.92 + pulse.value * 0.12 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.orb,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top: top as number,
          left: left as number,
        },
      ]}
    />
  );
}

export function AmbientBackground({ children, intensity = 'ops' }: Props) {
  const { width, height } = useWindowDimensions();
  const gridSize = 28;
  const cols = Math.ceil(width / gridSize) + 1;
  const rows = Math.ceil(Math.min(height, 900) / gridSize) + 1;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={
          intensity === 'launch'
            ? ['#02050E', '#071225', '#0A0F28', '#050A16']
            : ['#02050E', '#060B18', '#08101F']
        }
        style={StyleSheet.absoluteFill}
      />

      <Orb color="rgba(107, 155, 255, 0.22)" size={280} top={-60} left={-80} />
      <Orb color="rgba(167, 139, 250, 0.18)" size={220} top={120} left={width * 0.55} delay={600} />
      <Orb
        color="rgba(34, 211, 238, 0.12)"
        size={180}
        top={height * 0.55}
        left={-40}
        delay={1200}
      />
      {intensity === 'launch' ? (
        <Orb
          color="rgba(244, 114, 182, 0.12)"
          size={160}
          top={height * 0.35}
          left={width * 0.7}
          delay={900}
        />
      ) : null}

      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: rows }).map((_, r) => (
          <View key={`r-${r}`} style={styles.gridRow}>
            {Array.from({ length: cols }).map((__, c) => (
              <View key={`c-${c}`} style={styles.gridCell} />
            ))}
          </View>
        ))}
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(3,6,15,0.55)', colors.bg]}
        locations={[0.4, 0.75, 1]}
        style={styles.vignette}
        pointerEvents="none"
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
  },
  grid: {
    ...StyleSheet.absoluteFill,
    opacity: 1,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    width: 28,
    height: 28,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.grid,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
  },
});
