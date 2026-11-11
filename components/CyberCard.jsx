// components/CyberCard.jsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function CyberCard({
  children,
  style,
  glowColor,
  intensity = 0.4,
  showCorners = true,
}) {
  const { theme } = useTheme();
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start(() => loop());
    };
    loop();
  }, [glow]);

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.border,
      glowColor || theme.accent,
    ],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor,
        },
        style,
      ]}
    >
      {/* Corner brackets */}
      {showCorners && (
        <>
          <View style={[styles.corner, styles.cornerTL, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: theme.accent }]} />
        </>
      )}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderWidth: 2,
  },
  cornerTL: { top: -1, left: -1, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: -1, right: -1, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: -1, left: -1, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: -1, right: -1, borderLeftWidth: 0, borderTopWidth: 0 },
});