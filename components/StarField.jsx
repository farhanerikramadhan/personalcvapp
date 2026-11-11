// components/StarField.jsx
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/* ═══════════════════════════════════════════
   STAR — bintang putih berkelip
   ═══════════════════════════════════════════ */
function Star({ x, y, size, delay, duration, bright }) {
  const twinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(twinkle, {
          toValue: 1,
          duration: duration / 2,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(twinkle, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, []);

  const opacity = twinkle.interpolate({
    inputRange: [0, 1],
    outputRange: [bright ? 0.3 : 0.1, bright ? 1 : 0.6],
    extrapolate: 'clamp',
  });
  const scale = twinkle.interpolate({
    inputRange: [0, 1],
    outputRange: [bright ? 0.7 : 0.5, bright ? 1.4 : 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#ffffff',
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   PLANET — planet abu-abu drift
   ═══════════════════════════════════════════ */
function Planet({ size, x, y, driftRange = 12, duration = 14000, opacity = 0.12 }) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, []);

  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -driftRange],
    extrapolate: 'clamp',
  });
  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, driftRange * 0.6],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#ffffff',
        opacity,
        transform: [{ translateX }, { translateY }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   COMET — komet putih melintas
   ═══════════════════════════════════════════ */
function Comet({ delay = 0, duration = 3500 }) {
  const comet = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      comet.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(comet, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(5000 + Math.random() * 4000),
      ]).start(() => loop());
    };
    loop();
  }, []);

  const translateX = comet.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 500],
    extrapolate: 'clamp',
  });
  const translateY = comet.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 300],
    extrapolate: 'clamp',
  });
  const opacity = comet.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: '20%',
        left: 0,
        width: 120,
        height: 1.5,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate: '35deg' }],
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: '#ffffff',
          right: 0,
          top: -2,
          shadowColor: '#ffffff',
          shadowOpacity: 1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 2,
          top: 0,
          width: 100,
          height: 1,
          backgroundColor: '#ffffff',
          opacity: 0.4,
        }}
      />
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   STAR FIELD
   ═══════════════════════════════════════════ */
export default function StarField({ starCount = 60 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: starCount }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 3000,
        duration: 2000 + Math.random() * 4000,
        bright: Math.random() > 0.7,
      })),
    [starCount]
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((s, i) => (
        <Star key={i} {...s} />
      ))}
      <Planet size={180} x={-10} y={10} opacity={0.08} duration={16000} />
      <Planet size={100} x={75} y={70} opacity={0.1} duration={14000} />
      <Planet size={60} x={20} y={85} opacity={0.12} duration={18000} />
      <Comet delay={2000} />
      <Comet delay={8000} />
    </View>
  );
}