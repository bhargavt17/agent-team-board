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
}

export function PulseDot({ color, size = 8, active = true }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    if (!active) {
      scale.value = 1;
      opacity.value = 0.35;
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
  }, [active, opacity, scale]);

  const halo = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.wrap, { width: size * 2.2, height: size * 2.2 }]}>
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
