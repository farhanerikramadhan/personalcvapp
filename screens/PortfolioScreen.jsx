// screens/PortfolioScreen.jsx — Gaya Kotak · Monokrom · Fix warna dark mode
import React, {
  useMemo, useState, useEffect, useRef, useCallback,
} from 'react';
import {
  ScrollView, View, Text, Pressable, StyleSheet,
  Animated, Easing, useWindowDimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import portfolio from '../data/portfolio.json';
import profile from '../data/profile.json';
import { useTheme } from '../theme/ThemeContext';

const SERIF = Platform.select({
  ios: 'Georgia', android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});
const ND = Platform.OS !== 'web';

/* ═══════════════════════════════════════════
   PALET — semua warna teks dari sini
   ═══════════════════════════════════════════ */
function getMono(theme) {
  const dark = theme.mode === 'dark';
  return {
    dark,
    gold:       dark ? '#B8B8B8' : '#5A5A5A',
    goldBright: dark ? '#F5F5F5' : '#1A1A1A',
    goldDeep:   dark ? '#7A7A7A' : '#3A3A3A',
    ink:        dark ? '#F5F5F5' : '#0F0F0F',
    inkSoft:    dark ? '#C8C8C8' : '#3A3A3A',
    inkOnGold:  dark ? '#0A0A0A' : '#F5F5F5',
    paper:      dark ? '#080808' : '#FCFCFC',
    surface:    dark ? '#101010' : '#FFFFFF',
    surfaceAlt: dark ? '#181818' : '#F4F4F4',
    line:       dark ? '#3A3A3A' : '#D9D9D9',
    lineSoft:   dark ? '#2A2A2A' : '#E8E8E8',
    accentDim:  dark ? '#A8A8A8' : '#8A8A8A',
    border:     dark ? '#1F1F1F' : '#E8E8E8',
    borderLight:dark ? '#141414' : '#F0F0F0',
  };
}

/* ═══════════════════════════════════════════
   HELPER ANIMASI
   ═══════════════════════════════════════════ */
function stagger(p, i, step = 0.12, span = 0.5) {
  const start = Math.min(i * step, 1 - span);
  return p.interpolate({
    inputRange: [start, start + span],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
}

function CountText({ progress, to, style, suffix = '', pad = 0 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const id = progress.addListener(({ value }) =>
      setV(Math.round(value * (Number(to) || 0)))
    );
    return () => progress.removeListener(id);
  }, [to, progress]);
  return (
    <Text style={style}>
      {String(v).padStart(pad, '0')}
      {suffix}
    </Text>
  );
}

function RevealSection({ scrollY, viewportH, style, children, threshold = 0.9, duration = 1200 }) {
  const p = useRef(new Animated.Value(0)).current;
  const yRef = useRef(null);
  const lastScroll = useRef(0);
  const done = useRef(false);

  const check = useCallback(() => {
    if (done.current || yRef.current == null) return;
    if (lastScroll.current + viewportH * threshold >= yRef.current) {
      done.current = true;
      Animated.timing(p, {
        toValue: 1, duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [viewportH]);

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      lastScroll.current = value;
      check();
    });
    return () => scrollY.removeListener(id);
  }, [check]);

  return (
    <View style={style} onLayout={(e) => { yRef.current = e.nativeEvent.layout.y; check(); }}>
      {children(p)}
    </View>
  );
}

/* ═══════════════════════════════════════════
   MASK LINE & CHAR REVEAL
   ═══════════════════════════════════════════ */
function MaskLine({ progress, index, height, children }) {
  const t = useMemo(() => stagger(progress, index, 0.14, 0.5), [progress, index]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [height * 1.15, 0] });
  return (
    <View style={{ height, overflow: 'hidden', width: '100%', alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ translateY }], opacity: t }}>{children}</Animated.View>
    </View>
  );
}

function CharReveal({ text, progress, size, mono }) {
  const chars = Array.from(String(text || ''));
  const n = Math.max(chars.length, 1);
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', height: size * 1.22, overflow: 'hidden' }}>
      {chars.map((c, i) => {
        const start = 0.16 + (i / n) * 0.42;
        const t = progress.interpolate({
          inputRange: [start, start + 0.3],
          outputRange: [0, 1], extrapolate: 'clamp',
        });
        const ty = t.interpolate({ inputRange: [0, 1], outputRange: [size * 1.2, 0] });
        return (
          <Animated.Text
            key={i}
            style={{
              fontFamily: SERIF, fontSize: size, lineHeight: size * 1.2,
              fontStyle: 'italic', fontWeight: '700',
              color: mono.ink, opacity: t,
              transform: [{ translateY: ty }],
              textShadowColor: mono.dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
              textShadowRadius: mono.dark ? 18 : 8,
              textShadowOffset: { width: 0, height: 0 },
            }}
          >
            {c}
          </Animated.Text>
        );
      })}
    </View>
  );
}

/* ═══════════════════════════════════════════
   SECTION HEAD
   ═══════════════════════════════════════════ */
function SectionHead({ title, p, mono, styles }) {
  const t = useMemo(() => stagger(p, 0, 0.1, 0.6), [p]);
  const lineW = t.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] });
  return (
    <View style={styles.sectionHead}>
      <Animated.View
        style={{
          opacity: t, width: 8, height: 8, backgroundColor: mono.gold,
          marginRight: 14, transform: [{ rotate: '45deg' }, { scale: t }],
        }}
      />
      <Animated.Text
        style={[
          styles.sectionTitle,
          { opacity: t, transform: [{ translateX: tx }], color: mono.ink },
        ]}
      >
        {title}
      </Animated.Text>
      <View style={styles.sectionLine}>
        <Animated.View style={{ height: '100%', width: lineW, backgroundColor: mono.gold, opacity: 0.45 }} />
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */
function StatCard({ p, index, value, label, icon, mono, styles }) {
  const t = useMemo(() => stagger(p, index, 0.18, 0.6), [p]);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const isNum = typeof value === 'number';
  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: t,
          transform: [{ translateY: ty }],
          backgroundColor: mono.surface,
          borderColor: mono.lineSoft,
        },
      ]}
    >
      <View style={{ flex: 1, paddingVertical: 20, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' }}>
        {icon ? <Text style={[styles.statIcon, { color: mono.accentDim }]}>{icon}</Text> : null}
        {isNum ? (
          <CountText
            progress={t}
            to={value}
            pad={0}
            style={[styles.statNum, { color: mono.ink }]}
          />
        ) : (
          <Text style={[styles.statNum, { color: mono.ink }]}>{value}</Text>
        )}
        <View style={[styles.statDivider, { backgroundColor: mono.line }]} />
        <Text style={[styles.statLabel, { color: mono.accentDim }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   FILTER CHIP
   ═══════════════════════════════════════════ */
function AnimatedChip({ cat, active, count, onPress, mono, styles }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.94, speed: 40, bounciness: 4, useNativeDriver: ND }).start();
  }, [scale]);

  const onOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, speed: 30, bounciness: 10, useNativeDriver: ND }).start();
  }, [scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        style={({ pressed }) => [
          styles.chip,
          {
            borderColor: active ? mono.ink : mono.borderLight,
            backgroundColor: active ? mono.ink : mono.surface,
          },
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`Filter ${cat}, ${count} karya`}
      >
        <Text style={[styles.chipText, { color: active ? mono.paper : mono.accentDim }]}>
          {cat}
        </Text>
        <View
          style={[
            styles.chipBadge,
            {
              borderColor: active ? 'transparent' : mono.line,
              backgroundColor: active ? mono.paper : mono.surfaceAlt,
            },
          ]}
        >
          <Text style={[styles.chipBadgeText, { color: active ? mono.ink : mono.ink }]}>
            {count}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   FEATURED CARD
   ═══════════════════════════════════════════ */
function FeaturedCard({ item, index, p, mono, styles }) {
  const t = useMemo(() => stagger(p, index + 1, 0.2, 0.6), [p, index]);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  return (
    <Animated.View
      style={[
        styles.featuredCard,
        {
          opacity: t, transform: [{ translateY: ty }],
          backgroundColor: mono.surface,
          borderColor: mono.border,
        },
      ]}
    >
      <LinearGradient
        colors={mono.dark ? ['#141414', '#0A0A0A'] : ['#F4F4F4', '#FAFAFA']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.featuredHead}>
        <Text style={[styles.featuredNo, { color: mono.gold }]}>
          {String(index + 1).padStart(2, '0')}
        </Text>
        <View style={[styles.featuredBadge, { borderColor: mono.gold }]}>
          <Text style={[styles.featuredBadgeText, { color: mono.gold }]}>UNGGULAN</Text>
        </View>
      </View>
      <Text style={[styles.featuredTitle, { color: mono.ink }]}>
        {item.judul || 'Proyek'}
      </Text>
      {!!item.deskripsi && (
        <Text style={[styles.featuredDesc, { color: mono.accentDim }]} numberOfLines={3}>
          {item.deskripsi}
        </Text>
      )}
      <View style={[styles.featuredMeta, { borderTopColor: mono.lineSoft }]}>
        <Text style={[styles.featuredMetaText, { color: mono.accentDim }]}>
          {item.kategori || 'Lainnya'} · {item.tahun || '—'}
        </Text>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   PROJECT CARD — kotak grid
   ═══════════════════════════════════════════ */
function ProjectCard({ item, index, p, mono, styles, onPress }) {
  const t = useMemo(() => stagger(p, index, 0.1, 0.55), [p, index]);
  const press = useRef(new Animated.Value(0)).current;
  const go = (v) =>
    Animated.timing(press, {
      toValue: v, duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });

  return (
    <Animated.View style={[styles.cardWrap, { opacity: t, transform: [{ translateY: ty }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => go(1)}
        onPressOut={() => go(0)}
        onHoverIn={() => go(1)}
        onHoverOut={() => go(0)}
        accessibilityRole="button"
        accessibilityLabel={`${item.judul}, ${item.kategori}, ${item.tahun}`}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale }],
              backgroundColor: mono.surface,
              borderColor: mono.lineSoft,
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: mono.gold,
                opacity: press.interpolate({ inputRange: [0, 1], outputRange: [0, 0.05] }),
              },
            ]}
          />
          <View style={styles.cardNoRow}>
            <Text style={[styles.cardNo, { color: mono.gold }]}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            {item.highlight && (
              <Text style={[styles.cardStar, { color: mono.gold }]}>★</Text>
            )}
          </View>
          <Text style={[styles.cardTitle, { color: mono.ink }]} numberOfLines={2}>
            {item.judul}
          </Text>
          {!!item.deskripsi && (
            <Text style={[styles.cardDesc, { color: mono.accentDim }]} numberOfLines={2}>
              {item.deskripsi}
            </Text>
          )}
          <View style={[styles.cardFooter, { borderTopColor: mono.lineSoft }]}>
            <View style={[styles.cardTagWrap, { borderColor: mono.line }]}>
              <Text style={[styles.cardTag, { color: mono.accentDim }]}>
                {item.kategori || 'Lainnya'}
              </Text>
            </View>
            <Text style={[styles.cardYear, { color: mono.gold }]}>
              {item.tahun || '—'}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════ */
function EmptyState({ p, mono, styles }) {
  return (
    <Animated.View
      style={[
        styles.emptyCard,
        {
          opacity: p,
          backgroundColor: mono.surface,
          borderColor: mono.lineSoft,
        },
      ]}
    >
      <Text style={[styles.emptyIcon, { color: mono.accentDim }]}>○</Text>
      <Text style={[styles.emptyTitle, { color: mono.ink }]}>Tidak ada proyek</Text>
      <Text style={[styles.emptyText, { color: mono.accentDim }]}>
        Coba pilih kategori lain atau kembali ke "Semua".
      </Text>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */
function Footer({ p, mono, styles }) {
  return (
    <Animated.View
      style={{
        alignItems: 'center', opacity: p,
        transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
      }}
    >
      <View style={styles.ornament}>
        <View style={{ height: 1, width: 44, backgroundColor: mono.gold, opacity: 0.6 }} />
        <Text style={[styles.footerCrown, { color: mono.gold }]}>{'♛\uFE0E'}</Text>
        <View style={{ height: 1, width: 44, backgroundColor: mono.gold, opacity: 0.6 }} />
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   MAIN SCREEN
   ═══════════════════════════════════════════ */
export default function PortfolioScreen({ onNavigate }) {
  const { theme } = useTheme();
  const mono = useMemo(() => getMono(theme), [theme]);
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const intro = useRef(new Animated.Value(0)).current;
  const [viewportH, setViewportH] = useState(800);
  const [filter, setFilter] = useState('Semua');

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1, duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const safe = useMemo(() => (Array.isArray(portfolio) ? portfolio : []), []);

  const categories = useMemo(() => {
    const set = new Set();
    safe.forEach((p) => { if (p?.kategori) set.add(p.kategori); });
    return ['Semua', ...Array.from(set)];
  }, [safe]);

  const counts = useMemo(() => {
    const map = { Semua: safe.length };
    safe.forEach((p) => {
      if (p?.kategori) map[p.kategori] = (map[p.kategori] || 0) + 1;
    });
    return map;
  }, [safe]);

  const filtered = useMemo(() => {
    if (filter === 'Semua') return safe;
    return safe.filter((p) => p.kategori === filter);
  }, [safe, filter]);

  const latestYear = useMemo(() => {
    if (!safe.length) return null;
    return Math.max(...safe.map((p) => Number(p.tahun) || 0)) || null;
  }, [safe]);

  const highlightCount = useMemo(
    () => safe.filter((p) => p.highlight).length,
    [safe]
  );

  const featured = useMemo(() => {
    const list = safe.filter((p) => p.highlight);
    return list.length > 0 ? list.slice(0, 2) : safe.slice(0, 2);
  }, [safe]);

  const firstName = (profile?.nama || 'Teman').split(' ')[0];

  const badgeT   = useMemo(() => stagger(intro, 0, 0.12, 0.45), [intro]);
  const dividerT = useMemo(() => stagger(intro, 4, 0.12, 0.45), [intro]);
  const subT     = useMemo(() => stagger(intro, 5, 0.12, 0.45), [intro]);
  const lineW    = dividerT.interpolate({ inputRange: [0, 1], outputRange: [0, 56] });

  const heroTY = scrollY.interpolate({
    inputRange: [0, 400], outputRange: [0, 60], extrapolate: 'clamp',
  });
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 380], outputRange: [1, 0], extrapolate: 'clamp',
  });

  const stats = [
    { key: 'total', icon: '▣', value: safe.length, label: 'TOTAL KARYA' },
    { key: 'cat', icon: '◆', value: Math.max(0, categories.length - 1), label: 'KATEGORI' },
    { key: 'hl', icon: '★', value: highlightCount, label: 'UNGGULAN' },
  ];

  return (
    <View style={styles.container} onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* ================= HERO KOTAK ================= */}
        <View style={styles.heroWrap}>
          <Animated.View
            style={[
              styles.heroCard,
              {
                opacity: heroOpacity,
                transform: [{ translateY: heroTY }],
                backgroundColor: mono.surface,
                borderColor: mono.border,
              },
            ]}
          >
            <LinearGradient
              colors={mono.dark ? ['#141414', '#0A0A0A'] : ['#F4F4F4', '#FAFAFA']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.corner, { top: 8, left: 8, borderColor: mono.gold }]} />
            <View style={[styles.corner, { top: 8, right: 8, borderColor: mono.gold }]} />
            <View style={[styles.corner, { bottom: 8, left: 8, borderColor: mono.gold }]} />
            <View style={[styles.corner, { bottom: 8, right: 8, borderColor: mono.gold }]} />

            <Animated.View
              style={[
                styles.badgeWrap,
                {
                  opacity: badgeT,
                  transform: [{ translateY: badgeT.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) }],
                  borderColor: mono.gold,
                  backgroundColor: mono.paper + 'CC',
                },
              ]}
            >
              <View style={styles.dotWrap}>
                <View style={[styles.dotCore, { backgroundColor: mono.gold }]} />
              </View>
              <Text style={[styles.badgeText, { color: mono.gold }]}>
                {'♛\uFE0E'}  KARYA  {'♛\uFE0E'}
              </Text>
            </Animated.View>

            <Text style={[styles.title, { color: mono.inkSoft }]}>
              Karya{'\n'}
              <Text style={[styles.titleItalic, { color: mono.ink }]}>{firstName}</Text>
              <Text style={[styles.titleDot, { color: mono.accentDim }]}>.</Text>
            </Text>

            <View style={styles.ornament}>
              <Animated.View style={{ height: 1, width: lineW, backgroundColor: mono.gold }} />
              <Animated.View
                style={{ width: 9, height: 9, backgroundColor: mono.gold, marginHorizontal: 12, transform: [{ rotate: '45deg' }, { scale: dividerT }] }}
              />
              <Animated.View style={{ height: 1, width: lineW, backgroundColor: mono.gold }} />
            </View>

            <Animated.Text style={[styles.subtitle, { opacity: subT, color: mono.accentDim }]}>
              Kumpulan karya nyata — dari aplikasi mobile, web, hingga desain antarmuka.
            </Animated.Text>

            {latestYear && (
              <View style={[styles.yearRow, { borderTopColor: mono.lineSoft }]}>
                <Text style={[styles.yearLabel, { color: mono.gold }]}>
                  SEJAK {latestYear - 1}
                </Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* ================= STATS ================= */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.statsRow}>
          {(p) => (
            <>
              {stats.map((s, i) => (
                <StatCard
                  key={s.key} p={p} index={i}
                  value={s.value} label={s.label} icon={s.icon}
                  mono={mono} styles={styles}
                />
              ))}
            </>
          )}
        </RevealSection>

        {/* ================= FEATURED ================= */}
        {featured.length > 0 && (
          <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.section} duration={1400}>
            {(p) => (
              <>
                <SectionHead title="Karya Unggulan" p={p} mono={mono} styles={styles} />
                {featured.map((item, i) => (
                  <FeaturedCard
                    key={item.judul || i}
                    item={item} index={i} p={p}
                    mono={mono} styles={styles}
                  />
                ))}
              </>
            )}
          </RevealSection>
        )}

        {/* ================= FILTER CHIPS ================= */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={{ marginTop: 8 }}>
          {(p) => (
            <Animated.View style={{ opacity: p }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                {categories.map((cat) => (
                  <AnimatedChip
                    key={cat} cat={cat}
                    active={filter === cat}
                    count={counts[cat] ?? 0}
                    onPress={() => setFilter(cat)}
                    mono={mono}
                    styles={styles}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}
        </RevealSection>

        {/* ================= GRID LIST ================= */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.section} duration={1400}>
          {(p) => (
            <>
              <SectionHead
                title={filter === 'Semua' ? 'Semua Karya' : `Kategori ${filter}`}
                p={p} mono={mono} styles={styles}
              />
              {filtered.length === 0 ? (
                <EmptyState p={p} mono={mono} styles={styles} />
              ) : (
                <View style={styles.grid}>
                  {filtered.map((item, i) => (
                    <ProjectCard
                      key={item.judul || `p-${i}`}
                      item={item} index={i} p={p}
                      mono={mono} styles={styles}
                      onPress={() => onNavigate?.('Portfolio')}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </RevealSection>

        {/* ================= FOOTER ================= */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.footer} duration={1400}>
          {(p) => <Footer p={p} mono={mono} styles={styles} />}
        </RevealSection>
      </ScrollView>
    </View>
  );
}

/* ═══════════════════════════════════════════
   STYLES — hanya layout & spacing
   (warna di-inline dari mono di komponen)
   ═══════════════════════════════════════════ */
const createStyles = (screenWidth = 375) => {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },

    /* HERO */
    heroWrap: { paddingHorizontal: 20, paddingTop: 18 },
    heroCard: {
      padding: 24,
      borderRadius: 24,
      borderWidth: 1,
      overflow: 'hidden',
    },
    corner: {
      position: 'absolute', width: 12, height: 12,
      borderTopWidth: 1, borderLeftWidth: 1,
      opacity: 0.35,
    },
    badgeWrap: {
      flexDirection: 'row', alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50,
      marginBottom: 20, borderWidth: 1,
    },
    dotWrap: {
      width: 12, height: 12, alignItems: 'center',
      justifyContent: 'center', marginRight: 8,
    },
    dotCore: { width: 5, height: 5, borderRadius: 3 },
    badgeText: {
      fontSize: 9, fontWeight: '800', letterSpacing: 2,
    },
    title: {
      fontFamily: SERIF,
      fontSize: screenWidth < 375 ? 34 : 42,
      fontWeight: '400',
      letterSpacing: -1.5,
      lineHeight: screenWidth < 375 ? 42 : 50,
      marginBottom: 8,
    },
    titleItalic: { fontStyle: 'italic', fontWeight: '700' },
    ornament: {
      flexDirection: 'row', alignItems: 'center',
      marginTop: 6, marginBottom: 16, width: 100,
    },
    subtitle: {
      fontSize: 13, lineHeight: 21, marginBottom: 16,
    },
    yearRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingTop: 14, borderTopWidth: 1,
    },
    yearLabel: {
      fontSize: 10, fontWeight: '800', letterSpacing: 2.4,
    },

    /* STATS */
    statsRow: {
      flexDirection: 'row', gap: 10,
      paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20,
    },
    statCard: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 6, overflow: 'hidden',
    },
    statIcon: { fontSize: 13, marginBottom: 8 },
    statNum: {
      fontFamily: SERIF, fontSize: 32, fontWeight: '700',
      letterSpacing: -0.6, lineHeight: 36,
    },
    statDivider: {
      width: 20, height: 1,
      marginVertical: 8, opacity: 0.7,
    },
    statLabel: {
      fontSize: 9, fontWeight: '800', letterSpacing: 2.4, textAlign: 'center',
    },

    /* SECTION */
    section: { paddingHorizontal: 20, marginBottom: 20, marginTop: 24 },
    sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionTitle: {
      fontFamily: SERIF, fontSize: 20, fontWeight: '700',
      textTransform: 'uppercase', letterSpacing: 2,
    },
    sectionLine: { flex: 1, height: 1, marginLeft: 16, overflow: 'hidden' },

    /* FEATURED */
    featuredCard: {
      padding: 20,
      borderRadius: 20, borderWidth: 1,
      marginBottom: 12, overflow: 'hidden',
    },
    featuredHead: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 12,
    },
    featuredNo: {
      fontFamily: SERIF, fontSize: 13, fontWeight: '700',
      fontStyle: 'italic', letterSpacing: 0.5,
    },
    featuredBadge: {
      paddingHorizontal: 8, paddingVertical: 3,
      borderRadius: 6, borderWidth: 1,
    },
    featuredBadgeText: {
      fontSize: 8, fontWeight: '800', letterSpacing: 1.4,
    },
    featuredTitle: {
      fontFamily: SERIF, fontSize: 18, fontWeight: '700',
      letterSpacing: -0.4, marginBottom: 8,
    },
    featuredDesc: {
      fontSize: 13, lineHeight: 20, marginBottom: 12,
    },
    featuredMeta: {
      flexDirection: 'row', alignItems: 'center',
      paddingTop: 10, borderTopWidth: 1,
    },
    featuredMetaText: {
      fontSize: 10, fontWeight: '800',
      letterSpacing: 1.2, textTransform: 'uppercase',
    },

    /* CHIPS */
    chips: {
      paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 8,
    },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingLeft: 16, paddingRight: 8, paddingVertical: 9,
      borderRadius: 999, borderWidth: 1,
    },
    chipText: {
      fontSize: 12, fontWeight: '800', letterSpacing: 0.3,
    },
    chipBadge: {
      minWidth: 22, paddingHorizontal: 6, paddingVertical: 2,
      borderRadius: 999, borderWidth: 1,
      alignItems: 'center', justifyContent: 'center',
    },
    chipBadgeText: {
      fontSize: 10, fontWeight: '900', letterSpacing: -0.2,
    },

    /* GRID */
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    cardWrap: { width: '48%' },
    card: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      overflow: 'hidden',
      minHeight: 160,
    },
    cardNoRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 10,
    },
    cardNo: {
      fontFamily: SERIF, fontSize: 13, fontWeight: '700',
      fontStyle: 'italic',
    },
    cardStar: { fontSize: 11 },
    cardTitle: {
      fontFamily: SERIF, fontSize: 14, fontWeight: '700',
      letterSpacing: -0.2, marginBottom: 6, minHeight: 36,
    },
    cardDesc: {
      fontSize: 11, lineHeight: 16, marginBottom: 12, minHeight: 32,
    },
    cardFooter: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginTop: 'auto',
      paddingTop: 10, borderTopWidth: 1,
    },
    cardTagWrap: {
      paddingHorizontal: 8, paddingVertical: 3,
      borderRadius: 6, borderWidth: 1,
    },
    cardTag: {
      fontSize: 8, fontWeight: '800', letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    cardYear: {
      fontSize: 10, fontWeight: '800', letterSpacing: 1.2,
    },

    /* EMPTY */
    emptyCard: {
      alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24,
      borderWidth: 1, borderRadius: 20,
    },
    emptyIcon: {
      fontSize: 36, marginBottom: 12, fontFamily: SERIF,
    },
    emptyTitle: {
      fontFamily: SERIF, fontSize: 15, fontWeight: '700', marginBottom: 6,
    },
    emptyText: {
      fontSize: 12, textAlign: 'center', lineHeight: 18, maxWidth: 280,
    },

    /* FOOTER */
    footer: { paddingVertical: 36, alignItems: 'center' },
    footerCrown: { fontSize: 22, marginHorizontal: 14 },
  });
};