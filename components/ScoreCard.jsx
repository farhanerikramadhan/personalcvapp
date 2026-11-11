// ScoreCard.jsx
import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useFadeSlideUp, useScaleIn } from '../utils/animations';
import ProgressBar from './ProgressBar';

/* ═══════════════════════════════════════════
   COUNT-UP SCORE
   ═══════════════════════════════════════════ */
function CountUpScore({ target, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = React.useState(0);
  const safe = Number(target) || 0;

  useEffect(() => {
    const listener = anim.addListener(({ value: v }) =>
      setDisplay(Math.round(v * safe))
    );
    Animated.timing(anim, {
      toValue: 1,
      duration: 1400,
      delay: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(listener);
  }, [anim, safe]);

  return <Text style={style}>{display}</Text>;
}

/* ═══════════════════════════════════════════
   PULSE GLOW
   ═══════════════════════════════════════════ */
function PulseGlow({ style }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.04, 0.12],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { opacity, transform: [{ scale }] }]}
    />
  );
}

/* ═══════════════════════════════════════════
   FLOATING PARTICLES — fixed: useMemo
   ═══════════════════════════════════════════ */
function FloatingParticles({ count = 10 }) {
  // ✅ FIX: useMemo agar panjang anims = count
  const anims = useMemo(
    () => Array.from({ length: count }).map(() => new Animated.Value(0)),
    [count]
  );

  const particles = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1.5 + Math.random() * 3,
        duration: 3500 + Math.random() * 4000,
        delay: Math.random() * 2500,
        drift: (Math.random() - 0.5) * 30,
      })),
    [count]
  );

  useEffect(() => {
    particles.forEach((p, i) => {
      const anim = anims[i];
      if (!anim) return;
      const loop = () => {
        anim.setValue(0);
        Animated.timing(anim, {
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
        const anim = anims[i];
        if (!anim) return null;
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -p.drift * 2],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.1, 0.5, 0.1],
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
              backgroundColor: '#FFFFFF',
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
   SHIMMER SWEEP
   ═══════════════════════════════════════════ */
function ShimmerSweep() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 2800,
        delay: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 420],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 100,
        backgroundColor: '#FFFFFF',
        opacity: 0.15,
        transform: [{ translateX }, { skewX: '-20deg' }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   GRADE RING
   ═══════════════════════════════════════════ */
function GradeRing({ grade }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, [anim]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  return (
    <View style={stylesStatic.gradeRingWrap}>
      <Animated.View
        style={[
          stylesStatic.gradeRing,
          { opacity, transform: [{ scale }] },
        ]}
      />
      <Text style={stylesStatic.gradeText}>{grade}</Text>
    </View>
  );
}

/* ═══════════════════════════════════════════
   INFO ROW
   ═══════════════════════════════════════════ */
function InfoRow({ label, value, index, styles }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: 200 + index * 80,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });

  return (
    <Animated.View
      style={[
        styles.infoRow,
        { opacity, transform: [{ translateX }] },
      ]}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function ScoreCard({
  identitas = {},
  currentScore = { nilai: 0, grade: '-', totalLP: 0 },
  learningProgress = [],
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const scoreAnim = useScaleIn({ delay: 200, from: 0.9 });
  const infoAnim = useFadeSlideUp({ delay: 400 });
  const progressAnim = useFadeSlideUp({ delay: 600 });

  const safe = Array.isArray(learningProgress) ? learningProgress : [];

  const infoItems = [
    { l: 'Nama', v: identitas.nama },
    { l: 'NIM', v: identitas.nim },
    { l: 'Mata Kuliah', v: identitas.mk },
    { l: 'Dosen', v: identitas.dosen },
  ];

  // ✅ FIX: gradient selalu gelap (karena teks putih), konsisten di light & dark
  const scoreGradient = ['#1a1a1a', '#000000'];

  return (
    <View style={styles.container}>
      {/* BIG SCORE HERO */}
      <Animated.View style={scoreAnim.style}>
        <LinearGradient
          colors={scoreGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreHero}
        >
          <PulseGlow style={styles.glowTopRight} />
          <PulseGlow style={styles.glowBottomLeft} />
          <FloatingParticles count={12} />
          <ShimmerSweep />

          <Text style={styles.scoreEyebrow}>CURRENT SCORE</Text>
          <CountUpScore
            target={currentScore.nilai}
            style={styles.scoreValue}
          />

          <View style={styles.scoreMeta}>
            <View style={styles.scoreMetaItem}>
              <Text style={styles.scoreMetaLabel}>GRADE</Text>
              <GradeRing grade={currentScore.grade} />
            </View>

            <View style={styles.scoreMetaDivider} />

            <View style={styles.scoreMetaItem}>
              <Text style={styles.scoreMetaLabel}>TOTAL LP</Text>
              <Text style={styles.scoreMetaValue}>
                {currentScore.totalLP}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* INFO CARD */}
      <Animated.View style={[styles.card, infoAnim.style]}>
        <Text style={styles.eyebrow}>// AKADEMIK</Text>
        <Text style={styles.cardTitle}>Informasi</Text>

        {infoItems.map((it, i) => (
          <InfoRow
            key={it.l}
            label={it.l}
            value={it.v}
            index={i}
            styles={styles}
          />
        ))}
      </Animated.View>

      {/* PROGRESS CARD */}
      <Animated.View style={[styles.card, progressAnim.style]}>
        <Text style={styles.eyebrow}>// PROGRESS</Text>
        <Text style={styles.cardTitle}>Learning</Text>

        {safe.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada progress.</Text>
        ) : (
          safe.map((item) => (
            <ProgressBar
              key={item.id}
              label={item.label}
              percent={item.persen}
              color={theme?.text || '#ffffff'}
            />
          ))
        )}
      </Animated.View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   STATIC STYLES
   ═══════════════════════════════════════════ */
const stylesStatic = StyleSheet.create({
  gradeRingWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  gradeRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  gradeText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -0.3,
  },
});

/* ═══════════════════════════════════════════
   MAIN STYLES
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
  };

  return StyleSheet.create({
    container: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 40 },

    scoreHero: {
      borderRadius: 24,
      padding: 32,
      marginBottom: 16,
      alignItems: 'center',
      overflow: 'hidden',
    },
    glowTopRight: {
      position: 'absolute',
      top: -60,
      right: -60,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: '#FFFFFF',
    },
    glowBottomLeft: {
      position: 'absolute',
      bottom: -80,
      left: -60,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: '#FFFFFF',
    },
    scoreEyebrow: {
      fontSize: 11,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.7)',
      letterSpacing: 3,
    },
    scoreValue: {
      fontSize: 88,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -3,
      marginVertical: 4,
    },
    scoreMeta: {
      flexDirection: 'row',
      marginTop: 8,
      alignItems: 'center',
    },
    scoreMetaItem: { alignItems: 'center', paddingHorizontal: 24 },
    scoreMetaLabel: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '700',
      letterSpacing: 1.5,
    },
    scoreMetaValue: {
      fontSize: 20,
      color: '#FFFFFF',
      fontWeight: '800',
      marginTop: 6,
    },
    scoreMetaDivider: {
      width: 1,
      height: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },

    card: {
      backgroundColor: colors.surface,
      padding: 22,
      borderRadius: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    eyebrow: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMute,
      letterSpacing: 2,
      marginBottom: 6,
    },
    cardTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 18,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      fontSize: 13,
      color: colors.textMute,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '700',
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMute,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingVertical: 16,
    },
  });
};