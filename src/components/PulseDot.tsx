import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  color: string;
  size?: number;
  active?: boolean;
  ring?: boolean;
}

export function PulseDot({ color, size = 8, active = true, ring = false }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (!active) {
      scale.value = 1;
      opacity.value = 0.35;
      ringScale.value = 1;
      ringOpacity.value = 0;
      return;
    }
    scale.value = withRepeat(
      withTiming(1.85, { duration: 1200, easing: Easing.out(Easing.quad) }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1200, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
    if (ring) {
      ringScale.value = withRepeat(
        withTiming(2.4, { duration: 1800, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      );
      ringOpacity.value = withRepeat(
        withTiming(0, { duration: 1800, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      );
    }
  }, [active, opacity, ring, ringOpacity, ringScale, scale]);

  const halo = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const box = ring ? size * 3.2 : size * 2.2;

  return (
    <View style={[styles.wrap, { width: box, height: box }]}>
      {active && ring ? (
        <Animated.View
          style={[
            styles.halo,
            ringStyle,
            {
              width: size * 1.6,
              height: size * 1.6,
              borderRadius: size,
              borderWidth: 1.5,
              borderColor: color,
              backgroundColor: 'transparent',
            },
          ]}
        />
      ) : null}
      {active ? (
        <Animated.View
          style={[
            styles.halo,
            halo,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}
        />
      ) : null}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
});
