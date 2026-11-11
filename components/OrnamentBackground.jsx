// components/OrnamentBackground.jsx
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { SPRING } from '../utils/animations';

/* ═══════════════════════════════════════════
   FLOATING KAWUNG — ornamen dengan drift
   ═══════════════════════════════════════════ */
function KawungOrnament({
  size,
  color,
  delay = 0,
  style,
  driftY = 12,
  driftX = 6,
  breathDuration = 4000,
  showInnerRing = true,
  showSparkles = false,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(0)).current;

  // Entrance
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.12,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, { toValue: 1, ...SPRING.gentle }),
      ]),
    ]).start();
  }, []);

  // Continuous float + breath after entrance
  useEffect(() => {
    const startLoop = () => {
      // Float loop
      const floatLoop = () => {
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: breathDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: breathDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => floatLoop());
      };

      // Breath loop (scale tambahan)
      const breathLoop = () => {
        Animated.sequence([
          Animated.timing(breathAnim, {
            toValue: 1,
            duration: breathDuration * 1.2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breathAnim, {
            toValue: 0,
            duration: breathDuration * 1.2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => breathLoop());
      };

      floatLoop();
      breathLoop();
    };

    // Start after entrance completes
    const timer = setTimeout(startLoop, delay + 1300);
    return () => clearTimeout(timer);
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -driftY],
  });
  const translateX = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, driftX],
  });
  const breathScale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: size * 0.06,
          borderColor: color,
          opacity,
          // ✅ FIX: dua scale terpisah, bukan Animated.multiply
          transform: [
            { translateY },
            { translateX },
            { scale: scale },
            { scale: breathScale },
          ],
        },
        style,
      ]}
    >
      {/* Inner ring (konsentris) */}
      {showInnerRing && (
        <View
          style={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            right: '15%',
            bottom: '15%',
            borderRadius: size,
            borderWidth: size * 0.03,
            borderColor: color,
            opacity: 0.5,
          }}
        />
      )}

      {/* Sparkle dots */}
      {showSparkles && <SparkleDots color={color} size={size} />}
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   SPARKLE DOTS — titik di sekitar ornamen
   ═══════════════════════════════════════════ */
function SparkleDots({ color, size, count = 5 }) {
  const anims = useRef(
    Array.from({ length: count }).map(() => new Animated.Value(0))
  ).current;

  const positions = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const radius = size * 0.6;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          s: 2 + Math.random() * 2,
          delay: Math.random() * 1500,
          duration: 2000 + Math.random() * 1500,
        };
      }),
    [count, size]
  );

  useEffect(() => {
    positions.forEach((p, i) => {
      const loop = () => {
        anims[i].setValue(0);
        Animated.timing(anims[i], {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => loop());
      };
      loop();
    });
  }, [anims, positions]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {positions.map((p, i) => {
        const opacity = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.6, 0],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: p.s,
              height: p.s,
              borderRadius: p.s / 2,
              marginLeft: p.x,
              marginTop: p.y,
              backgroundColor: color,
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

/* ═══════════════════════════════════════════
   ROTATING ACCENT — ring dalam berputar
   ═══════════════════════════════════════════ */
function RotatingAccent({ size, color, style, delay = 400 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, {
        toValue: 0.08,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    const loop = () => {
      rotate.setValue(0);
      Animated.timing(rotate, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => loop());
    };
    const timer = setTimeout(loop, delay + 1200);
    return () => clearTimeout(timer);
  }, []);

  const rotateDeg = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: color,
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          opacity,
          transform: [{ rotate: rotateDeg }],
        },
        style,
      ]}
    />
  );
}

/* ═══════════════════════════════════════════
   PULSE GLOW — glow bernafas di belakang ornamen
   ═══════════════════════════════════════════ */
function PulseGlow({ size, color, style, delay = 0 }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      const loop = () => {
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 3200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 3200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => loop());
      };
      loop();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.03, 0.1],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        },
        style,
      ]}
    />
  );
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function OrnamentBackground() {
  const { theme } = useTheme();

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* ═══ Top-right besar ═══ */}
      <PulseGlow
        size={240}
        color={theme.secondary}
        delay={0}
        style={{ top: -60, right: -80 }}
      />
      <KawungOrnament
        size={200}
        color={theme.secondary}
        delay={0}
        driftY={14}
        driftX={6}
        breathDuration={4500}
        showInnerRing
        style={{ top: -40, right: -60 }}
      />

      {/* ═══ Top-left medium ═══ */}
      <KawungOrnament
        size={140}
        color={theme.primary}
        delay={200}
        driftY={10}
        driftX={-8}
        breathDuration={3800}
        showInnerRing
        style={{ top: 120, left: -50 }}
      />

      {/* ═══ Bottom-right besar + sparkles ═══ */}
      <PulseGlow
        size={300}
        color={theme.accent}
        delay={800}
        style={{ bottom: -120, right: -140 }}
      />
      <KawungOrnament
        size={260}
        color={theme.accent}
        delay={400}
        driftY={18}
        driftX={10}
        breathDuration={5200}
        showInnerRing
        showSparkles
        style={{ bottom: -80, right: -100 }}
      />

      {/* ═══ Bottom-left kecil ═══ */}
      <KawungOrnament
        size={100}
        color={theme.secondary}
        delay={600}
        driftY={8}
        driftX={-5}
        breathDuration={3400}
        style={{ bottom: 200, left: 30 }}
      />

      {/* ═══ Rotating accent ═══ */}
      <RotatingAccent
        size={180}
        color={theme.primary}
        delay={1000}
        style={{ top: '40%', right: -90 }}
      />
      <RotatingAccent
        size={120}
        color={theme.accent}
        delay={1500}
        style={{ bottom: '30%', left: -60 }}
      />
    </View>
  );
}