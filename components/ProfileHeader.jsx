// ProfileHeader.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useScaleIn, useFadeSlideUp } from '../utils/animations';

/* ═══════════════════════════════════════════
   ROTATING RING — cincin berputar di avatar
   ═══════════════════════════════════════════ */
function RotatingRing({ theme, size = 140 }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      spin.setValue(0);
      Animated.timing(spin, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ringSize = size + 24;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: ringSize,
        height: ringSize,
        borderRadius: ringSize / 2,
        borderWidth: 1.5,
        borderColor: theme.textMute || theme.text,
        opacity: 0.35,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        transform: [{ rotate }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   PULSE GLOW — glow bernafas di belakang avatar
   ═══════════════════════════════════════════ */
function PulseGlow({ color, size = 160 }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.15],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.2],
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
   SPARKLES — butiran kecil di sekitar avatar
   ═══════════════════════════════════════════ */
function Sparkles({ color, count = 8 }) {
  const anims = useRef(
    Array.from({ length: count }).map(() => new Animated.Value(0))
  ).current;

  const positions = React.useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 72 + Math.random() * 12;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          size: 2 + Math.random() * 3,
          delay: Math.random() * 2000,
          duration: 1800 + Math.random() * 1400,
        };
      }),
    [count]
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
          outputRange: [0, 0.85, 0],
        });
        const scale = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.4, 1.3, 0.4],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              marginLeft: p.x,
              marginTop: p.y,
              backgroundColor: color,
              opacity,
              transform: [{ scale }],
            }}
          />
        );
      })}
    </View>
  );
}

/* ═══════════════════════════════════════════
   SHIMMER TEXT — kilau bergerak di nama
   ═══════════════════════════════════════════ */
function ShimmerText({ children, style, shimmerColor, bgColor }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      shimmer.setValue(0);
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 3200,
        delay: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 260],
  });

  return (
    <View style={{ overflow: 'hidden' }}>
      <Text style={style}>{children}</Text>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 80,
          backgroundColor: shimmerColor || bgColor,
          opacity: 0.35,
          transform: [{ translateX }, { skewX: '-20deg' }],
        }}
      />
    </View>
  );
}

/* ═══════════════════════════════════════════
   BLINKING DOT — dot berkedip di NIM pill
   ═══════════════════════════════════════════ */
function BlinkingDot({ color }) {
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
        marginRight: 8,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   BREATHING DECOR — lingkaran dekoratif bernafas
   ═══════════════════════════════════════════ */
function BreathingDecor({ style, color }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, [anim]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          backgroundColor: color,
          transform: [{ scale }, { translateY }],
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function ProfileHeader({ data }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const avatarAnim = useScaleIn({ delay: 100, from: 0.85 });
  const nameAnim = useFadeSlideUp({ delay: 350 });
  const pillAnim = useFadeSlideUp({ delay: 550 });
  const tagAnim = useFadeSlideUp({ delay: 750 });

  const safeName = data?.nama || 'Nama Lengkap';
  const safeNim = data?.nim || '-';
  const safeProfesi = data?.profesi || '';

  return (
    <View style={styles.container}>
      {/* Breathing decorative circles */}
      <BreathingDecor style={styles.decor1} color={theme.accentSoft} />
      <BreathingDecor style={styles.decor2} color={theme.bgSoft} />

      {/* Avatar block with rings, glow, sparkles */}
      <Animated.View style={[styles.avatarWrap, avatarAnim.style]}>
        {/* Sparkles around avatar */}
        <Sparkles color={theme.textMute || theme.text} count={10} />

        {/* Pulsing glow */}
        <PulseGlow color={theme.text} size={170} />

        {/* Rotating ring */}
        <RotatingRing theme={theme} size={124} />

        {/* Avatar itself */}
        <View style={styles.avatarFrame}>
          <Image
            source={require('../assets/profile.jpg')}
            style={styles.avatar}
            accessibilityLabel={`Foto profil ${safeName}`}
          />
        </View>
      </Animated.View>

      {/* Name with shimmer */}
      <Animated.View style={[{ alignItems: 'center' }, nameAnim.style]}>
        <ShimmerText
          style={styles.name}
          shimmerColor={theme.bg}
          bgColor={theme.text}
        >
          {safeName}
        </ShimmerText>

        <View style={styles.nimPill}>
          <BlinkingDot color={theme.success || '#22c55e'} />
          <Text style={styles.nimText}>NIM {safeNim}</Text>
        </View>
      </Animated.View>

      {/* Tagline */}
      {safeProfesi ? (
        <Animated.View style={[styles.taglineWrap, tagAnim.style]}>
          <View style={styles.taglineRule} />
          <Text style={styles.tagline}>{safeProfesi}</Text>
          <View style={styles.taglineRule} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    container: {
      backgroundColor: t.bg,
      paddingTop: 60,
      paddingBottom: 40,
      alignItems: 'center',
      overflow: 'hidden',
    },

    // Breathing decor circles
    decor1: {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      top: -180,
      right: -100,
      opacity: 0.6,
    },
    decor2: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      top: 50,
      left: -100,
      opacity: 0.8,
    },

    // Avatar block
    avatarWrap: {
      width: 160,
      height: 160,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarFrame: {
      width: 124,
      height: 124,
      borderRadius: 62,
      padding: 3,
      backgroundColor: t.bg,
      shadowColor: t.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 12,
      borderWidth: 1,
      borderColor: t.border,
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: 60,
    },

    // Name
    name: {
      fontSize: 28,
      fontWeight: '800',
      color: t.text,
      marginTop: 20,
      letterSpacing: -0.5,
      textAlign: 'center',
    },

    // NIM pill
    nimPill: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingHorizontal: 14,
      paddingVertical: 6,
      backgroundColor: t.bgSoft,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
    },
    nimText: {
      fontSize: 12,
      color: t.textBody,
      fontWeight: '600',
      letterSpacing: 0.5,
    },

    // Tagline with rules
    taglineWrap: {
      marginTop: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    taglineRule: {
      width: 24,
      height: 1,
      backgroundColor: t.border,
    },
    tagline: {
      fontSize: 11,
      color: t.textMute,
      fontWeight: '700',
      letterSpacing: 2.4,
      textTransform: 'uppercase',
    },
  });