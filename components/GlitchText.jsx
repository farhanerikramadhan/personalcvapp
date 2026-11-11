// components/GlitchText.jsx
import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function GlitchText({ children, style, intensity = 1 }) {
  const { theme } = useTheme();
  const glitchX = useRef(new Animated.Value(0)).current;
  const glitchOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.delay(3000),
        Animated.parallel([
          Animated.timing(glitchX, {
            toValue: 3,
            duration: 40,
            useNativeDriver: true,
          }),
          Animated.timing(glitchOpacity, {
            toValue: 0.5,
            duration: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glitchX, {
            toValue: -3,
            duration: 40,
            useNativeDriver: true,
          }),
          Animated.timing(glitchOpacity, {
            toValue: 1,
            duration: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(glitchX, {
          toValue: 0,
          duration: 40,
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, [glitchX, glitchOpacity]);

  return (
    <Animated.View style={{ transform: [{ translateX: glitchX }] }}>
      <Text style={[{ color: theme.text }, style]}>{children}</Text>
      <Animated.Text
        style={[
          StyleSheet.absoluteFillObject,
          {
            color: theme.secondary,
            opacity: glitchOpacity,
            transform: [{ translateX: 1 }],
          },
          style,
        ]}
        pointerEvents="none"
      >
        {children}
      </Animated.Text>
    </Animated.View>
  );
}