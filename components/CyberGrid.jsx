// components/CyberGrid.jsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function CyberGrid() {
  const { theme } = useTheme();
  const scanY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      scanY.setValue(0);
      Animated.timing(scanY, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [scanY]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Grid lines horizontal */}
      {Array.from({ length: 20 }).map((_, i) => (
        <View
          key={`h-${i}`}
          style={{
            position: 'absolute',
            top: `${i * 5}%`,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: theme.accent,
            opacity: 0.04,
          }}
        />
      ))}

      {/* Grid lines vertical */}
      {Array.from({ length: 15 }).map((_, i) => (
        <View
          key={`v-${i}`}
          style={{
            position: 'absolute',
            left: `${i * 7}%`,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: theme.accent,
            opacity: 0.04,
          }}
        />
      ))}

      {/* Scanline bergerak */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: theme.accent,
          opacity: 0.15,
          transform: [
            {
              translateY: scanY.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 800],
              }),
            },
          ],
        }}
      />
    </View>
  );
}