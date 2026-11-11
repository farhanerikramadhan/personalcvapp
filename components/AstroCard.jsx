// components/AstroCard.jsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function AstroCard({ children, style, glow = true }) {
  const { theme } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!glow) return;
    const loop = () => {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, [glow]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.04, 0.12],
  });

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }, style]}>
      {glow && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.accent,
              opacity,
              borderRadius: 16,
            },
          ]}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    overflow: 'hidden',
  },
});