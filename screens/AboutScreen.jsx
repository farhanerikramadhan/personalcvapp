// screens/AboutScreen.jsx — Monokrom · Lengkap · Gaya Home
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, Platform,
  useWindowDimensions, Pressable, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import profile from '../data/profile.json';
import experience from '../data/experience.json';
import skills from '../data/skills.json';
import portfolio from '../data/portfolio.json';
import ExperienceTimeline from '../components/ExperienceTimeline';
import { useTheme } from '../theme/ThemeContext';

const SERIF = Platform.select({
  ios: 'Georgia', android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});
const ND = Platform.OS !== 'web';

const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const resolveName = (p) =>
  p?.nama || p?.name || p?.fullName || p?.full_name || 'Nama Lengkap';

/* ═══════════════════════════════════════════
   PALET — identik dengan Home
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
    inkSoft:    dark ? '#C8C8C8' : '#3A3A3A',
    surface:    dark ? '#101010' : '#FFFFFF',
    surfaceAlt: dark ? '#181818' : '#F4F4F4',
    line:       dark ? '#3A3A3A' : '#D9D9D9',
    lineSoft:   dark ? '#2A2A2A' : '#E8E8E8',
    accentDim:  dark ? '#A8A8A8' : '#8A8A8A',
    gradA:      dark ? '#3A3A3A' : '#2A2A2A',
    gradB:      dark ? '#0A0A0A' : '#101010',
    onDark:     '#FFFFFF',
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

function RevealSection({ scrollY, viewportH, style, children, threshold = 0.92, duration = 1100 }) {
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

function FadeUp({ p, children, y = 22, style }) {
  const ty = p.interpolate({ inputRange: [0, 1], outputRange: [y, 0] });
  return (
    <Animated.View style={[{ opacity: p, transform: [{ translateY: ty }] }, style]}>
      {children}
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   SECTION HEADER — persis Home (diamond + judul + garis)
   ═══════════════════════════════════════════ */
function SectionHeader({ label, p, mono, styles }) {
  const t = useMemo(() => stagger(p, 0, 0.1, 0.6), [p]);
  const lineW = t.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] });
  return (
    <View style={styles.sectionHead}>
      <Animated.View
        style={{
          opacity: t, width: 8, height: 8, backgroundColor: mono.gold,
          marginRight: 14, transform: [{ rotate: '45deg' }, { scale: t }],
        }}
      />
      <Animated.Text
        style={[styles.sectionTitle, { opacity: t, transform: [{ translateX: tx }], color: mono.ink }]}
      >
        {label}
      </Animated.Text>
      <View style={styles.sectionLine}>
        <Animated.View style={{ height: '100%', width: lineW, backgroundColor: mono.gold, opacity: 0.45 }} />
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   IDENTITY ROW
   ═══════════════════════════════════════════ */
function IdentityRow({ p, index, icon, label, value, isLast, mono, styles }) {
  const t = useMemo(() => stagger(p, index + 1, 0.08, 0.5), [p]);
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] });
  return (
    <Animated.View
      style={[
        styles.identityRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: mono.lineSoft },
        { opacity: t, transform: [{ translateX: tx }] },
      ]}
    >
      <View style={[styles.identityIconWrap, { borderColor: mono.line, backgroundColor: mono.surfaceAlt }]}>
        <Text style={[styles.identityIcon, { color: mono.gold }]}>{icon}</Text>
      </View>
      <Text style={[styles.identityLabel, { color: mono.accentDim }]}>{label}</Text>
      <Text style={[styles.identityValue, { color: mono.ink }]} numberOfLines={2}>
        {value}
      </Text>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   CONTACT ACTIONS
   ═══════════════════════════════════════════ */
function ContactActions({ p, mono, styles, email, telepon, lokasi }) {
  const t = useMemo(() => stagger(p, 1, 0.15, 0.6), [p]);
  const items = [
    email && {
      key: 'email', icon: '✉', label: 'EMAIL', value: email,
      onPress: () => Linking.openURL(`mailto:${email}`),
    },
    telepon && {
      key: 'telp', icon: '☎', label: 'TELEPON', value: telepon,
      onPress: () => Linking.openURL(`tel:${telepon.replace(/\s+/g, '')}`),
    },
    lokasi && {
      key: 'lokasi', icon: '◎', label: 'LOKASI', value: lokasi,
      onPress: () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lokasi)}`),
    },
  ].filter(Boolean);

  return (
    <Animated.View style={{ opacity: t, gap: 10 }}>
      {items.map((it) => (
        <Pressable
          key={it.key}
          onPress={it.onPress}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: mono.surface, borderColor: mono.line },
            pressed && { opacity: 0.75, transform: [{ scale: 0.99 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${it.label}: ${it.value}`}
        >
          <View style={[styles.actionIconWrap, { borderColor: mono.line, backgroundColor: mono.surfaceAlt }]}>
            <Text style={[styles.actionIcon, { color: mono.gold }]}>{it.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionLabel, { color: mono.accentDim }]}>{it.label}</Text>
            <Text style={[styles.actionValue, { color: mono.ink }]} numberOfLines={1}>
              {it.value}
            </Text>
          </View>
          <Text style={[styles.actionChevron, { color: mono.gold }]}>›</Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   PENDIDIKAN CARD
   ═══════════════════════════════════════════ */
function EducationCard({ p, mono, styles, profile }) {
  const t = useMemo(() => stagger(p, 1, 0.15, 0.6), [p]);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  const facts = [
    profile?.program_studi && { label: 'PROGRAM STUDI', value: profile.program_studi },
    profile?.semester && { label: 'SEMESTER', value: String(profile.semester) },
    profile?.mata_kuliah && { label: 'MATA KULIAH', value: profile.mata_kuliah },
  ].filter(Boolean);

  return (
    <Animated.View
      style={[
        styles.previewCard,
        {
          opacity: t, transform: [{ translateY: ty }],
          backgroundColor: mono.surface, borderColor: mono.lineSoft,
        },
      ]}
    >
      <View style={styles.eduHead}>
        <View style={[styles.eduIconWrap, { borderColor: mono.line, backgroundColor: mono.surfaceAlt }]}>
          <Text style={[styles.eduIcon, { color: mono.gold }]}>⌂</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eduUniv, { color: mono.ink }]} numberOfLines={2}>
            {profile?.universitas || 'Universitas'}
          </Text>
          <Text style={[styles.eduNim, { color: mono.accentDim }]}>
            NIM {profile?.nim || '—'}
          </Text>
        </View>
      </View>

      {facts.map((f, i) => (
        <View
          key={f.label}
          style={[
            styles.eduRow,
            i < facts.length - 1 && { borderBottomWidth: 1, borderBottomColor: mono.lineSoft },
          ]}
        >
          <Text style={[styles.eduLabel, { color: mono.accentDim }]}>{f.label}</Text>
          <Text style={[styles.eduValue, { color: mono.ink }]} numberOfLines={1}>
            {f.value}
          </Text>
        </View>
      ))}
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   SKILLS PREVIEW
   ═══════════════════════════════════════════ */
function SkillsPreview({ p, mono, styles, topSkills, onNavigate }) {
  const t = useMemo(() => stagger(p, 1, 0.15, 0.6), [p]);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <Animated.View
      style={[
        styles.previewCard,
        {
          opacity: t, transform: [{ translateY: ty }],
          backgroundColor: mono.surface, borderColor: mono.lineSoft,
        },
      ]}
    >
      {topSkills.map((s, i) => {
        const level = Math.max(0, Math.min(100, Number(s?.level) || 0));
        const bt = stagger(t, i + 1, 0.15, 0.5);
        const w = bt.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${level}%`] });
        return (
          <View
            key={s?.nama || i}
            style={[
              styles.skillPreviewRow,
              i < topSkills.length - 1 && { borderBottomWidth: 1, borderBottomColor: mono.lineSoft },
            ]}
          >
            <View style={styles.skillPreviewHead}>
              <Text style={[styles.skillPreviewName, { color: mono.ink }]} numberOfLines={1}>
                <Text style={{ color: mono.gold, fontWeight: '800' }}>
                  {String(i + 1).padStart(2, '0')}{'  '}
                </Text>
                {s?.nama || '-'}
              </Text>
              <Text style={[styles.skillPreviewPct, { color: mono.gold }]}>
                {level}%
              </Text>
            </View>
            <View style={[styles.skillPreviewTrack, { backgroundColor: mono.lineSoft }]}>
              <Animated.View style={[styles.skillPreviewFill, { width: w, backgroundColor: mono.gold }]} />
            </View>
          </View>
        );
      })}

      <Pressable
        onPress={() => onNavigate?.('Skills')}
        style={({ pressed }) => [
          styles.previewBtn, { borderColor: mono.line },
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Lihat semua keahlian"
      >
        <Text style={[styles.previewBtnText, { color: mono.ink }]}>SEMUA KEAHLIAN →</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   PORTFOLIO PREVIEW
   ═══════════════════════════════════════════ */
function PortfolioPreview({ p, mono, styles, portfolioItems, onNavigate }) {
  const t = useMemo(() => stagger(p, 1, 0.15, 0.6), [p]);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <Animated.View
      style={[
        styles.previewCard,
        {
          opacity: t, transform: [{ translateY: ty }],
          backgroundColor: mono.surface, borderColor: mono.lineSoft,
        },
      ]}
    >
      {portfolioItems.map((item, i) => (
        <Pressable
          key={item?.judul || i}
          onPress={() => onNavigate?.('Portfolio')}
          style={({ pressed }) => [
            styles.pfRow,
            i < portfolioItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: mono.lineSoft },
            pressed && { opacity: 0.75 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={item?.judul}
        >
          <Text style={[styles.pfNo, { color: mono.gold }]}>
            {String(i + 1).padStart(2, '0')}
          </Text>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.pfTitle, { color: mono.ink }]} numberOfLines={1}>
              {item?.judul || 'Proyek'}
            </Text>
            <Text style={[styles.pfMeta, { color: mono.accentDim }]} numberOfLines={1}>
              {item?.kategori || '—'} · {item?.tahun || '—'}
            </Text>
          </View>
          <Text style={[styles.pfArrow, { color: mono.gold }]}>→</Text>
        </Pressable>
      ))}

      <Pressable
        onPress={() => onNavigate?.('Portfolio')}
        style={({ pressed }) => [
          styles.previewBtn, { borderColor: mono.line },
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Lihat semua karya"
      >
        <Text style={[styles.previewBtnText, { color: mono.ink }]}>SEMUA KARYA →</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   SCORE PREVIEW
   ═══════════════════════════════════════════ */
function ScorePreview({ p, mono, styles, onNavigate }) {
  const t = useMemo(() => stagger(p, 1, 0.15, 0.6), [p]);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  const nilai = 88;
  const grade = 'A';

  return (
    <Animated.View
      style={[
        styles.previewCard,
        {
          opacity: t, transform: [{ translateY: ty }],
          backgroundColor: mono.surface, borderColor: mono.lineSoft,
        },
      ]}
    >
      <View style={styles.scoreRow}>
        <View style={styles.scoreBigCell}>
          <Text style={[styles.scoreBigLabel, { color: mono.accentDim }]}>NILAI AKHIR</Text>
          <CountText progress={t} to={nilai} pad={0} style={[styles.scoreBigValue, { color: mono.ink }]} />
        </View>
        <View style={[styles.scoreDividerV, { backgroundColor: mono.lineSoft }]} />
        <View style={styles.scoreBigCell}>
          <Text style={[styles.scoreBigLabel, { color: mono.accentDim }]}>GRADE</Text>
          <Text style={[styles.scoreGrade, { color: mono.gold }]}>{grade}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => onNavigate?.('Score')}
        style={({ pressed }) => [
          styles.previewBtn, { borderColor: mono.line },
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Lihat detail nilai"
      >
        <Text style={[styles.previewBtnText, { color: mono.ink }]}>LIHAT DETAIL NILAI →</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   MAIN SCREEN
   ═══════════════════════════════════════════ */
export default function AboutScreen({ onNavigate }) {
  const { theme } = useTheme();
  const mono = useMemo(() => getMono(theme), [theme]);
  const { width, height: winH } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [viewportH, setViewportH] = useState(winH);
  const [contentH, setContentH] = useState(1);

  const intro = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1, duration: 1600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    Animated.timing(rise, {
      toValue: 1, duration: 900, delay: 120,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: ND,
    }).start();
  }, []);

  const safeExperience = Array.isArray(experience) ? experience : [];
  const safeSkills = Array.isArray(skills) ? skills : [];
  const safePortfolio = Array.isArray(portfolio) ? portfolio : [];

  const fullName = resolveName(profile);
  const initials = getInitials(fullName);
  const firstName = fullName.split(' ')[0];

  const identityRows = [
    { key: 'nim', label: 'NIM', value: profile?.nim, icon: '#' },
    { key: 'prodi', label: 'Program Studi', value: profile?.program_studi, icon: '◈' },
    { key: 'mk', label: 'Mata Kuliah', value: profile?.mata_kuliah, icon: '✎' },
    { key: 'univ', label: 'Universitas', value: profile?.universitas, icon: '⌂' },
    { key: 'semester', label: 'Semester', value: profile?.semester, icon: '◐' },
    { key: 'email', label: 'Email', value: profile?.email, icon: '✉' },
    { key: 'telp', label: 'Telepon', value: profile?.telepon, icon: '☎' },
    { key: 'lokasi', label: 'Lokasi', value: profile?.lokasi, icon: '◎' },
  ].filter((r) => r.value != null && r.value !== '');

  const topSkills = useMemo(
    () => [...safeSkills]
      .sort((a, b) => (Number(b?.level) || 0) - (Number(a?.level) || 0))
      .slice(0, 3),
    [safeSkills]
  );

  const featuredProjects = useMemo(() => {
    const highlighted = safePortfolio.filter((p) => p.highlight);
    return highlighted.length > 0 ? highlighted.slice(0, 3) : safePortfolio.slice(0, 3);
  }, [safePortfolio]);

  const nameT = useMemo(() => stagger(intro, 1, 0.12, 0.45), [intro]);
  const roleT = useMemo(() => stagger(intro, 2, 0.12, 0.45), [intro]);
  const tagT = useMemo(() => stagger(intro, 3, 0.12, 0.45), [intro]);

  const heroTY = scrollY.interpolate({
    inputRange: [0, 320], outputRange: [0, 40], extrapolate: 'clamp',
  });
  const heroOp = scrollY.interpolate({
    inputRange: [0, 320], outputRange: [1, 0.2], extrapolate: 'clamp',
  });
  const progressW = scrollY.interpolate({
    inputRange: [0, Math.max(1, contentH - viewportH)],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const rise8 = (t, y = 14) => ({
    opacity: t,
    transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [y, 0] }) }],
  });

  const role = [profile?.program_studi, profile?.universitas].filter(Boolean).join(' · ');

  return (
    <View style={{ flex: 1 }} onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}>
      {/* Progress bar */}
      <View pointerEvents="none" style={styles.progressTrack}>
        <Animated.View style={{ height: '100%', width: progressW }}>
          <LinearGradient
            colors={mono.dark ? ['#8A8A8A', '#E5E5E5'] : ['#2A2A2A', '#8A8A8A']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onContentSizeChange={(_, h) => setContentH(h)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* ─────── HERO ─────── */}
        <View style={styles.hero}>
          <Animated.View style={{ opacity: heroOp, transform: [{ translateY: heroTY }] }}>
            <View style={styles.heroRow}>
              <Animated.View
                style={[styles.avatar, { opacity: rise, transform: [{ scale: rise }], borderColor: mono.line }]}
              >
                <LinearGradient
                  colors={[mono.gradA, mono.gradB]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={[styles.avatarText, { color: mono.onDark }]}>{initials}</Text>
              </Animated.View>

              <View style={{ flex: 1 }}>
                <Animated.Text
                  style={[styles.name, { color: mono.ink }, rise8(nameT, 16)]}
                  numberOfLines={2}
                >
                  {fullName}
                </Animated.Text>
                {!!role && (
                  <Animated.Text style={[styles.role, { color: mono.gold }, rise8(roleT, 10)]}>
                    {role}
                  </Animated.Text>
                )}
                {!!profile?.tagline && (
                  <Animated.Text
                    style={[styles.tagline, { color: mono.accentDim }, rise8(tagT, 8)]}
                    numberOfLines={2}
                  >
                    “{profile.tagline}”
                  </Animated.Text>
                )}
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ─────── I. TENTANG SAYA ─────── */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.block}>
          {(p) => (
            <>
              <SectionHeader label="Tentang Saya" p={p} mono={mono} styles={styles} />
              <FadeUp p={stagger(p, 1, 0.2, 0.7)}>
                <View style={[styles.storyCard, { backgroundColor: mono.surface, borderColor: mono.lineSoft }]}>
                  <View style={[styles.storyInner, { borderColor: mono.lineSoft }]} pointerEvents="none" />
                  <Text style={[styles.paragraph, { color: mono.inkSoft }]}>
                    {profile?.deskripsi ||
                      'Mahasiswa Sistem Informasi yang menekuni dunia teknologi dengan semangat belajar tinggi.'}
                  </Text>
                </View>
              </FadeUp>
            </>
          )}
        </RevealSection>

        {/* ─────── II. INFORMASI PRIBADI ─────── */}
        {identityRows.length > 0 && (
          <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.block} duration={1400}>
            {(p) => (
              <>
                <SectionHeader label="Informasi Pribadi" p={p} mono={mono} styles={styles} />
                <View style={[styles.identityCard, { borderTopColor: mono.lineSoft }]}>
                  {identityRows.map((row, idx) => (
                    <IdentityRow
                      key={row.key}
                      p={p} index={idx}
                      icon={row.icon} label={row.label} value={row.value}
                      isLast={idx === identityRows.length - 1}
                      mono={mono} styles={styles}
                    />
                  ))}
                </View>
              </>
            )}
          </RevealSection>
        )}

        {/* ─────── III. PENDIDIKAN ─────── */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.block}>
          {(p) => (
            <>
              <SectionHeader label="Pendidikan" p={p} mono={mono} styles={styles} />
              <EducationCard p={p} mono={mono} styles={styles} profile={profile} />
            </>
          )}
        </RevealSection>

        {/* ─────── IV. KEAHLIAN SINGKAT ─────── */}
        {topSkills.length > 0 && (
          <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.block} duration={1400}>
            {(p) => (
              <>
                <SectionHeader label="Keahlian Utama" p={p} mono={mono} styles={styles} />
                <SkillsPreview p={p} mono={mono} styles={styles} topSkills={topSkills} onNavigate={onNavigate} />
              </>
            )}
          </RevealSection>
        )}

        {/* ─────── V. KARYA UNGGULAN ─────── */}
        {featuredProjects.length > 0 && (
          <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.block} duration={1400}>
            {(p) => (
              <>
                <SectionHeader label="Karya Unggulan" p={p} mono={mono} styles={styles} />
                <PortfolioPreview p={p} mono={mono} styles={styles} portfolioItems={featuredProjects} onNavigate={onNavigate} />
              </>
            )}
          </RevealSection>
        )}

        {/* ─────── VI. HUBUNGI SAYA ─────── */}
        {(profile?.email || profile?.telepon || profile?.lokasi) && (
          <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.block}>
            {(p) => (
              <>
                <SectionHeader label="Hubungi Saya" p={p} mono={mono} styles={styles} />
                <ContactActions
                  p={p} mono={mono} styles={styles}
                  email={profile?.email}
                  telepon={profile?.telepon}
                  lokasi={profile?.lokasi}
                />
              </>
            )}
          </RevealSection>
        )}

        {/* ─────── VII. NILAI ─────── */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.block} duration={1400}>
          {(p) => (
            <>
              <SectionHeader label="Nilai Akademik" p={p} mono={mono} styles={styles} />
              <ScorePreview p={p} mono={mono} styles={styles} onNavigate={onNavigate} />
            </>
          )}
        </RevealSection>

        {/* ─────── VIII. PERJALANAN ─────── */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.block}>
          {(p) => (
            <>
              <SectionHeader label="Perjalanan" p={p} mono={mono} styles={styles} />
              <FadeUp p={stagger(p, 1, 0.2, 0.7)}>
                <ExperienceTimeline data={safeExperience} />
              </FadeUp>
            </>
          )}
        </RevealSection>

        {/* ─────── FOOTER ─────── */}
        <View style={styles.footer}>
          <View style={[styles.footerLine, { backgroundColor: mono.lineSoft }]} />
          <Text style={[styles.footerText, { color: mono.gold }]}>♛</Text>
          <View style={[styles.footerLine, { backgroundColor: mono.lineSoft }]} />
        </View>
        <Text style={[styles.footerSub, { color: mono.accentDim }]}>
          {fullName.toUpperCase()} · PORTFOLIO PERSONAL
        </Text>
      </Animated.ScrollView>
    </View>
  );
}

/* ═══════════════════════════════════════════
   STYLES — hanya layout, warna di-inline
   ═══════════════════════════════════════════ */
const createStyles = (screenWidth = 375) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    content: { paddingBottom: 64 },
    progressTrack: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 20 },

    /* HERO */
    hero: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
    heroRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatar: {
      width: 76, height: 76, borderRadius: 38,
      overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
      borderWidth: 2,
    },
    avatarText: { fontFamily: SERIF, fontSize: 26, fontWeight: '700', letterSpacing: 1 },
    name: {
      fontFamily: SERIF,
      fontSize: screenWidth < 375 ? 20 : 22,
      fontWeight: '700',
      letterSpacing: -0.3,
      lineHeight: screenWidth < 375 ? 26 : 28,
    },
    role: {
      fontSize: 12, fontWeight: '700',
      marginTop: 4, letterSpacing: 0.6,
    },
    tagline: {
      fontFamily: SERIF, fontSize: 13, fontStyle: 'italic',
      marginTop: 6, lineHeight: 19,
    },

    /* SECTION */
    block: { marginTop: 36, paddingHorizontal: 24 },
    sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionTitle: {
      fontFamily: SERIF, fontSize: 15, fontWeight: '700',
      letterSpacing: 2, textTransform: 'uppercase',
    },
    sectionLine: { flex: 1, height: 1, marginLeft: 14, overflow: 'hidden' },

    /* STORY */
    storyCard: {
      paddingVertical: 20, paddingHorizontal: 18,
      borderWidth: 1,
    },
    storyInner: {
      position: 'absolute', top: 4, left: 4, right: 4, bottom: 4, borderWidth: 1,
    },
    paragraph: { fontSize: 14, lineHeight: 24 },

    /* IDENTITY */
    identityCard: { borderTopWidth: 1 },
    identityRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 13, gap: 12,
    },
    identityIconWrap: {
      width: 28, height: 28, borderWidth: 1,
      alignItems: 'center', justifyContent: 'center',
    },
    identityIcon: { fontSize: 12 },
    identityLabel: {
      fontSize: 10, fontWeight: '800',
      letterSpacing: 1.4, textTransform: 'uppercase',
      width: 110,
    },
    identityValue: {
      fontFamily: SERIF, fontSize: 14, fontWeight: '700',
      textAlign: 'right', flex: 1,
    },

    /* CONTACT ACTIONS */
    actionBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 14, paddingHorizontal: 14,
      borderWidth: 1,
    },
    actionIconWrap: {
      width: 34, height: 34, borderWidth: 1,
      alignItems: 'center', justifyContent: 'center',
    },
    actionIcon: { fontSize: 14 },
    actionLabel: {
      fontSize: 10, fontWeight: '800', letterSpacing: 1.6,
      textTransform: 'uppercase', marginBottom: 2,
    },
    actionValue: { fontFamily: SERIF, fontSize: 14, fontWeight: '700' },
    actionChevron: { fontSize: 20, opacity: 0.8, marginLeft: 4 },

    /* PREVIEW CARDS (Pendidikan, Skills, Portfolio, Score) */
    previewCard: {
      padding: 18, borderWidth: 1,
    },
    previewBtn: {
      marginTop: 14, paddingVertical: 12,
      borderWidth: 1, alignItems: 'center',
    },
    previewBtnText: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },

    /* EDUCATION */
    eduHead: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      paddingBottom: 14, marginBottom: 12,
      borderBottomWidth: 1, borderBottomColor: 'transparent',
    },
    eduIconWrap: {
      width: 44, height: 44, borderWidth: 1,
      alignItems: 'center', justifyContent: 'center',
    },
    eduIcon: { fontSize: 16, fontWeight: '900' },
    eduUniv: { fontFamily: SERIF, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
    eduNim: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6, marginTop: 4 },
    eduRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', paddingVertical: 10,
    },
    eduLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.8 },
    eduValue: { fontFamily: SERIF, fontSize: 13, fontWeight: '700', flex: 1, textAlign: 'right' },

    /* SKILL PREVIEW */
    skillPreviewRow: { paddingVertical: 14 },
    skillPreviewHead: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'baseline', marginBottom: 8, gap: 8,
    },
    skillPreviewName: { fontFamily: SERIF, fontSize: 14, fontWeight: '700', flex: 1 },
    skillPreviewPct: { fontSize: 11, fontWeight: '900' },
    skillPreviewTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
    skillPreviewFill: { height: 4, borderRadius: 2 },

    /* PORTFOLIO PREVIEW */
    pfRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 14,
    },
    pfNo: { fontFamily: SERIF, fontSize: 13, fontWeight: '700', fontStyle: 'italic', width: 24 },
    pfTitle: { fontFamily: SERIF, fontSize: 15, fontWeight: '700', marginBottom: 3 },
    pfMeta: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
    pfArrow: { fontSize: 16, marginLeft: 4 },

    /* SCORE PREVIEW */
    scoreRow: { flexDirection: 'row', alignItems: 'center' },
    scoreBigCell: { flex: 1, alignItems: 'center' },
    scoreDividerV: { width: 1, height: 60, marginHorizontal: 12 },
    scoreBigLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.8, marginBottom: 6 },
    scoreBigValue: { fontFamily: SERIF, fontSize: 42, fontWeight: '700', letterSpacing: -1.5, lineHeight: 46 },
    scoreGrade: { fontFamily: SERIF, fontSize: 42, fontWeight: '700', fontStyle: 'italic', letterSpacing: -1.5, lineHeight: 46 },

    /* FOOTER */
    footer: {
      marginTop: 48, paddingHorizontal: 24,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    footerLine: { flex: 1, height: 1 },
    footerText: { fontSize: 22, marginHorizontal: 4 },
    footerSub: {
      fontSize: 9, fontWeight: '800', letterSpacing: 2.5,
      textAlign: 'center', marginTop: 12, paddingHorizontal: 24,
    },
  });