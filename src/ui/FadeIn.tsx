import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  from?: 'up' | 'down' | 'right' | 'scale';
}

export function FadeIn({ children, delay = 0, style, from = 'up' }: Props) {
  if (from === 'scale') {
    return <ScaleIn delay={delay} style={style}>{children}</ScaleIn>;
  }
  const entering =
    from === 'down'
      ? FadeInDown.delay(delay).springify().damping(16)
      : from === 'right'
        ? FadeInRight.delay(delay).springify().damping(16)
        : FadeInUp.delay(delay).springify().damping(16);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

function ScaleIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withSpring(1, { damping: 14, stiffness: 160 }));
  }, [delay, progress]);

  const anim = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.92 + progress.value * 0.08 }, { translateY: (1 - progress.value) * 12 }],
  }));

  return <Animated.View style={[anim, style]}>{children}</Animated.View>;
}
