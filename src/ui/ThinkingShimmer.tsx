import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radii } from '../theme';

interface Props {
  color?: string;
  label?: string;
}

export function ThinkingShimmer({ color = colors.accent }: Props) {
  const x = useSharedValue(-1);

  useEffect(() => {
    x.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
  }, [x]);

  const slide = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * 120 }],
  }));

  return (
    <View style={[styles.track, { borderColor: `${color}33` }]}>
      <Animated.View style={[styles.beam, slide]}>
        <LinearGradient
          colors={['transparent', `${color}55`, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color, opacity: 0.55 }]} />
      <View style={[styles.dot, { backgroundColor: color, opacity: 0.3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 18,
    borderRadius: radii.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
  },
  beam: {
    ...StyleSheet.absoluteFill,
    width: 80,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
