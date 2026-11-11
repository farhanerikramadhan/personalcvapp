// utils/animations.js
import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/* ============================================================
 *  CONSTANTS
 * ============================================================ */
export const DURATION = {
  fast: 180,
  normal: 300,
  slow: 500,
  extraSlow: 800,
};

export const EASING = {
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.ease),
  linear: Easing.linear,
  bounce: Easing.bounce,
};

export const SPRING = {
  gentle: { friction: 7, tension: 60, useNativeDriver: true },
  snappy: { friction: 6, tension: 100, useNativeDriver: true },
  bouncy: { friction: 4, tension: 120, useNativeDriver: true },
};

/* ============================================================
 *  HELPER — jaminan AnimatedInterpolation
 * ============================================================ */
const toInterp = (value) =>
  value && typeof value.interpolate === 'function'
    ? value.interpolate({
        inputRange: [0, 0.5, 1, 1.5, 2],
        outputRange: [0, 0.5, 1, 1.5, 2],
      })
    : value;

/* ============================================================
 *  HELPERS (non-hook)
 * ============================================================ */
export const createSpring = (value, toValue, preset = SPRING.gentle) =>
  Animated.spring(value, { toValue, ...preset });

export const fadeInUp = (value, duration = DURATION.slow, delay = 0) =>
  Animated.sequence([
    Animated.delay(delay),
    Animated.timing(value, {
      toValue: 1,
      duration,
      easing: EASING.out,
      useNativeDriver: true,
    }),
  ]);

export const pulse = (value, scale = 1.08) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: scale,
        duration: DURATION.extraSlow,
        easing: EASING.inOut,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: DURATION.extraSlow,
        easing: EASING.inOut,
        useNativeDriver: true,
      }),
    ])
  );

export const shimmer = (value, duration = 2000) =>
  Animated.loop(
    Animated.timing(value, {
      toValue: 1,
      duration,
      easing: EASING.linear,
      useNativeDriver: true,
    })
  );

export const fadeTransition = (value) =>
  Animated.sequence([
    Animated.timing(value, {
      toValue: 0.6,
      duration: DURATION.fast,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: DURATION.normal,
      useNativeDriver: true,
    }),
  ]);

export const staggerFadeIn = (values, { duration = DURATION.slow, stagger = 80 } = {}) =>
  Animated.stagger(
    stagger,
    values.map((v) =>
      Animated.timing(v, {
        toValue: 1,
        duration,
        easing: EASING.out,
        useNativeDriver: true,
      })
    )
  );

/* ============================================================
 *  HOOKS
 * ============================================================ */

/**
 * ✅ FIX: `translateY` dan `opacity` di-interpolate
 * agar render pertama (sebelum animasi) tidak crash.
 */
export function useFadeSlideUp({ delay = 0, duration = DURATION.slow, offset = 30 } = {}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offset)).current;

  // ✅ interpolate translateY agar tidak crash saat render
  const translateYInterp = translateY.interpolate({
    inputRange: [0, offset, offset * 2],
    outputRange: [0, offset, offset * 2],
  });

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: EASING.out,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, { toValue: 0, ...SPRING.gentle }),
      ]),
    ]).start();
  }, []);

  return {
    opacity,
    translateY: translateYInterp,
    style: { opacity, transform: [{ translateY: translateYInterp }] },
  };
}

export function usePressScale(pressedScale = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const scaleInterp = toInterp(scale);

  const onPressIn = () =>
    Animated.spring(scale, { toValue: pressedScale, ...SPRING.snappy }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, ...SPRING.gentle }).start();

  return {
    scale: scaleInterp,
    onPressIn,
    onPressOut,
    style: { transform: [{ scale: scaleInterp }] },
  };
}

export function useFadeIn({ delay = 0, duration = DURATION.slow } = {}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        easing: EASING.out,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, style: { opacity } };
}

export function useStaggeredFadeIn(count, { delay = 0, stagger = 80, duration = DURATION.slow } = {}) {
  const values = useRef(
    Array.from({ length: count }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.stagger(
        stagger,
        values.map((v) =>
          Animated.timing(v, {
            toValue: 1,
            duration,
            easing: EASING.out,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  }, [count]);

  return values;
}

export function useScaleIn({ delay = 0, from = 0.8 } = {}) {
  const scale = useRef(new Animated.Value(from)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const scaleInterp = toInterp(scale);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, ...SPRING.bouncy }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: DURATION.normal,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return {
    scale: scaleInterp,
    opacity,
    style: { opacity, transform: [{ scale: scaleInterp }] },
  };
}

export function useShake() {
  const translateX = useRef(new Animated.Value(0)).current;

  const shake = () => {
    translateX.setValue(0);
    Animated.sequence([
      Animated.timing(translateX, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  return { translateX, shake, style: { transform: [{ translateX }] } };
}

export function useAnimatedProgress(target = 1, { duration = 900, delay = 100 } = {}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(progress, {
        toValue: Math.max(0, Math.min(1, target)),
        duration,
        easing: EASING.out,
        useNativeDriver: false,
      }),
    ]).start();
  }, [target]);

  const widthPercent = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return { progress, widthPercent, style: { width: widthPercent } };
}