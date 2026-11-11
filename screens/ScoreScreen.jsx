// screens/ScoreScreen.jsx — Gaya Home · Monokrom · Fixed hooks & native driver
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Animated, Easing, Pressable, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScoreCard from '../components/ScoreCard';
import { useTheme } from '../theme/ThemeContext';
import { apiFetch, getApiBaseUrl } from '../utils/api';

const SERIF = Platform.select({
  ios: 'Georgia', android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});
const ND = Platform.OS !== 'web';

/* ═══════════════════════════════════════════
   PALET — identik dengan HomeScreen
   ═══════════════════════════════════════════ */
function getMono(theme) {
  const dark = theme.mode === 'dark';
  return {
    dark,
    gold:       dark ? '#B8B8B8' : '#5A5A5A',
    goldBright: dark ? '#F5F5F5' : '#1A1A1A',
    goldDeep:   dark ? '#7A7A7A' : '#3A3A3A',
    inkOnGold:  dark ? '#0A0A0A' : '#F5F5F5',
    ink:        dark ? '#F5F5F5' : '#0F0F0F',
    line:       dark ? '#3A3A3A' : '#D9D9D9',
    lineSoft:   dark ? '#2A2A2A' : '#E8E8E8',
    accentDim:  dark ? '#A8A8A8' : '#8A8A8A',
    error:      dark ? '#F0A8A8' : '#B23A3A',
  };
}

/* ═══════════════════════════════════════════
   HELPER ANIMASI
   ═══════════════════════════════════════════ */
function stagger(p, i, step = 0.12, span = 0.5) {
  const start = Math.min(i * step, 1 - span);
  return p.interpolate({ inputRange: [start, start + span], outputRange: [0, 1], extrapolate: 'clamp' });
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
    const id = progress.addListener(({ value }) => setV(Math.round(value * (Number(to) || 0))));
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
      Animated.timing(p, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
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
    <View
      style={style}
      onLayout={(e) => {
        yRef.current = e.nativeEvent.layout.y;
        check();
      }}
    >
      {children(p)}
    </View>
  );
}

/* ═══════════════════════════════════════════
   MASK LINE — teks muncul dari bawah (clip)
   ═══════════════════════════════════════════ */
function MaskLine({ progress, index, height, children }) {
  const t = useMemo(() => stagger(progress, index, 0.14, 0.5), [progress, index]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [height * 1.15, 0] });
  return (
    <View style={{ height, overflow: 'hidden', width: '100%', alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ translateY }], opacity: t }}>
        {children}
      </Animated.View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   CHAR REVEAL — nama muncul huruf demi huruf
   ═══════════════════════════════════════════ */
function CharReveal({ text, progress, size, mono }) {
  const chars = Array.from(String(text || ''));
  const n = Math.max(chars.length, 1);
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', height: size * 1.22, overflow: 'hidden' }}>
      {chars.map((c, i) => {
        const start = 0.16 + (i / n) * 0.42;
        const t = progress.interpolate({
          inputRange: [start, start + 0.3],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });
        const ty = t.interpolate({ inputRange: [0, 1], outputRange: [size * 1.2, 0] });
        return (
          <Animated.Text
            key={i}
            style={{
              fontFamily: SERIF,
              fontSize: size,
              lineHeight: size * 1.2,
              fontStyle: 'italic',
              fontWeight: '700',
              color: mono.ink,
              opacity: t,
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
   SECTION HEAD — persis gaya Home
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
   STAT CARD — persis komponen Stat di Home
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
   COMPONENT ROW — bar 4px dengan knob (gaya SkillRow Home)
   ═══════════════════════════════════════════ */
function ComponentRow({ s, index, p, mono, styles }) {
  const t = useMemo(() => stagger(p, index + 1, 0.2, 0.7), [p]);
  const level = Math.max(0, Math.min(100, Number(s?.persen) || 0));
  const fillW = t.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${level}%`] });
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  return (
    <Animated.View style={[styles.compRow, { opacity: t, transform: [{ translateY: ty }] }]}>
      <View style={styles.compHead}>
        <Text style={styles.compName}>
          <Text style={{ color: mono.gold, fontWeight: '800' }}>
            {String(index + 1).padStart(2, '0')}  {' '}
          </Text>
          {s?.label || `Komponen ${index + 1}`}
        </Text>
        <CountText progress={t} to={level} suffix="%" style={styles.compPct} />
      </View>
      <View style={styles.compTrack}>
        <Animated.View style={[styles.compFill, { width: fillW }]}>
          <LinearGradient
            colors={[mono.gold, mono.goldBright]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 2 }]}
          />
          <View style={styles.compKnob} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   INSIGHT CARD
   ═══════════════════════════════════════════ */
function InsightCard({ p, index, eyebrow, label, value, mono, styles }) {
  const t = useMemo(() => stagger(p, index, 0.18, 0.6), [p]);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  return (
    <Animated.View style={[styles.insightCard, { opacity: t, transform: [{ translateY: ty }] }]}>
      <Text style={styles.insightEyebrow}>{eyebrow}</Text>
      <Text style={styles.insightLabel} numberOfLines={1}>{label}</Text>
      <View style={styles.statDivider} />
      <Text style={styles.insightValue}>{value}%</Text>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   LOADING VIEW — pulse dot (gaya Home)
   ═══════════════════════════════════════════ */
function LoadingView({ mono, styles }) {
  const pulse = usePulse(1800);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const op = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });

  return (
    <View style={[styles.container, styles.centerBox]}>
      <View style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute', width: 14, height: 14, borderRadius: 7,
            backgroundColor: mono.gold, opacity: op, transform: [{ scale }],
          }}
        />
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: mono.gold }} />
      </View>
      <Text style={styles.loadingText}>MEMUAT NILAI AKADEMIK</Text>
      <Text style={styles.loadingSub}>Menghubungkan ke server...</Text>
    </View>
  );
}

/* ═══════════════════════════════════════════
   ERROR VIEW — editorial
   ═══════════════════════════════════════════ */
function ErrorView({ error, mono, styles, onRetry }) {
  const reveal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(reveal, {
      toValue: 1, duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, styles.centerBox, { padding: 24, opacity: reveal }]}>
      <Text style={styles.errorIcon}>○</Text>
      <Text style={styles.errorTitle}>Gagal Mengambil Data</Text>
      <Text style={styles.errorMsg}>{error}</Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] }]}
        accessibilityRole="button"
        accessibilityLabel="Coba lagi"
      >
        <Text style={styles.retryText}>COBA LAGI  →</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   SCORE CONTENT — semua hook animasi di sini,
   hanya dipanggil saat data sudah siap
   ═══════════════════════════════════════════ */
function ScoreContent({ data, mono, styles }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const intro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1, duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const identitas = data?.identitas || {};
  const currentScore = data?.currentScore || { nilai: 0, grade: '—', totalLP: 0 };
  const learningProgress = Array.isArray(data?.learningProgress) ? data.learningProgress : [];
  const firstName = (identitas?.nama || 'Teman').split(' ')[0];

  const average = learningProgress.length
    ? Math.round(
        learningProgress.reduce((s, lp) => s + (Number(lp?.persen) || 0), 0) /
          learningProgress.length
      )
    : 0;

  const best = learningProgress.reduce(
    (a, lp) => ((Number(lp?.persen) || 0) > (Number(a?.persen) ?? -1) ? lp : a), null
  );
  const worst = learningProgress.reduce(
    (a, lp) => ((Number(lp?.persen) || 0) < (Number(a?.persen) ?? 101) ? lp : a), null
  );

  const badgeT   = useMemo(() => stagger(intro, 0, 0.12, 0.45), [intro]);
  const dividerT = useMemo(() => stagger(intro, 4, 0.12, 0.45), [intro]);
  const subT     = useMemo(() => stagger(intro, 5, 0.12, 0.45), [intro]);
  const lineW    = dividerT.interpolate({ inputRange: [0, 1], outputRange: [0, 56] });

  const heroTY = scrollY.interpolate({ inputRange: [0, 400], outputRange: [0, 70], extrapolate: 'clamp' });
  const heroOpacity = scrollY.interpolate({ inputRange: [0, 380], outputRange: [1, 0], extrapolate: 'clamp' });

  const stats = [
    { key: 'nilai', icon: '★', value: Number(currentScore.nilai ?? 0), label: 'NILAI', isNum: true },
    { key: 'grade', icon: '◆', value: currentScore.grade || '—', label: 'GRADE', isNum: false },
    { key: 'lp', icon: '◐', value: Number(currentScore.totalLP ?? 0), label: 'TOTAL LP', isNum: true },
  ];

  return (
    <Animated.ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
    >
      {/* HERO */}
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
            <Text style={styles.badgeText}>{'♛\uFE0E'}  NILAI AKADEMIK  {'♛\uFE0E'}</Text>
          </Animated.View>

          <MaskLine progress={intro} index={1} height={46}>
            <Text style={styles.greeting}>Nilai</Text>
          </MaskLine>

          <CharReveal text={firstName} progress={intro} size={56} mono={mono} />

          <View style={styles.ornament}>
            <Animated.View style={{ height: 1, width: lineW, backgroundColor: mono.gold }} />
            <Animated.View
              style={{ width: 9, height: 9, backgroundColor: mono.gold, marginHorizontal: 12, transform: [{ rotate: '45deg' }, { scale: dividerT }] }}
            />
            <Animated.View style={{ height: 1, width: lineW, backgroundColor: mono.gold }} />
          </View>

          <Animated.View style={{ opacity: subT, alignItems: 'center', transform: [{ translateY: subT.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
            <Text style={styles.subHeadline}>
              {identitas?.mk || 'Mata Kuliah'}
            </Text>
            <Text style={styles.univ}>
              {identitas?.dosen ? `DOSEN ${String(identitas.dosen).toUpperCase()}` : `NIM ${identitas?.nim || '—'}`}
            </Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* STATS */}
      <RevealSection scrollY={scrollY} viewportH={800} style={styles.statsRow}>
        {(p) => (
          <>
            {stats.map((s, i) => (
              <StatCard
                key={s.key}
                p={p} index={i}
                value={s.value}
                label={s.label}
                icon={s.icon}
                mono={mono}
                styles={styles}
              />
            ))}
          </>
        )}
      </RevealSection>

      {/* RINCIAN */}
      <RevealSection scrollY={scrollY} viewportH={800} style={styles.section} duration={1400}>
        {(p) => (
          <>
            <SectionHead title="Rincian Penilaian" p={p} mono={mono} styles={styles} />
            {learningProgress.map((lp, i) => (
              <ComponentRow
                key={lp.id || i}
                s={lp}
                index={i}
                p={p}
                mono={mono}
                styles={styles}
              />
            ))}

            <Animated.View
              style={[
                styles.averageRow,
                { opacity: stagger(p, learningProgress.length + 1, 0.15, 0.6) },
              ]}
            >
              <Text style={styles.averageLabel}>RATA-RATA</Text>
              <CountText
                progress={stagger(p, learningProgress.length + 1, 0.15, 0.6)}
                to={average}
                suffix="%"
                style={styles.averageValue}
              />
            </Animated.View>
          </>
        )}
      </RevealSection>

      {/* INSIGHT */}
      {best && worst && (
        <RevealSection scrollY={scrollY} viewportH={800} style={styles.insightRow} duration={1200}>
          {(p) => (
            <>
              <InsightCard
                p={p} index={0}
                eyebrow="TERBAIK"
                label={best.label}
                value={best.persen}
                mono={mono} styles={styles}
              />
              <InsightCard
                p={p} index={1}
                eyebrow="PERLU NAIK"
                label={worst.label}
                value={worst.persen}
                mono={mono} styles={styles}
              />
            </>
          )}
        </RevealSection>
      )}

      {/* KARTU NILAI */}
      <RevealSection scrollY={scrollY} viewportH={800} style={styles.section} duration={1400}>
        {(p) => (
          <>
            <SectionHead title="Kartu Nilai" p={p} mono={mono} styles={styles} />
            <Animated.View style={{ opacity: stagger(p, 1, 0.2, 0.7) }}>
              <ScoreCard
                identitas={identitas}
                currentScore={currentScore}
                learningProgress={learningProgress}
              />
            </Animated.View>
          </>
        )}
      </RevealSection>

      {/* FOOTER */}
      <RevealSection scrollY={scrollY} viewportH={800} style={styles.footer} duration={1400}>
        {(p) => (
          <Animated.View
            style={{
              alignItems: 'center',
              opacity: p,
              transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
            }}
          >
            <View style={styles.ornament}>
              <View style={{ height: 1, width: 44, backgroundColor: mono.gold, opacity: 0.6 }} />
              <Text style={styles.footerCrown}>{'♛\uFE0E'}</Text>
              <View style={{ height: 1, width: 44, backgroundColor: mono.gold, opacity: 0.6 }} />
            </View>
          </Animated.View>
        )}
      </RevealSection>
    </Animated.ScrollView>
  );
}

/* ═══════════════════════════════════════════
   MAIN SCREEN — hanya urus state & fetch
   ═══════════════════════════════════════════ */
export default function ScoreScreen() {
  const { theme } = useTheme();
  const mono = useMemo(() => getMono(theme), [theme]);
  const styles = useMemo(() => createStyles(theme, mono), [theme, mono]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch('/academic');
      setData(result);
    } catch (err) {
      const base = getApiBaseUrl();
      const msg = err?.message || 'Gagal mengambil data.';
      setError(`${msg}\n\nBase URL: ${base}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingView mono={mono} styles={styles} />;
  if (error) return <ErrorView error={error} mono={mono} styles={styles} onRetry={fetchData} />;
  return <ScoreContent data={data} mono={mono} styles={styles} />;
}

/* ═══════════════════════════════════════════
   STYLES — identik dengan HomeScreen
   ═══════════════════════════════════════════ */
const createStyles = (t, m) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    /* LOADING */
    loadingText: {
      fontFamily: SERIF, fontSize: 12, fontWeight: '800',
      letterSpacing: 2.5, color: m.gold, marginTop: 24,
    },
    loadingSub: {
      fontSize: 11, color: m.accentDim, marginTop: 8, letterSpacing: 0.5,
    },

    /* ERROR */
    errorIcon: {
      fontSize: 40, color: m.accentDim, marginBottom: 12, fontFamily: SERIF,
    },
    errorTitle: {
      fontFamily: SERIF, fontSize: 20, fontWeight: '700', color: t.text,
      marginBottom: 10, textAlign: 'center',
    },
    errorMsg: {
      fontSize: 12, color: m.accentDim, marginBottom: 24,
      textAlign: 'center', lineHeight: 18,
    },
    retryBtn: {
      backgroundColor: t.text, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 4,
    },
    retryText: {
      fontSize: 12, fontWeight: '900', letterSpacing: 2, color: t.bg,
    },

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
      width: 14, height: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10,
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
      fontSize: 14, textAlign: 'center', lineHeight: 22,
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

    /* SECTIONS */
    section: { paddingHorizontal: 24, marginBottom: 20, marginTop: 12 },
    sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
    sectionTitle: {
      fontFamily: SERIF, fontSize: 20, fontWeight: '700',
      color: t.text, textTransform: 'uppercase', letterSpacing: 2,
    },
    sectionLine: { flex: 1, height: 1, marginLeft: 16, overflow: 'hidden' },

    /* COMPONENT ROW */
    compRow: { marginBottom: 24 },
    compHead: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'baseline', marginBottom: 10,
    },
    compName: {
      fontFamily: SERIF, fontSize: 15, fontWeight: '700', color: t.text,
    },
    compPct: { fontSize: 12, fontWeight: '900', color: m.gold },
    compTrack: {
      height: 4, backgroundColor: t.borderLight,
      borderRadius: 2, justifyContent: 'center',
    },
    compFill: { height: 4, borderRadius: 2 },
    compKnob: {
      position: 'absolute', right: -5, top: -3,
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: m.goldBright,
      borderWidth: 2, borderColor: t.bg,
      shadowColor: m.gold, shadowOpacity: 0.8,
      shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
    },

    /* AVERAGE */
    averageRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'baseline', marginTop: 12, paddingTop: 18,
      borderTopWidth: 1, borderTopColor: m.lineSoft,
    },
    averageLabel: {
      fontSize: 10, fontWeight: '800',
      color: m.accentDim, letterSpacing: 2,
    },
    averageValue: {
      fontFamily: SERIF, fontSize: 28, fontWeight: '700',
      fontStyle: 'italic', color: t.text, letterSpacing: -1,
    },

    /* INSIGHT */
    insightRow: {
      flexDirection: 'row', gap: 10,
      paddingHorizontal: 24, marginBottom: 20,
    },
    insightCard: {
      flex: 1, backgroundColor: t.surface,
      borderWidth: 1, borderColor: m.lineSoft,
      borderRadius: 6, padding: 16, overflow: 'hidden',
    },
    insightEyebrow: {
      fontSize: 9, fontWeight: '800',
      color: m.accentDim, letterSpacing: 2, marginBottom: 8,
    },
    insightLabel: {
      fontFamily: SERIF, fontSize: 15, fontWeight: '700',
      color: t.text, letterSpacing: -0.2, marginBottom: 4,
    },
    insightValue: {
      fontFamily: SERIF, fontSize: 22, fontWeight: '700',
      color: t.text, letterSpacing: -0.6,
    },

    /* FOOTER */
    footer: { paddingVertical: 36, alignItems: 'center' },
    footerCrown: { fontSize: 22, color: m.gold, marginHorizontal: 14 },
  });