// ProgressBar.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAnimatedProgress } from '../utils/animations';

/* ═══════════════════════════════════════════
   COUNT-UP PERCENT — angka naik 0 → target
   ═══════════════════════════════════════════ */
function CountUpPercent({ target, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    const listener = anim.addListener(({ value: v }) =>
      setDisplay(Math.round(v * target))
    );
    Animated.timing(anim, {
      toValue: 1,
      duration: 1200,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(listener);
  }, [anim, target]);

  return <Text style={style}>{display}%</Text>;
}

/* ═══════════════════════════════════════════
   SHIMMER SWEEP — kilau melintasi fill
   ═══════════════════════════════════════════ */
function ShimmerSweep({ color }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 2400,
        delay: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 400],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 50,
        backgroundColor: color,
        opacity: 0.45,
        transform: [{ translateX }, { skewX: '-25deg' }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   GLOWING TIP — titik glow di ujung fill
   ═══════════════════════════════════════════ */
function GlowingTip({ color }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return (
    <>
      {/* Inner bright dot */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: '#fff',
          marginTop: -3,
          marginRight: -3,
          opacity: 0.9,
        }}
      />
      {/* Outer pulse ring */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -6,
          top: '50%',
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: color,
          marginTop: -6,
          opacity,
          transform: [{ scale }],
        }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   ANIMATED STRIPES — garis diagonal bergerak
   ═══════════════════════════════════════════ */
function AnimatedStripes({ color }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -8,
        bottom: -8,
        left: -20,
        right: -20,
        opacity: 0.18,
        transform: [{ translateX }, { rotate: '25deg' }],
      }}
    >
      {Array.from({ length: 40 }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: i * 16,
            top: 0,
            bottom: 0,
            width: 8,
            backgroundColor: color,
          }}
        />
      ))}
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function ProgressBar({ label, percent, color }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { widthPercent } = useAnimatedProgress(percent / 100);

  const fillColor = color || theme.text;

  // entrance anims
  const rowAnim = useRef(new Animated.Value(0)).current;
  const trackAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(rowAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(trackAnim, {
        toValue: 1,
        duration: 500,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [rowAnim, trackAnim]);

  const rowOpacity = rowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const rowTranslateY = rowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  const trackOpacity = trackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const trackScaleX = trackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  return (
    <View style={styles.wrapper}>
      {/* Label row */}
      <Animated.View
        style={[
          styles.row,
          { opacity: rowOpacity, transform: [{ translateY: rowTranslateY }] },
        ]}
      >
        <Text style={styles.label}>{label}</Text>
        <View style={styles.percentPill}>
          <CountUpPercent target={percent} style={styles.percent} />
        </View>
      </Animated.View>

      {/* Track */}
      <Animated.View
        style={[
          styles.track,
          {
            opacity: trackOpacity,
            transform: [{ scaleX: trackScaleX }],
          },
        ]}
      >
        {/* Fill */}
        <Animated.View
          style={[
            styles.fill,
            { width: widthPercent, backgroundColor: fillColor },
          ]}
        >
          {/* Animated stripes inside fill */}
          <AnimatedStripes color={theme.bg} />

          {/* Shimmer sweep */}
          <ShimmerSweep color={theme.bg} />

          {/* Glowing tip at the end */}
          <GlowingTip color={fillColor} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const createStyles = (t) =>
  StyleSheet.create({
    wrapper: { marginVertical: 12 },

    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    label: {
      fontSize: 13,
      color: t.textBody,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
    percentPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: t.bgSoft || t.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.borderLight,
    },
    percent: {
      fontSize: 12,
      fontWeight: '800',
      color: t.text,
      letterSpacing: -0.2,
    },

    track: {
      height: 8,
      backgroundColor: t.borderLight,
      borderRadius: 4,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 4,
      overflow: 'hidden',
    },
  });