// screens/ContactScreen.jsx — Editorial Flat · Mask Reveal · Magnetic Press
import React, {
  useMemo, useRef, useCallback, useEffect,
} from 'react';
import {
  ScrollView, View, Text, Pressable, StyleSheet, Linking, Alert,
  Platform, useWindowDimensions, Animated, Easing,
} from 'react-native';
import profile from '../data/profile.json';
import ContactForm from '../components/ContactForm';
import { useTheme } from '../theme/ThemeContext';

const SERIF = Platform.select({
  ios: 'Georgia', android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});
const ND = Platform.OS !== 'web';

/* ═══════════════════════════════════════════
   PALET — ink kontras, bukan abu-abu
   ═══════════════════════════════════════════ */
function getMono(theme) {
  const dark = theme.mode === 'dark';
  return {
    dark,
    ink:        dark ? '#F5F5F5' : '#0F0F0F',
    inkSoft:    dark ? '#C8C8C8' : '#3A3A3A',
    paper:      dark ? '#080808' : '#FCFCFC',
    surface:    dark ? '#101010' : '#FFFFFF',
    surfaceAlt: dark ? '#181818' : '#F4F4F4',
    hair:       dark ? '#262626' : '#E2E2E2',
    muted:      dark ? '#7A7A7A' : '#8A8A8A',
    dim:        dark ? '#4A4A4A' : '#B8B8B8',
  };
}

/* ═══════════════════════════════════════════
   HOOKS ANIMASI
   ═══════════════════════════════════════════ */
function useReveal(delay = 0, duration = 700) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, {
        toValue: 1, duration,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: ND,
      }),
    ]).start();
  }, []);
  return v;
}

function usePulse(duration = 2000) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
      ])
    ).start();
  }, []);
  return v;
}

/* ═══════════════════════════════════════════
   HELPER LINK
   ═══════════════════════════════════════════ */
async function openLink(url, fallback) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert('Tidak Bisa Dibuka', fallback);
  } catch {
    Alert.alert('Error', 'Gagal membuka link.');
  }
}

function sanitizePhone(raw) {
  if (!raw) return '';
  let d = String(raw).replace(/\D/g, '').replace(/^0+/, '');
  if (!d.startsWith('62')) d = '62' + d;
  return d;
}

function handleWhatsApp(phone) {
  const c = sanitizePhone(phone);
  if (!c) return Alert.alert('Nomor tidak valid', 'Nomor WhatsApp belum diisi.');
  openLink(`https://wa.me/${c}`, 'WhatsApp tidak terpasang.');
}

function handleMaps(addr) {
  if (!addr) return Alert.alert('Alamat kosong', 'Alamat belum diisi.');
  const q = encodeURIComponent(addr);
  const native = Platform.OS === 'ios' ? `maps://?q=${q}` : `geo:0,0?q=${q}`;
  const web = `https://www.google.com/maps/search/?api=1&query=${q}`;
  Linking.canOpenURL(native).then((s) => {
    if (s) Linking.openURL(native);
    else Linking.openURL(web);
  });
}

/* ═══════════════════════════════════════════
   MASK REVEAL — teks muncul dari bawah (clip)
   ═══════════════════════════════════════════ */
function MaskReveal({ progress, children, style }) {
  const translateY = progress.interpolate({
    inputRange: [0, 1], outputRange: [40, 0],
  });
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <Animated.View style={{ transform: [{ translateY }], opacity: progress }}>
        {children}
      </Animated.View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   RIPPLE PRESS — efek ripple tinta saat ditekan
   ═══════════════════════════════════════════ */
function InkPress({ onPress, style, children, label, mono }) {
  const ripple = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [ripplePos, setRipplePos] = React.useState({ x: 0, y: 0, size: 0 });
  const containerRef = useRef(null);

  const onIn = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    setRipplePos({ x: locationX, y: locationY, size: 0 });
    ripple.setValue(0);
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.985, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: ND }),
      Animated.timing(ripple, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: ND }),
    ]).start();
  };
  const onOut = () => {
    Animated.spring(scale, { toValue: 1, speed: 30, bounciness: 10, useNativeDriver: ND }).start();
  };

  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const rippleOp = ripple.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.25, 0.1, 0] });

  return (
    <Pressable
      onPress={onPress} onPressIn={onIn} onPressOut={onOut}
      accessibilityRole="button" accessibilityLabel={label}
    >
      <Animated.View
        ref={containerRef}
        style={[style, { transform: [{ scale }], overflow: 'hidden' }]}
      >
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: ripplePos.x - 200, top: ripplePos.y - 200,
            width: 400, height: 400, borderRadius: 200,
            backgroundColor: mono.ink,
            opacity: rippleOp,
            transform: [{ scale: rippleScale }],
          }}
        />
        {children}
      </Animated.View>
    </Pressable>
  );
}

/* ═══════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════ */
function Hero({ firstName, mono, styles, scrollY }) {
  const reveal = useReveal(80, 900);
  const meta = useReveal(250, 600);
  const dot = usePulse(1800);

  const line1 = useReveal(350, 800);
  const line2 = useReveal(500, 800);
  const line3 = useReveal(650, 800);
  const rule = useReveal(850, 900);
  const sub = useReveal(1000, 700);

  const dotScale = dot.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const dotOp = dot.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] });

  const parallax = scrollY.interpolate({
    inputRange: [0, 500], outputRange: [0, -50], extrapolate: 'clamp',
  });

  const ruleW = rule.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={{ transform: [{ translateY: parallax }] }}>
      <Animated.View style={[styles.heroWrap, { opacity: reveal }]}>
        {/* Vertikal garis ornamen */}
        <View style={styles.heroRail} pointerEvents="none" />

        <Animated.View style={[styles.heroMeta, { opacity: meta }]}>
          <View style={styles.liveRow}>
            <View style={{ width: 8, height: 8, alignItems: 'center', justifyContent: 'center' }}>
              <Animated.View
                style={{
                  position: 'absolute', width: 6, height: 6, borderRadius: 3,
                  backgroundColor: mono.ink, opacity: dotOp,
                  transform: [{ scale: dotScale }],
                }}
              />
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: mono.ink }} />
            </View>
            <Text style={styles.liveText}>ONLINE · GET IN TOUCH</Text>
          </View>
          <Text style={styles.heroIndex}>—</Text>
        </Animated.View>

        <MaskReveal progress={line1}>
          <Text style={styles.headlineTop}>Hubungi</Text>
        </MaskReveal>

        <MaskReveal progress={line2}>
          <Text style={styles.headlineItalic}>{firstName}</Text>
        </MaskReveal>

        <MaskReveal progress={line3}>
          <Text style={styles.headlineDot}>.</Text>
        </MaskReveal>

        <View style={styles.heroRuleWrap}>
          <Animated.View style={[styles.heroRuleLine, { width: ruleW }]} />
        </View>

        <Animated.Text style={[styles.heroSub, { opacity: sub }]}>
          Terbuka untuk kolaborasi, pertanyaan, atau sekadar menyapa. Balasan
          biasanya dalam 1×24 jam.
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   SECTION HEAD — nomor besar serif + judul kecil
   ═══════════════════════════════════════════ */
function SectionHead({ no, title, mono, styles, delay = 0 }) {
  const reveal = useReveal(delay, 700);
  const numScale = reveal.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const lineW = reveal.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.sectionHead}>
      <Animated.Text style={[styles.sectionNo, { opacity: reveal, transform: [{ scale: numScale }] }]}>
        {no}
      </Animated.Text>
      <View style={{ flex: 1 }}>
        <Animated.Text style={[styles.sectionLabel, { opacity: reveal }]}>
          {title}
        </Animated.Text>
        <View style={styles.sectionLineWrap}>
          <Animated.View style={[styles.sectionLine, { width: lineW }]} />
        </View>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   CONTACT ROW — tanpa box, hairline divider
   ═══════════════════════════════════════════ */
function ContactRow({ row, index, mono, styles, total }) {
  const reveal = useReveal(200 + index * 100, 650);
  const ty = reveal.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });

  return (
    <Animated.View style={{ opacity: reveal, transform: [{ translateY: ty }] }}>
      <InkPress
        onPress={row.onPress}
        style={[styles.row, index !== total - 1 && styles.rowBorder]}
        label={`${row.label}: ${row.value}`}
        mono={mono}
      >
        <View style={styles.rowInner}>
          <Text style={styles.rowIndex}>{String(index + 1).padStart(2, '0')}</Text>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue} numberOfLines={1}>{row.value}</Text>
          </View>
          <View style={styles.rowIconWrap}>
            <Text style={styles.rowIcon}>{row.glyph}</Text>
          </View>
        </View>
      </InkPress>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function ContactScreen() {
  const { theme } = useTheme();
  const mono = useMemo(() => getMono(theme), [theme]);
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(mono, width), [mono, width]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const firstName = (profile?.nama || 'Teman').split(' ')[0];
  const phone = profile?.telepon || '089524538184';
  const address =
    profile?.lokasi || 'Jl. Bakung 3 No 26, Rancaekek Kencana, Rancaekek';

  const rows = useMemo(
    () =>
      [
        profile?.email && {
          key: 'email', label: 'EMAIL', value: profile.email, glyph: '✉',
          onPress: () => openLink(`mailto:${profile.email}`, 'Email tidak tersedia.'),
        },
        phone && {
          key: 'wa', label: 'WHATSAPP', value: phone, glyph: '☎',
          onPress: () => handleWhatsApp(phone),
        },
        address && {
          key: 'lokasi', label: 'LOKASI', value: address, glyph: '◉',
          onPress: () => handleMaps(address),
        },
        profile?.github && {
          key: 'github', label: 'GITHUB',
          value: profile.github.replace(/^https?:\/\/(www\.)?github\.com\//, '@'),
          glyph: '◇',
          onPress: () => openLink(profile.github, 'GitHub tidak tersedia.'),
        },
        profile?.linkedin && {
          key: 'linkedin', label: 'LINKEDIN',
          value: profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, ''),
          glyph: '◈',
          onPress: () => openLink(profile.linkedin, 'LinkedIn tidak tersedia.'),
        },
      ].filter(Boolean),
    [phone, address]
  );

  const formReveal = useReveal(900, 800);
  const formTy = formReveal.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const footerReveal = useReveal(1200, 600);

  return (
    <Animated.ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
    >
      <Hero firstName={firstName} mono={mono} styles={styles} scrollY={scrollY} />

      {/* KONTAK */}
      {rows.length > 0 && (
        <View style={styles.block}>
          <SectionHead no="01" title="KONTAK" mono={mono} styles={styles} delay={200} />
          <View style={styles.list}>
            {rows.map((row, idx) => (
              <ContactRow
                key={row.key} row={row} index={idx} total={rows.length}
                mono={mono} styles={styles}
              />
            ))}
          </View>
        </View>
      )}

      {/* FORM */}
      <View style={styles.block}>
        <SectionHead no="02" title="KIRIM PESAN" mono={mono} styles={styles} delay={300} />
        <Animated.View style={{ opacity: formReveal, transform: [{ translateY: formTy }] }}>
          <ContactForm />
        </Animated.View>
      </View>

      {/* FOOTER */}
      <Animated.View style={[styles.footer, { opacity: footerReveal }]}>
        <View style={styles.footerHair} />
        <Text style={styles.footerCrown}>♛</Text>
        <View style={styles.footerHair} />
      </Animated.View>
    </Animated.ScrollView>
  );
}

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const createStyles = (m, screenWidth = 375) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 72 },

    /* ───────── HERO ───────── */
    heroWrap: {
      position: 'relative',
      paddingLeft: 20,
      paddingTop: 8,
      marginBottom: 16,
    },
    heroRail: {
      position: 'absolute',
      left: 0, top: 0, bottom: 0,
      width: 1,
      backgroundColor: m.ink,
      opacity: 0.25,
    },
    heroMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    liveText: {
      fontSize: 9, fontWeight: '800', color: m.ink,
      letterSpacing: 2,
    },
    heroIndex: {
      fontFamily: SERIF, fontSize: 14, color: m.dim,
      letterSpacing: 1,
    },
    headlineTop: {
      fontFamily: SERIF,
      fontSize: screenWidth < 375 ? 44 : 54,
      fontWeight: '400',
      color: m.inkSoft,
      letterSpacing: -2.5,
      lineHeight: screenWidth < 375 ? 50 : 60,
    },
    headlineItalic: {
      fontFamily: SERIF,
      fontSize: screenWidth < 375 ? 44 : 54,
      fontWeight: '700',
      fontStyle: 'italic',
      color: m.ink,
      letterSpacing: -2.5,
      lineHeight: screenWidth < 375 ? 50 : 60,
    },
    headlineDot: {
      fontFamily: SERIF,
      fontSize: screenWidth < 375 ? 44 : 54,
      fontWeight: '700',
      color: m.dim,
      lineHeight: 20,
    },
    heroRuleWrap: {
      height: 1,
      marginTop: 20,
      marginBottom: 20,
      backgroundColor: m.hair,
      width: '100%',
    },
    heroRuleLine: {
      height: 1,
      backgroundColor: m.ink,
    },
    heroSub: {
      fontSize: 13,
      color: m.muted,
      lineHeight: 22,
      letterSpacing: 0.2,
      maxWidth: 380,
    },

    /* ───────── SECTION ───────── */
    block: { marginTop: 44 },
    sectionHead: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
      marginBottom: 20,
    },
    sectionNo: {
      fontFamily: SERIF,
      fontSize: 44,
      fontWeight: '700',
      fontStyle: 'italic',
      color: m.ink,
      letterSpacing: -2,
      lineHeight: 44,
      marginTop: -4,
    },
    sectionLabel: {
      fontSize: 11, fontWeight: '800',
      color: m.ink, letterSpacing: 3,
      marginBottom: 8,
    },
    sectionLineWrap: {
      height: 1, backgroundColor: m.hair, width: '100%',
      overflow: 'hidden',
    },
    sectionLine: {
      height: 1, backgroundColor: m.ink, opacity: 0.6,
    },

    /* ───────── LIST KONTAK (no box) ───────── */
    list: { paddingLeft: 4 },
    row: {
      paddingVertical: 18,
      paddingHorizontal: 0,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: m.hair,
    },
    rowInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    rowIndex: {
      fontFamily: SERIF,
      fontSize: 13, fontStyle: 'italic',
      fontWeight: '700',
      color: m.dim,
      width: 26,
    },
    rowLabel: {
      fontSize: 10, fontWeight: '800',
      color: m.muted, letterSpacing: 1.8,
      marginBottom: 4,
    },
    rowValue: {
      fontFamily: SERIF,
      fontSize: 16, fontWeight: '600',
      color: m.ink, letterSpacing: -0.4,
    },
    rowIconWrap: {
      width: 36, height: 36, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: m.hair,
    },
    rowIcon: { fontSize: 14, color: m.ink, fontWeight: '900' },

    /* ───────── FOOTER ───────── */
    footer: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', gap: 16,
      marginTop: 64,
    },
    footerHair: { flex: 1, height: 1, backgroundColor: m.hair },
    footerCrown: { fontSize: 18, color: m.ink },
  });