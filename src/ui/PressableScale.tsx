import React, { useCallback } from 'react';
import { Platform, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
}

export function PressableScale({
  onPress,
  disabled,
  children,
  style,
  scaleTo = 0.97,
  haptic = true,
}: Props) {
  const scale = useSharedValue(1);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleTo, { damping: 18, stiffness: 420 });
  }, [scale, scaleTo]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 320 });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled || !onPress) return;
    if (haptic && Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    onPress();
  }, [disabled, haptic, onPress]);

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[anim, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
