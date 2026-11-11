// components/FadeInView.jsx
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import { EASING, SPRING } from '../utils/animations';

export default function FadeInView({
  children,
  delay = 0,
  duration = 500,
  style,
  from = 'bottom',
  distance = 30,
  scaleFrom = 0.9,
  rotate = 0,
  bouncy = false,
  easing,
  trigger,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  // ✅ FIX: interpolate translate
  const translateInterp = translate.interpolate({
    inputRange: [-distance, 0, distance],
    outputRange: [-distance, 0, distance],
    extrapolate: 'clamp',
  });

  // ✅ FIX: interpolate scale
  const scaleInterp = scale.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [0, 0.5, 1, 1.5, 2],
    extrapolate: 'clamp',
  });

  const getInitial = () => {
    switch (from) {
      case 'top':
        return { t: -distance, s: 1 };
      case 'left':
        return { t: -distance, s: 1 };
      case 'right':
        return { t: distance, s: 1 };
      case 'scale':
        return { t: 0, s: scaleFrom };
      case 'zoom':
        return { t: 0, s: scaleFrom };
      case 'fade':
        return { t: 0, s: 1 };
      case 'bottom':
      default:
        return { t: distance, s: 1 };
    }
  };

  useEffect(() => {
    const { t, s } = getInitial();

    opacity.setValue(0);
    translate.setValue(t);
    scale.setValue(s);
    rotation.setValue(rotate);

    const translateAnim = bouncy
      ? Animated.spring(translate, {
          toValue: 0,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        })
      : Animated.timing(translate, {
          toValue: 0,
          duration,
          easing: easing || EASING.out,
          useNativeDriver: true,
        });

    const scaleAnim = Animated.spring(scale, {
      toValue: 1,
      ...(bouncy ? { friction: 5, tension: 90 } : SPRING.gentle),
    });

    const rotateAnim = Animated.timing(rotation, {
      toValue: 0,
      duration,
      easing: EASING.out,
      useNativeDriver: true,
    });

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: easing || EASING.out,
          useNativeDriver: true,
        }),
        translateAnim,
        from === 'scale' || from === 'zoom' ? scaleAnim : null,
        rotate !== 0 ? rotateAnim : null,
      ].filter(Boolean)),
    ]).start();
  }, [trigger, delay, duration, from, distance, scaleFrom, bouncy, rotate]);

  const rotationDeg = rotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
    extrapolate: 'clamp',
  });

  const isHorizontal = from === 'left' || from === 'right';

  // ✅ FIX: pakai translateInterp, bukan translate
  const transform = [
    isHorizontal ? { translateX: translateInterp } : { translateY: translateInterp },
    { scale: scaleInterp },
    { rotate: rotationDeg },
  ];

  return (
    <Animated.View style={[style, { opacity, transform }]}>
      {children}
    </Animated.View>
  );
}

export function Stagger({
  children,
  baseDelay = 0,
  step = 80,
  duration = 500,
  from = 'bottom',
  distance = 30,
  style,
}) {
  const items = React.Children.toArray(children);

  return (
    <>
      {items.map((child, i) => (
        <FadeInView
          key={i}
          delay={baseDelay + i * step}
          duration={duration}
          from={from}
          distance={distance}
          style={style}
        >
          {child}
        </FadeInView>
      ))}
    </>
  );
}