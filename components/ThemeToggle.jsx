// components/ThemeToggle.jsx
import React, { useEffect, useRef } from 'react';
import { Pressable, View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const TRACK_W = 52;
const TRACK_H = 28;
const THUMB = 22;
const PAD = 3;
const TRAVEL = TRACK_W - THUMB - PAD * 2;

/* ═══════════════════════════════════════════
   HELPER: jaminan AnimatedInterpolation
   ═══════════════════════════════════════════ */
function toAnimatedScale(value) {
  // kalau Animated.Value atau AnimatedInterpolation, bungkus interpolate
  if (value && typeof value.interpolate === 'function') {
    return value.interpolate({
      inputRange: [0, 0.5, 1, 1.5, 2],
      outputRange: [0, 0.5, 1, 1.5, 2],
    });
  }
  // fallback: bikin static value
  return new Animated.Value(1).interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1],
  });
}

/* ═══════════════════════════════════════════
   THUMB GLOW
   ═══════════════════════════════════════════ */
function ThumbGlow({ color, visible }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = () => {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
    return () => pulse.stopAnimation();
  }, [pulse, visible]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: THUMB,
        height: THUMB,
        borderRadius: THUMB / 2,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   TRACK SHIMMER
   ═══════════════════════════════════════════ */
function TrackShimmer({ visible }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 2000,
        delay: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
    return () => anim.stopAnimation();
  }, [anim, visible]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, TRACK_W + 20],
  });

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 20,
        backgroundColor: 'rgba(255,255,255,0.25)',
        transform: [{ translateX }, { skewX: '-20deg' }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function ThemeToggle({ style }) {
  const { theme, mode, toggleTheme } = useTheme();
  const styles = createStyles(theme);
  const isDark = mode === 'dark';

  const thumbPos = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const glyphRot = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const labelFade = useRef(new Animated.Value(1)).current;

  // ✅ FIX: bungkus pressScale dengan interpolate
  const pressScaleInterp = pressScale.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [0, 0.5, 1, 1.5, 2],
  });

  useEffect(() => {
    Animated.parallel([
      Animated.spring(thumbPos, {
        toValue: isDark ? 1 : 0,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(glyphRot, {
        toValue: isDark ? 1 : 0,
        duration: 350,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(labelFade, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(labelFade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isDark, thumbPos, glyphRot, labelFade]);

  const thumbTranslateX = thumbPos.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL],
  });

  const glyphRotate = glyphRot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(pressScale, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
    toggleTheme();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pressScaleInterp }] }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.wrap,
          style,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="switch"
        accessibilityState={{ checked: isDark }}
        accessibilityLabel={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      >
        <View style={[styles.track, isDark && styles.trackDark]}>
          <TrackShimmer visible={isDark} />

          <Animated.View
            style={[
              styles.thumb,
              isDark && styles.thumbDark,
              { transform: [{ translateX: thumbTranslateX }] },
            ]}
          >
            <ThumbGlow color={theme.bg} visible={isDark} />
            <Animated.Text
              style={[styles.thumbGlyph, { transform: [{ rotate: glyphRotate }] }]}
              allowFontScaling={false}
            >
              {isDark ? '☾' : '☀'}
            </Animated.Text>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.label, { opacity: labelFade }]}>
          {isDark ? 'Gelap' : 'Terang'}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const createStyles = (t) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    track: {
      width: TRACK_W,
      height: TRACK_H,
      borderRadius: 999,
      backgroundColor: t.surfaceAlt,
      borderWidth: 1,
      borderColor: t.border,
      justifyContent: 'center',
      paddingHorizontal: PAD,
      overflow: 'hidden',
    },
    trackDark: {
      backgroundColor: t.text,
      borderColor: t.text,
    },
    thumb: {
      width: THUMB,
      height: THUMB,
      borderRadius: 999,
      backgroundColor: t.bg,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: t.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    thumbDark: {
      backgroundColor: t.bg,
    },
    thumbGlyph: {
      fontSize: 11,
      color: t.text,
    },
    label: {
      fontSize: 11,
      fontWeight: '800',
      color: t.textMute,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      minWidth: 46,
    },
  });