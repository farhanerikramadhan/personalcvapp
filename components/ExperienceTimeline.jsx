// components/ExperienceTimeline.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useFadeSlideUp, SPRING } from '../utils/animations';

const RAIL_WIDTH = 44;
const DOT_SIZE = 14;
const DOT_LEFT = (RAIL_WIDTH - DOT_SIZE) / 2;

/* ═══════════════════════════════════════════
   PULSING DOT
   ═══════════════════════════════════════════ */
function PulsingDot({ isFirst, isLast, theme, delay = 0 }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0)).current;

  // ✅ FIX: interpolate scaleIn agar Android tidak crash
  const scaleInInterp = scaleIn.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [0, 0.5, 1, 1.5, 2],
  });

  useEffect(() => {
    // scale in
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleIn, { toValue: 1, ...SPRING.gentle }),
    ]).start();

    // pulse loop (only first dot)
    if (isFirst) {
      const timer = setTimeout(() => {
        const loop = () => {
          Animated.sequence([
            Animated.timing(pulse, {
              toValue: 1,
              duration: 1400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulse, {
              toValue: 0,
              duration: 1400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start(() => loop());
        };
        loop();
      }, delay + 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  const dotColor = isFirst
    ? theme.accent || theme.text
    : isLast
    ? theme.textMute
    : theme.text;

  return (
    <View style={stylesStatic.dotWrap}>
      {/* Pulse ring (first only) */}
      {isFirst && (
        <Animated.View
          pointerEvents="none"
          style={[
            stylesStatic.pulseRing,
            {
              backgroundColor: dotColor,
              opacity: pulseOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
      )}

      {/* Dot */}
      <Animated.View
        style={[
          stylesStatic.dot,
          {
            backgroundColor: dotColor,
            borderColor: theme.bg,
            transform: [{ scale: scaleInInterp }],  // ✅ sudah interpolasi
          },
        ]}
      />
    </View>
  );
}

/* ═══════════════════════════════════════════
   ANIMATED RAIL
   ═══════════════════════════════════════════ */
function AnimatedRail({ theme }) {
  const grow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(grow, {
      toValue: 1,
      duration: 1200,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const scaleY = grow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: RAIL_WIDTH / 2 - StyleSheet.hairlineWidth / 2,
        top: 12,
        bottom: 12,
        width: StyleSheet.hairlineWidth,
        backgroundColor: theme.borderLight,
        transform: [{ scaleY }],
        transformOrigin: 'top',
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   TIMELINE ITEM
   ═══════════════════════════════════════════ */
function TimelineItem({ item, idx, isFirst, isLast, theme }) {
  const styles = createStyles(theme);
  const anim = useFadeSlideUp({ delay: 300 + idx * 120 });

  const period = item.tahun ?? item.period;
  const title = item.judul ?? item.title;
  const role = item.peran ?? item.role;
  const desc = item.deskripsi ?? item.description;

  return (
    <View style={styles.row}>
      <View style={styles.railCol}>
        <PulsingDot
          isFirst={isFirst}
          isLast={isLast}
          theme={theme}
          delay={300 + idx * 120}
        />
      </View>

      <Animated.View
        style={[styles.content, !isLast && styles.contentGap, anim.style]}
      >
        <View style={styles.card}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>
              {'O' + (idx + 1)}
            </Text>
          </View>

          {period ? <Text style={styles.period}>{period}</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {role ? <Text style={styles.role}>{role}</Text> : null}
          {desc ? <Text style={styles.desc}>{desc}</Text> : null}
        </View>
      </Animated.View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function ExperienceTimeline({ data = [] }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!data.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Belum ada perjalanan untuk ditampilkan.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedRail theme={theme} />

      {data.map((item, idx) => {
        const isLast = idx === data.length - 1;
        const isFirst = idx === 0;
        return (
          <TimelineItem
            key={item.id ?? idx}
            item={item}
            idx={idx}
            isFirst={isFirst}
            isLast={isLast}
            theme={theme}
          />
        );
      })}
    </View>
  );
}

/* ═══════════════════════════════════════════
   STATIC STYLES
   ═══════════════════════════════════════════ */
const stylesStatic = StyleSheet.create({
  dotWrap: {
    position: 'absolute',
    top: 8,
    left: DOT_LEFT,
    width: DOT_SIZE,
    height: DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});

/* ═══════════════════════════════════════════
   MAIN STYLES
   ═══════════════════════════════════════════ */
const createStyles = (t) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      paddingTop: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    railCol: {
      width: RAIL_WIDTH,
      alignItems: 'flex-start',
      position: 'relative',
    },
    content: {
      flex: 1,
      paddingBottom: 4,
    },
    contentGap: {
      paddingBottom: 20,
    },
    card: {
      backgroundColor: t.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.borderLight,
      shadowColor: t.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
      position: 'relative',
    },
    indexBadge: {
      position: 'absolute',
      top: 10,
      right: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: t.bgSoft || t.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.borderLight,
    },
    indexText: {
      fontSize: 9,
      fontWeight: '900',
      color: t.textMute,
      letterSpacing: 1,
      fontVariant: ['tabular-nums'],
    },
    period: {
      fontSize: 10,
      fontWeight: '800',
      color: t.textMute,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      marginBottom: 6,
      paddingRight: 40,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: t.text,
      letterSpacing: -0.2,
      lineHeight: 21,
    },
    role: {
      fontSize: 12,
      fontWeight: '600',
      color: t.textBody,
      marginTop: 4,
      marginBottom: 6,
    },
    desc: {
      fontSize: 13,
      color: t.textBody,
      lineHeight: 20,
      marginTop: 4,
    },
    emptyWrap: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 13,
      color: t.textMute,
      fontStyle: 'italic',
    },
  });