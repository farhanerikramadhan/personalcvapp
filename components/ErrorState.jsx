// components/ErrorState.jsx
import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/* ═══════════════════════════════════════════
   PULSE RING
   ═══════════════════════════════════════════ */
function PulseRing({ color, size = 120 }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   FLOATING PARTICLES
   ═══════════════════════════════════════════ */
function FloatingParticles({ color, count = 12 }) {
  const anims = useRef(
    Array.from({ length: count }).map(() => new Animated.Value(0))
  ).current;

  const particles = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 3500 + Math.random() * 3500,
        delay: Math.random() * 2000,
        drift: (Math.random() - 0.5) * 20,
      })),
    [count]
  );

  useEffect(() => {
    particles.forEach((p, i) => {
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
  }, [anims, particles]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => {
        const translateY = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -p.drift * 2],
        });
        const opacity = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.1, 0.4, 0.1],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: color,
              opacity,
              transform: [{ translateY }],
            }}
          />
        );
      })}
    </View>
  );
}

/* ═══════════════════════════════════════════
   SHAKE
   ═══════════════════════════════════════════ */
function useShake(delay = 1200, duration = 500) {
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      const loop = () => {
        Animated.sequence([
          Animated.timing(shake, {
            toValue: 1,
            duration: duration / 6,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: -1,
            duration: duration / 3,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: 0,
            duration: duration / 6,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(loop, 3000);
        });
      };
      loop();
    }, delay);
    return () => clearTimeout(timer);
  }, [shake, delay, duration]);

  return shake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  });
}

/* ═══════════════════════════════════════════
   ROTATING RETRY ICON
   ═══════════════════════════════════════════ */
function RotatingRetryIcon({ color }) {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      rotate.setValue(0);
      Animated.timing(rotate, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [rotate]);

  const rotateDeg = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Text
      style={{ color, fontSize: 14, transform: [{ rotate: rotateDeg }] }}
    >
      ↻
    </Animated.Text>
  );
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function ErrorState({ message = 'Terjadi kesalahan.', onRetry }) {
  const { theme } = useTheme();

  const iconAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  // ✅ FIX: interpolate pressScale
  const pressScaleInterp = pressScale.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [0, 0.5, 1, 1.5, 2],
  });

  const shakeRotate = useShake(1400, 600);

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(iconAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.timing(pressScale, {
      toValue: 0.94,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 4,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const iconScale = iconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });
  const iconOpacity = iconAnim;

  const messageOpacity = messageAnim;
  const messageTranslateY = messageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  const buttonOpacity = buttonAnim;
  const buttonTranslateY = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background || theme.bg }]}>
      <FloatingParticles color={theme.text || theme.primary} count={12} />

      <Animated.View
        style={[
          styles.iconWrap,
          {
            opacity: iconOpacity,
            transform: [{ scale: iconScale }],
          },
        ]}
      >
        <PulseRing color={theme.primary || theme.text} size={120} />
        <Animated.Text
          style={[styles.icon, { transform: [{ rotate: shakeRotate }] }]}
        >
          ⚠️
        </Animated.Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: messageOpacity,
          transform: [{ translateY: messageTranslateY }],
        }}
      >
        <Text style={[styles.message, { color: theme.text }]}>
          {message}
        </Text>
      </Animated.View>

      {onRetry && (
        <Animated.View
          style={{
            opacity: buttonOpacity,
            transform: [
              { translateY: buttonTranslateY },
              { scale: pressScaleInterp },  // ✅ sudah interpolated
            ],
          }}
        >
          <TouchableOpacity
            onPress={onRetry}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.85}
            style={[
              styles.button,
              { backgroundColor: theme.primary || theme.text },
            ]}
          >
            <RotatingRetryIcon color="#fff" />
            <Text style={styles.buttonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: { fontSize: 52 },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    maxWidth: 280,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});