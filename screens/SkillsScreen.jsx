// screens/SkillsScreen.jsx — Rombak Total · Gaya Home · Monokrom
import React, {
  useMemo, useState, useEffect, useRef, useCallback,
} from 'react';
import {
  ScrollView, View, Text, Pressable, StyleSheet,
  Animated, Easing, useWindowDimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import skills from '../data/skills.json';
import profile from '../data/profile.json';
import { useTheme } from '../theme/ThemeContext';

const SERIF = Platform.select({
  ios: 'Georgia', android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});
const ND = Platform.OS !== 'web';

/* ═══════════════════════════════════════════
   PALET — IDENTIK dengan HomeScreen
   ═══════════════════════════════════════════ */
function getMono(theme) {
  const dark = theme.mode === 'dark';
  return {
    dark,
    gold:       dark ? '#B8B8B8' : '#5A5A5A',
    goldBright: dark ? '#F5F5F5' : '#1A1A1A',
    goldDeep:   dark ? '#7A7A7A' : '#3A3A3A',
    ink:        dark ? '#F5F5F5' : '#0F0F0F',
    inkOnGold:  dark ? '#0A0A0A' : '#F5F5F5',
    line:       dark ? '#3A3A3A' : '#D9D9D9',
    lineSoft:   dark ? '#2A2A2A' : '#E8E8E8',
    accentDim:  dark ? '#A8A8A8' : '#8A8A8A',
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

function usePulse(duration, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
          Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        ])
      ),
    ]);
    a.start();
    return () => a.stop();
  }, []);
  return v;
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
   SECTION HEAD — persis Home
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
      <Animated.Text style={[styles.sectionTitle, { opacity: t, transform: [{ translateX: tx }] }]}>
        {title}
      </Animated.Text>
      <View style={styles.sectionLine}>
        <Animated.View style={{ height: '100%', width: lineW, backgroundColor: mono.gold, opacity: 0.45 }} />
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   STAT CARD — persis Stat Home
   ═══════════════════════════════════════════ */
function StatCard({ p, index, value, label, icon, mono, styles }) {
  const t = useMemo(() => stagger(p, index, 0.18, 0.6), [p]);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const isNum = typeof value === 'number';
  return (
    <Animated.View style={[styles.statCard, { opacity: t, transform: [{ translateY: ty }] }]}>
      <View style={{ flex: 1, paddingVertical: 20, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' }}>
        {icon ? <Text style={styles.statIcon}>{icon}</Text> : null}
        {isNum ? (
          <CountText progress={t} to={value} pad={0} style={styles.statNum} />
        ) : (
          <Text style={styles.statNum}>{value}</Text>
        )}
        <View style={styles.statDivider} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   ANIMATED BAR — 4px + knob (persis SkillRow Home)
   ═══════════════════════════════════════════ */
function AnimatedBar({ value, mono, styles, delay = 0, knob = true }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value / 100, duration: 1100, delay,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: false,
    }).start();
  }, [value, delay]);

  const width = anim.interpolate({
    inputRange: [0, 1], outputRange: ['0%', '100%'], extrapolate: 'clamp',
  });

  return (
    <View style={styles.miniTrack}>
      <Animated.View style={[styles.miniFill, { width }]}>
        <LinearGradient
          colors={[mono.gold, mono.goldBright]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 2 }]}
        />
        {knob && <View style={styles.miniKnob} />}
      </Animated.View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   ANIMATED CHIP — border tipis + press scale
   ═══════════════════════════════════════════ */
function AnimatedChip({ cat, active, count, onPress, styles }) {
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
          active && styles.chipActive,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`Filter ${cat}, ${count} skill`}
      >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
        <View style={[styles.chipBadge, active && styles.chipBadgeActive]}>
          <Text style={[styles.chipBadgeText, active && styles.chipBadgeTextActive]}>{count}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   TOP SKILL CARD — kartu border tipis
   ═══════════════════════════════════════════ */
function TopSkillCard({ styles, mono, rank, name, level, index, p }) {
  const t = useMemo(() => stagger(p, index + 1, 0.2, 0.6), [p, index]);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const rankLabel = String(rank).padStart(2, '0');
  return (
    <Animated.View
      style={[styles.topCard, { opacity: t, transform: [{ translateY: ty }] }]}
      accessibilityRole="summary"
      accessibilityLabel={`Peringkat ${rank}: ${name}, ${level}%`}
    >
      <View style={styles.topRankWrap}>
        <Text style={styles.topRankText}>{rankLabel}</Text>
      </View>
      <Text style={styles.topName} numberOfLines={2}>{name}</Text>
      <CountText progress={t} to={level} suffix="%" style={styles.topLevel} />
      <AnimatedBar value={level} mono={mono} styles={styles} delay={600 + index * 150} />
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   SKILL ROW — bar 4px + knob (persis Home)
   ═══════════════════════════════════════════ */
function SkillRow({ s, index, p, mono, styles }) {
  const t = useMemo(() => stagger(p, index + 1, 0.15, 0.6), [p, index]);
  const level = Math.max(0, Math.min(100, Number(s?.level) || 0));
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const fillW = t.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${level}%`] });
  return (
    <Animated.View style={[styles.skillRow, { opacity: t, transform: [{ translateY: ty }] }]}>
      <View style={styles.skillRowHead}>
        <Text style={styles.skillName} numberOfLines={1}>
          <Text style={{ color: mono.gold, fontWeight: '800' }}>
            {String(index + 1).padStart(2, '0')}  {' '}
          </Text>
          {s?.nama || '-'}
        </Text>
        <CountText progress={t} to={level} suffix="%" style={styles.skillPct} />
      </View>
      <View style={styles.skillTrack}>
        <Animated.View style={[styles.skillFill, { width: fillW }]}>
          <LinearGradient
            colors={[mono.gold, mono.goldBright]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 2 }]}
          />
          <View style={styles.skillKnob} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   FOOTER — ornamen ♛
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
        <Text style={styles.footerCrown}>{'♛\uFE0E'}</Text>
        <View style={{ height: 1, width: 44, backgroundColor: mono.gold, opacity: 0.6 }} />
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   MAIN SCREEN
   ═══════════════════════════════════════════ */
export default function SkillsScreen() {
  const { theme } = useTheme();
  const mono = useMemo(() => getMono(theme), [theme]);
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, mono, width), [theme, mono, width]);

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

  const safe = useMemo(() => (Array.isArray(skills) ? skills : []), []);

  const categories = useMemo(() => {
    const set = new Set();
    safe.forEach((s) => { if (s?.kategori) set.add(s.kategori); });
    return ['Semua', ...Array.from(set)];
  }, [safe]);

  const counts = useMemo(() => {
    const map = { Semua: safe.length };
    safe.forEach((s) => {
      if (s?.kategori) map[s.kategori] = (map[s.kategori] || 0) + 1;
    });
    return map;
  }, [safe]);

  const averageLevel = useMemo(() => {
    if (!safe.length) return 0;
    return Math.round(
      safe.reduce((sum, s) => sum + (Number(s?.level) || 0), 0) / safe.length
    );
  }, [safe]);

  const topSkills = useMemo(
    () =>
      [...safe]
        .sort((a, b) => (Number(b?.level) || 0) - (Number(a?.level) || 0))
        .slice(0, 3),
    [safe]
  );

  const distribution = useMemo(() => {
    if (!safe.length) return [];
    const map = {};
    safe.forEach((s) => {
      const cat = s?.kategori || 'Lainnya';
      if (!map[cat]) map[cat] = { total: 0, count: 0 };
      map[cat].total += Number(s?.level) || 0;
      map[cat].count += 1;
    });
    return Object.entries(map)
      .map(([cat, d]) => ({
        cat,
        avg: Math.round(d.total / d.count),
        count: d.count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [safe]);

  const filtered = useMemo(() => {
    if (filter === 'Semua') return safe;
    return safe.filter((s) => s.kategori === filter);
  }, [safe, filter]);

  const firstName = (profile?.nama || 'Teman').split(' ')[0];

  // Stagger values hero
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
    { key: 'total', icon: '◆', value: safe.length, label: 'SKILL' },
    { key: 'avg', icon: '◐', value: averageLevel, label: 'RATA-RATA' },
    { key: 'cat', icon: '★', value: Math.max(0, categories.length - 1), label: 'KATEGORI' },
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
        {/* ================= HERO ================= */}
        <View style={styles.hero}>
          <Animated.View style={[styles.textBlock, { opacity: heroOpacity, transform: [{ translateY: heroTY }] }]}>
            <Animated.View
              style={[
                styles.badgeWrap,
                { opacity: badgeT, transform: [{ translateY: badgeT.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) }] },
              ]}
            >
              <View style={styles.dotWrap}>
                <View style={styles.dotCore} />
              </View>
              <Text style={styles.badgeText}>{'♛\uFE0E'}  KEAHLIAN  {'♛\uFE0E'}</Text>
            </Animated.View>

            <MaskLine progress={intro} index={1} height={46}>
              <Text style={styles.greeting}>Yang dikuasai</Text>
            </MaskLine>

            <CharReveal text={firstName} progress={intro} size={56} mono={mono} />

            <View style={styles.ornament}>
              <Animated.View style={{ height: 1, width: lineW, backgroundColor: mono.gold }} />
              <Animated.View
                style={{ width: 9, height: 9, backgroundColor: mono.gold, marginHorizontal: 12, transform: [{ rotate: '45deg' }, { scale: dividerT }] }}
              />
              <Animated.View style={{ height: 1, width: lineW, backgroundColor: mono.gold }} />
            </View>

            <Animated.View
              style={{
                opacity: subT, alignItems: 'center',
                transform: [{ translateY: subT.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
              }}
            >
              <Text style={styles.subHeadline}>
                Kumpulan keahlian yang saya pelajari dan kembangkan — dari
                pemrograman mobile, web, hingga desain antarmuka.
              </Text>
              {!!profile?.universitas && (
                <Text style={styles.univ}>{String(profile.universitas).toUpperCase()}</Text>
              )}
            </Animated.View>
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

        {/* ================= TOP 3 ================= */}
        {topSkills.length > 0 && (
          <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.section} duration={1400}>
            {(p) => (
              <>
                <SectionHead title="Skill Teratas" p={p} mono={mono} styles={styles} />
                <View style={styles.topRow}>
                  {topSkills.map((s, i) => (
                    <TopSkillCard
                      key={s.nama || i}
                      styles={styles} mono={mono}
                      rank={i + 1}
                      name={s.nama || s.name || `Skill ${i + 1}`}
                      level={Number(s.level) || 0}
                      index={i} p={p}
                    />
                  ))}
                </View>
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
                    styles={styles}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}
        </RevealSection>

        {/* ================= DISTRIBUSI ================= */}
        {distribution.length > 0 && (
          <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.section} duration={1400}>
            {(p) => (
              <>
                <SectionHead title="Rata-rata per Kategori" p={p} mono={mono} styles={styles} />
                <View style={styles.distCard}>
                  {distribution.map((d, i) => (
                    <Animated.View
                      key={d.cat}
                      style={[styles.distRow, { opacity: stagger(p, i + 1, 0.12, 0.5) }]}
                    >
                      <View style={styles.distRowHead}>
                        <Text style={styles.distCat} numberOfLines={1}>{d.cat}</Text>
                        <Text style={styles.distCount}>{d.count} skill · {d.avg}%</Text>
                      </View>
                      <AnimatedBar
                        value={d.avg} mono={mono} styles={styles}
                        delay={400 + i * 100} knob={false}
                      />
                    </Animated.View>
                  ))}
                </View>
              </>
            )}
          </RevealSection>
        )}

        {/* ================= LIST KEAHLIAN ================= */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.section} duration={1400}>
          {(p) => (
            <>
              <SectionHead
                title={filter === 'Semua' ? 'Semua Keahlian' : `Kategori ${filter}`}
                p={p} mono={mono} styles={styles}
              />
              {filtered.length === 0 ? (
                <Animated.View style={{ opacity: p, paddingVertical: 32, alignItems: 'center' }}>
                  <Text style={styles.emptyIcon}>○</Text>
                  <Text style={styles.emptyTitle}>Tidak ada keahlian</Text>
                  <Text style={styles.emptyText}>
                    Coba pilih kategori lain atau kembali ke "Semua".
                  </Text>
                </Animated.View>
              ) : (
                filtered.map((s, i) => (
                  <SkillRow key={s.nama || i} s={s} index={i} p={p} mono={mono} styles={styles} />
                ))
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
   STYLES — IDENTIK dengan HomeScreen
   ═══════════════════════════════════════════ */
const createStyles = (t, m, screenWidth = 375) => {
  const isNarrow = screenWidth < 375;

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },

    /* HERO */
    hero: {
      alignItems: 'center', paddingTop: 52, paddingBottom: 20, overflow: 'hidden',
    },
    textBlock: {
      alignItems: 'center', width: '100%', maxWidth: 520,
      paddingHorizontal: 24, zIndex: 10,
    },
    badgeWrap: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50,
      marginBottom: 22, borderWidth: 1, borderColor: m.gold,
      backgroundColor: t.bg + 'CC',
    },
    dotWrap: {
      width: 14, height: 14, alignItems: 'center',
      justifyContent: 'center', marginRight: 10,
    },
    dotCore: { width: 6, height: 6, borderRadius: 3, backgroundColor: m.gold },
    badgeText: {
      fontSize: 10, fontWeight: '800', letterSpacing: 2.5, color: m.gold,
    },
    greeting: {
      fontFamily: SERIF, fontSize: 32, fontWeight: '300',
      lineHeight: 44, letterSpacing: 2, color: t.text,
    },
    ornament: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', marginTop: 16, marginBottom: 18,
    },
    subHeadline: {
      fontSize: 13, textAlign: 'center', lineHeight: 21,
      maxWidth: 340, color: t.textBody,
    },
    univ: {
      fontSize: 10, fontWeight: '800', letterSpacing: 3,
      color: m.gold, marginTop: 12, textAlign: 'center',
    },

    /* STATS */
    statsRow: {
      flexDirection: 'row', gap: 10,
      paddingHorizontal: 20, paddingTop: 44, paddingBottom: 40,
    },
    statCard: {
      flex: 1, backgroundColor: t.surface,
      borderWidth: 1, borderColor: m.lineSoft,
      borderRadius: 6, overflow: 'hidden',
    },
    statIcon: { fontSize: 13, color: m.accentDim, marginBottom: 8 },
    statNum: {
      fontFamily: SERIF, fontSize: 32, fontWeight: '700',
      letterSpacing: -0.6, color: t.text, lineHeight: 36,
    },
    statDivider: {
      width: 20, height: 1, backgroundColor: m.line,
      marginVertical: 8, opacity: 0.7,
    },
    statLabel: {
      fontSize: 9, fontWeight: '800', letterSpacing: 2.4,
      color: m.accentDim, textAlign: 'center',
    },

    /* SECTION */
    section: { paddingHorizontal: 24, marginBottom: 20, marginTop: 24 },
    sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
    sectionTitle: {
      fontFamily: SERIF, fontSize: 20, fontWeight: '700',
      color: t.text, textTransform: 'uppercase', letterSpacing: 2,
    },
    sectionLine: { flex: 1, height: 1, marginLeft: 16, overflow: 'hidden' },

    /* TOP SKILLS */
    topRow: { flexDirection: 'row', gap: 10 },
    topCard: {
      flex: 1, padding: 14, borderRadius: 6,
      backgroundColor: t.surface,
      borderWidth: 1, borderColor: m.lineSoft,
    },
    topRankWrap: {
      width: 28, height: 28, borderRadius: 8,
      backgroundColor: t.surfaceAlt,
      borderWidth: 1, borderColor: m.line,
      alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    topRankText: {
      fontFamily: SERIF, fontSize: 12, fontWeight: '700',
      fontStyle: 'italic', color: m.gold, letterSpacing: 0.5,
    },
    topName: {
      fontSize: 12, fontWeight: '800', color: t.text,
      letterSpacing: -0.2, minHeight: 30,
    },
    topLevel: {
      fontFamily: SERIF, fontSize: 18, fontWeight: '700',
      color: t.text, letterSpacing: -0.6, marginTop: 4, marginBottom: 8,
    },

    /* MINI BAR (dipakai AnimatedBar) */
    miniTrack: {
      height: 4, borderRadius: 2,
      backgroundColor: m.lineSoft,
      justifyContent: 'center', position: 'relative',
      overflow: 'visible',
    },
    miniFill: { height: 4, borderRadius: 2 },
    miniKnob: {
      position: 'absolute', right: -5, top: -3,
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: m.goldBright,
      borderWidth: 2, borderColor: t.bg,
      shadowColor: m.gold, shadowOpacity: 0.8,
      shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
    },

    /* CHIPS */
    chips: {
      paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 8,
    },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingLeft: 16, paddingRight: 8, paddingVertical: 9,
      borderRadius: 999, borderWidth: 1,
      borderColor: t.borderLight, backgroundColor: t.surface,
    },
    chipActive: { backgroundColor: t.text, borderColor: t.text },
    chipText: {
      fontSize: 12, fontWeight: '800', color: t.textBody, letterSpacing: 0.3,
    },
    chipTextActive: { color: t.bg },
    chipBadge: {
      minWidth: 22, paddingHorizontal: 6, paddingVertical: 2,
      borderRadius: 999, backgroundColor: t.surfaceAlt,
      borderWidth: 1, borderColor: m.line,
      alignItems: 'center', justifyContent: 'center',
    },
    chipBadgeActive: { backgroundColor: t.bg, borderColor: 'transparent' },
    chipBadgeText: {
      fontSize: 10, fontWeight: '900', color: t.text, letterSpacing: -0.2,
    },
    chipBadgeTextActive: { color: t.text },

    /* DISTRIBUSI */
    distCard: {
      backgroundColor: t.surface, padding: 18, borderRadius: 6,
      borderWidth: 1, borderColor: t.borderLight,
    },
    distRow: { marginBottom: 16 },
    distRowHead: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 8,
    },
    distCat: {
      fontFamily: SERIF, fontSize: 14, fontWeight: '700',
      color: t.text, flex: 1, marginRight: 10,
    },
    distCount: {
      fontSize: 10, fontWeight: '700',
      color: m.accentDim, letterSpacing: 0.3,
    },

    /* SKILL ROW */
    skillRow: { marginBottom: 24 },
    skillRowHead: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'baseline', marginBottom: 10, gap: 8,
    },
    skillName: {
      fontFamily: SERIF, fontSize: 15, fontWeight: '700',
      color: t.text, flex: 1,
    },
    skillPct: { fontSize: 12, fontWeight: '900', color: m.gold },
    skillTrack: {
      height: 4, backgroundColor: t.borderLight,
      borderRadius: 2, justifyContent: 'center',
    },
    skillFill: { height: 4, borderRadius: 2 },
    skillKnob: {
      position: 'absolute', right: -5, top: -3,
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: m.goldBright,
      borderWidth: 2, borderColor: t.bg,
      shadowColor: m.gold, shadowOpacity: 0.8,
      shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
    },

    /* EMPTY */
    emptyIcon: { fontSize: 36, color: m.accentDim, marginBottom: 12, fontFamily: SERIF },
    emptyTitle: {
      fontFamily: SERIF, fontSize: 15, fontWeight: '700',
      color: t.text, marginBottom: 6,
    },
    emptyText: {
      fontSize: 12, color: m.accentDim,
      textAlign: 'center', lineHeight: 18, maxWidth: 280,
    },

    /* FOOTER */
    footer: { paddingVertical: 36, alignItems: 'center' },
    footerCrown: { fontSize: 22, color: m.gold, marginHorizontal: 14 },
  });
};