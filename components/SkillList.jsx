// SkillList.jsx
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useFadeSlideUp, useAnimatedProgress } from '../utils/animations';

/* ═══════════════════════════════════════════
   COUNT-UP PERCENT
   ═══════════════════════════════════════════ */
function CountUpPercent({ target, style }) {
  const safeTarget = Math.max(0, Math.min(100, Number(target) || 0));
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const listener = anim.addListener(({ value: v }) =>
      setDisplay(Math.round(v * safeTarget))
    );
    Animated.timing(anim, {
      toValue: 1,
      duration: 1000,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(listener);
  }, [anim, safeTarget]);

  return <Text style={style}>{display}%</Text>;
}

/* ═══════════════════════════════════════════
   SHIMMER SWEEP
   ═══════════════════════════════════════════ */
function ShimmerSweep({ color }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 2200,
        delay: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 300],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 40,
        backgroundColor: color,
        opacity: 0.4,
        transform: [{ translateX }, { skewX: '-25deg' }],
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   GLOWING TIP
   ═══════════════════════════════════════════ */
function GlowingTip({ color }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: color,
          marginTop: -2.5,
          marginRight: -2.5,
          opacity: 0.95,
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -5,
          top: '50%',
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          marginTop: -5,
          opacity,
          transform: [{ scale }],
        }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   RANK BADGE
   ═══════════════════════════════════════════ */
function RankBadge({ rank }) {
  if (rank > 3) return null;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
  return (
    <View style={stylesStatic.rankBadge}>
      <Text style={stylesStatic.rankEmoji}>{medal}</Text>
    </View>
  );
}

/* ═══════════════════════════════════════════
   SKILL ROW
   ═══════════════════════════════════════════ */
function SkillRow({ item, index, theme, styles, isDark }) {
  const safeLevel = Math.max(0, Math.min(100, Number(item?.level) || 0));
  const anim = useFadeSlideUp({ delay: index * 70 });
  const { widthPercent } = useAnimatedProgress(safeLevel / 100, {
    delay: 250 + index * 70,
  });

  const rank = index + 1;

  return (
    <Animated.View style={[styles.row, anim.style]}>
      <View style={styles.rowHead}>
        <View style={styles.nameWrap}>
          <Text style={styles.indexNum}>
            {String(index + 1).padStart(2, '0')}
          </Text>
          <Text style={styles.nama} numberOfLines={1}>
            {item?.nama || '-'}
          </Text>
        </View>
        <View style={styles.rightWrap}>
          <RankBadge rank={rank} />
          <CountUpPercent target={safeLevel} style={styles.persen} />
        </View>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthPercent }]}>
          {/* Shimmer hanya di dark */}
          {isDark && <ShimmerSweep color={theme?.bg || '#000000'} />}
          {isDark && <GlowingTip color={theme?.text || '#ffffff'} />}
        </Animated.View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.kategoriPill}>
          <Text style={styles.kategori}>{item?.kategori || '-'}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function SkillList({ data, ListHeaderComponent }) {
  const { theme, mode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDark = mode === 'dark';
  const safe = Array.isArray(data) ? data : [];

  const sorted = useMemo(
    () =>
      [...safe].sort(
        (a, b) => (Number(b?.level) || 0) - (Number(a?.level) || 0)
      ),
    [safe]
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item, idx) =>
        item?.id != null
          ? String(item.id)
          : item?.nama
          ? `nama-${item.nama}`
          : `skill-${idx}`
      }
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: 0,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Text style={styles.emptyText}>Belum ada skill terdaftar.</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <View style={{ paddingHorizontal: 20 }}>
          <SkillRow
            item={item}
            index={index}
            theme={theme}
            styles={styles}
            isDark={isDark}
          />
        </View>
      )}
    />
  );
}

/* ═══════════════════════════════════════════
   STATIC STYLES
   ═══════════════════════════════════════════ */
const stylesStatic = StyleSheet.create({
  rankBadge: {
    marginRight: 6,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankEmoji: {
    fontSize: 14,
  },
});

/* ═══════════════════════════════════════════
   MAIN STYLES — ikut theme
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
    row: {
      backgroundColor: colors.surface,
      padding: 18,
      borderRadius: 18,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    nameWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
    },
    indexNum: {
      fontSize: 10,
      fontWeight: '900',
      color: colors.textMute,
      letterSpacing: 1,
      marginRight: 10,
      fontVariant: ['tabular-nums'],
    },
    nama: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    rightWrap: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    persen: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },

    track: {
      height: 7,
      backgroundColor: colors.border,
      borderRadius: 3.5,
      overflow: 'hidden',
      marginBottom: 10,
    },
    fill: {
      height: '100%',
      backgroundColor: colors.text,
      borderRadius: 3.5,
      overflow: 'hidden',
    },

    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    kategoriPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    kategori: {
      fontSize: 10,
      color: colors.textMute,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },

    emptyText: {
      fontSize: 13,
      color: colors.textMute,
      fontStyle: 'italic',
    },
  });
};