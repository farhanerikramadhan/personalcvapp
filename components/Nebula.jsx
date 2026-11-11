// components/Nebula.jsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

function NebulaBlob({ size, x, y, duration = 12000, opacity = 0.04 }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, []);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
    extrapolate: 'clamp',
  });
  const opacityInterp = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [opacity * 0.5, opacity],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#ffffff',
        opacity: opacityInterp,
        transform: [{ scale }],
      }}
    />
  );
}

export default function Nebula() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <NebulaBlob size={500} x={-20} y={-15} duration={14000} opacity={0.03} />
      <NebulaBlob size={400} x={50} y={30} duration={18000} opacity={0.04} />
      <NebulaBlob size={450} x={-15} y={60} duration={16000} opacity={0.03} />
    </View>
  );
}