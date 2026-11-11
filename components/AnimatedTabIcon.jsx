// components/AnimatedTabIcon.jsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { SPRING } from '../utils/animations';
import { TAB_ICONS } from '../constants/tabConfig';

export default function AnimatedTabIcon({ name, focused }) {
  const { theme } = useTheme();

  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  // ✅ FIX #1: bungkus scale jadi AnimatedInterpolation
  const scaleInterp = scale.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [0, 0.5, 1, 1.5, 2],
  });

  // ✅ FIX #2: bungkus bgOpacity jadi AnimatedInterpolation untuk scaleX
  const scaleXInterp = bgOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1.2, ...SPRING.snappy }),
        Animated.spring(translateY, { toValue: -4, ...SPRING.gentle }),
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(rotate, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, ...SPRING.gentle }),
        Animated.spring(translateY, { toValue: 0, ...SPRING.gentle }),
        Animated.timing(bgOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [focused]);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          transform: [
            { scale: scaleInterp },        // ✅ sudah interpolasi
            { translateY },
            { rotate: rotation },
          ],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.bg,
          {
            backgroundColor: theme.primarySoft,
            opacity: bgOpacity,
            borderColor: theme.secondary,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.topOrnament,
          {
            backgroundColor: theme.secondary,
            opacity: bgOpacity,
            transform: [{ scaleX: scaleXInterp }],   // ✅ sudah interpolasi
          },
        ]}
      />
      <Text style={styles.icon}>{TAB_ICONS[name]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 44, height: 36, justifyContent: 'center', alignItems: 'center' },
  bg: { ...StyleSheet.absoluteFillObject, borderRadius: 14, borderWidth: 1.5 },
  topOrnament: {
    position: 'absolute',
    top: -2,
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  icon: { fontSize: 20, textAlign: 'center' },
});