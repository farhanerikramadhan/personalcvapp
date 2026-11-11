// components/ShootingStar.jsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ShootingStar({ delay = 0 }) {
  const { theme } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(6000 + Math.random() * 4000),
      ]).start(() => loop());
    };
    loop();
  }, []);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 600],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 400],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.15, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate: '40deg' }],
      }}
    >
      <View
        style={{
          width: 120,
          height: 1.5,
          backgroundColor: theme.accent,
          shadowColor: theme.accent,
          shadowOpacity: 1,
          shadowRadius: 6,
        }}
      />
    </Animated.View>
  );
}