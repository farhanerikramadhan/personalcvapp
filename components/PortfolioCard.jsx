// PortfolioCard.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useFadeSlideUp, usePressScale } from '../utils/animations';

/* ═══════════════════════════════════════════
   SHIMMER SWEEP
   ═══════════════════════════════════════════ */
function ShimmerSweep({ color, delay = 0 }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 2600,
        delay,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [anim, delay]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 400],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 80,
        backgroundColor: color,
        opacity: 0.15,
        transform: [{ translateX }, { skewX: '-20deg' }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   ACCENT LINE
   ═══════════════════════════════════════════ */
function AccentLine({ color, delay = 300 }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [anim, delay]);

  const scaleY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 16,
        bottom: 16,
        width: 3,
        borderRadius: 2,
        backgroundColor: color,
        opacity: 0.6,
        transform: [{ scaleY }],
        transformOrigin: 'top',
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   STATUS DOT
   ═══════════════════════════════════════════ */
function StatusDot({ color }) {
  const blink = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(blink, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, [blink]);

  const opacity = blink.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });
  const scale = blink.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.15],
  });

  return (
    <Animated.View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
        marginRight: 6,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   TECH CHIP
   ═══════════════════════════════════════════ */
function TechChip({ label, index, styles }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: 400 + index * 60,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 0],
  });
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <Animated.Text
      style={[
        styles.tech,
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
    >
      {label}
    </Animated.Text>
  );
}

/* ═══════════════════════════════════════════
   CORNER ACCENT
   ═══════════════════════════════════════════ */
function CornerAccent({ color }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 700,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 1.5,
        borderRightWidth: 1.5,
        borderColor: color,
        borderTopRightRadius: 20,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function PortfolioCard({ item, index = 0 }) {
  const { theme, mode } = useTheme();
  const styles = createStyles(theme);
  const anim = useFadeSlideUp({ delay: index * 80 });
  const { onPressIn, onPressOut, style: pressStyle } = usePressScale();
  const isDark = mode === 'dark';

  const tilt = useRef(new Animated.Value(0)).current;

  const handlePressIn = (e) => {
    onPressIn?.(e);
    Animated.timing(tilt, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (e) => {
    onPressOut?.(e);
    Animated.spring(tilt, {
      toValue: 0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const rotateX = tilt.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1.5deg'],
  });
  const scaleTilt = tilt.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.99],
  });

  // ✅ CTA secondary color — ikut theme
  const textColor = theme?.text || '#ffffff';
  const bgColor = theme?.bg || '#000000';

  return (
    <Animated.View style={anim.style}>
      <Animated.View
        style={[
          pressStyle,
          { transform: [...(pressStyle.transform || []), { rotateX }, { scale: scaleTilt }] },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.card}
        >
          {/* Shimmer — hanya di dark */}
          {isDark && (
            <ShimmerSweep color={bgColor} delay={300 + index * 100} />
          )}

          {/* Corner + Accent — hanya di dark biar light bersih */}
          {isDark && <CornerAccent color={textColor} />}
          {isDark && <AccentLine color={textColor} delay={200 + index * 80} />}

          {/* Head */}
          <View style={styles.head}>
            <Text style={styles.year}>{item.tahun}</Text>
            <View style={styles.statusPill}>
              <StatusDot color={theme?.text || '#ffffff'} />
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.judul}>{item.judul}</Text>
          <Text style={styles.deskripsi}>{item.deskripsi}</Text>

          <View style={styles.divider} />

          <View style={styles.techRow}>
            {(item.teknologi || []).map((t, i) => (
              <TechChip
                key={t}
                label={t}
                index={i}
                styles={styles}
              />
            ))}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   STYLES — semua ikut theme
   ═══════════════════════════════════════════ */
const createStyles = (t) => {
  const colors = {
    bg: t?.bg || '#000000',
    surface: t?.surface || '#0d0d0d',
    surfaceAlt: t?.surfaceAlt || '#141414',
    text: t?.text || '#ffffff',
    textMute: t?.textMute || '#666666',
    textBody: t?.textBody || '#b3b3b3',
    border: t?.border || '#1f1f1f',
    borderLight: t?.borderLight || '#141414',
    bgSoft: t?.bgSoft || '#050505',
  };

  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginBottom: 14,
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    head: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    year: {
      fontSize: 11,
      color: colors.textMute,
      fontWeight: '700',
      letterSpacing: 1.5,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textBody,
      letterSpacing: 0.5,
    },
    judul: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
      marginBottom: 8,
    },
    deskripsi: {
      fontSize: 13,
      color: colors.textBody,
      lineHeight: 20,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 14,
    },
    techRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tech: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textBody,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 6,
    },
  });
};