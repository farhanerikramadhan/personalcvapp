// components/ContactForm.jsx — Submit → toast + ringkasan pesan terkirim
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { validateContact } from '../utils/validateContact';
import { useTheme } from '../theme/ThemeContext';

const SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

function getMono(theme) {
  const dark = theme.mode === 'dark';
  return {
    dark,
    accent:    dark ? '#E5E5E5' : '#4A4A4A',
    accentDim: dark ? '#A8A8A8' : '#8A8A8A',
    line:      dark ? '#3A3A3A' : '#D9D9D9',
    lineSoft:  dark ? '#2A2A2A' : '#E8E8E8',
    error:     dark ? '#F0A8A8' : '#B23A3A',
    ok:        dark ? '#A8E0C0' : '#2E7D4F',
    okBg:      dark ? 'rgba(46,125,79,0.15)' : 'rgba(46,125,79,0.08)',
    errBg:     dark ? 'rgba(178,58,58,0.15)' : 'rgba(178,58,58,0.08)',
  };
}

/* ═══════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════ */
function Toast({ status, mono, styles, onDismiss }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!status) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start();
      return;
    }

    Animated.spring(anim, {
      toValue: 1,
      speed: 18,
      bounciness: 6,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start(() => onDismiss?.());
    }, 5000);

    return () => clearTimeout(timer);
  }, [status]);

  const opacity = anim;
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  const isOk = status?.type === 'ok';
  const color = isOk ? mono.ok : mono.error;
  const bg = isOk ? mono.okBg : mono.errBg;

  return (
    <Animated.View
      pointerEvents={status ? 'auto' : 'none'}
      style={[
        styles.toast,
        {
          backgroundColor: bg,
          borderColor: color,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Pressable
        onPress={onDismiss}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Tutup notifikasi"
      >
        <View style={[styles.toastDot, { backgroundColor: color }]} />
        <Text style={[styles.toastText, { color }]} numberOfLines={3}>
          {status?.msg}
        </Text>
        <Text style={[styles.toastClose, { color }]}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   SENT SUMMARY — ringkasan pesan yang dikirim
   ═══════════════════════════════════════════ */
function SentSummary({ data, mono, styles, onDismiss }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!data) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start();
      return;
    }

    Animated.spring(anim, {
      toValue: 1,
      speed: 16,
      bounciness: 4,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start(() => onDismiss?.());
    }, 12000);

    return () => clearTimeout(timer);
  }, [data]);

  const opacity = anim;
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });
  const height = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!data) return null;

  return (
    <Animated.View
      pointerEvents={data ? 'auto' : 'none'}
      style={[
        styles.summaryCard,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.summaryHead}>
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryBadgeText}>TERKIRIM</Text>
        </View>
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Tutup ringkasan"
        >
          <Text style={styles.summaryClose}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>NAMA</Text>
        <Text style={styles.summaryValue} numberOfLines={1}>
          {data.nama}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>EMAIL</Text>
        <Text style={styles.summaryValue} numberOfLines={1}>
          {data.email}
        </Text>
      </View>

      <View style={styles.summaryDivider} />

      <Text style={styles.summaryLabel}>PESAN</Text>
      <Text style={styles.summaryMessage} numberOfLines={6}>
        {data.pesan}
      </Text>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function ContactForm() {
  const { theme } = useTheme();
  const mono = useMemo(() => getMono(theme), [theme]);
  const styles = useMemo(() => createStyles(theme, mono), [theme, mono]);

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [pesan, setPesan] = useState('');

  const [focused, setFocused] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSent, setLastSent] = useState(null); // ringkasan pesan terakhir

  const btnScale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(btnScale, {
      toValue: 0.97,
      speed: 40,
      bounciness: 4,
      useNativeDriver: true,
    }).start();

  const onPressOut = () =>
    Animated.spring(btnScale, {
      toValue: 1,
      speed: 30,
      bounciness: 10,
      useNativeDriver: true,
    }).start();

  /* ───────── Submit ───────── */
  const handleSubmit = useCallback(() => {
    const { valid, errors: errs } = validateContact({ nama, email, pesan });
    setErrors(errs || {});
    if (!valid) {
      setStatus({ type: 'err', msg: 'Periksa kembali isian formulir.' });
      setLastSent(null);
      return;
    }

    setStatus(null);
    setLastSent(null);
    setSubmitting(true);

    // Snapshot data sebelum di-reset
    const snapshot = {
      nama: nama.trim(),
      email: email.trim(),
      pesan: pesan.trim(),
    };

    // Simulasi proses kirim
    setTimeout(() => {
      setSubmitting(false);
      setStatus({
        type: 'ok',
        msg: 'Pesan terkirim. Terima kasih sudah menghubungi!',
      });
      setLastSent(snapshot);
      setNama('');
      setEmail('');
      setPesan('');
      setErrors({});
    }, 800);
  }, [nama, email, pesan]);

  /* ───────── Field renderer ───────── */
  const renderField = (key, label, opts = {}) => {
    const { multiline, keyboardType, autoCapitalize, placeholder } = opts;
    const isFocused = focused === key;
    const error = errors[key];
    const value = key === 'nama' ? nama : key === 'email' ? email : pesan;
    const setValue =
      key === 'nama' ? setNama : key === 'email' ? setEmail : setPesan;

    return (
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          onFocus={() => setFocused(key)}
          onBlur={() => setFocused(null)}
          placeholder={placeholder}
          placeholderTextColor={mono.accentDim}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            isFocused && styles.inputFocused,
            error && styles.inputError,
          ]}
          accessibilityLabel={label}
          editable={!submitting}
        />
        {error ? <Text style={styles.fieldError}>{error}</Text> : null}
      </View>
    );
  };

  return (
    <View>
      {renderField('nama', 'NAMA', {
        autoCapitalize: 'words',
        placeholder: 'Nama lengkap',
      })}

      {renderField('email', 'EMAIL', {
        keyboardType: 'email-address',
        placeholder: 'nama@email.com',
      })}

      {renderField('pesan', 'PESAN', {
        multiline: true,
        placeholder: 'Tulis pesan Anda di sini...',
      })}

      {/* Tombol Submit */}
      <Pressable
        onPress={handleSubmit}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityLabel="Kirim pesan"
        style={{ marginTop: 8 }}
      >
        <Animated.View
          style={[
            styles.submitBtn,
            { transform: [{ scale: btnScale }] },
            submitting && { opacity: 0.7 },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={theme.bg} />
          ) : (
            <Text style={styles.submitText}>KIRIM PESAN  →</Text>
          )}
        </Animated.View>
      </Pressable>

      {/* Toast status */}
      <Toast
        status={status}
        mono={mono}
        styles={styles}
        onDismiss={() => setStatus(null)}
      />

      {/* Ringkasan pesan yang baru dikirim */}
      <SentSummary
        data={lastSent}
        mono={mono}
        styles={styles}
        onDismiss={() => setLastSent(null)}
      />
    </View>
  );
}

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const createStyles = (t, m) => {
  const colors = {
    bg: t?.bg || '#000000',
    surface: t?.surface || '#0d0d0d',
    surfaceAlt: t?.surfaceAlt || '#141414',
    text: t?.text || '#ffffff',
  };

  return StyleSheet.create({
    fieldWrap: { marginBottom: 14 },
    fieldLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: m.accentDim,
      letterSpacing: 1.6,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: m.line,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text,
      fontFamily: SERIF,
    },
    inputMultiline: {
      minHeight: 110,
      textAlignVertical: 'top',
      paddingTop: 12,
    },
    inputFocused: { borderColor: m.accent },
    inputError: { borderColor: m.error },
    fieldError: {
      fontSize: 11,
      color: m.error,
      marginTop: 6,
    },
    submitBtn: {
      height: 50,
      borderRadius: 12,
      backgroundColor: colors.text,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitText: {
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 2,
      color: colors.bg,
    },

    /* ───────── Toast ───────── */
    toast: {
      marginTop: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      minHeight: 44,
      justifyContent: 'center',
    },
    toastDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    toastText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 18,
      letterSpacing: 0.1,
    },
    toastClose: {
      fontSize: 14,
      fontWeight: '900',
      paddingHorizontal: 4,
    },

    /* ───────── Ringkasan pesan terkirim ───────── */
    summaryCard: {
      marginTop: 10,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: m.line,
      backgroundColor: colors.surface,
    },
    summaryHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    summaryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: m.okBg,
      borderWidth: 1,
      borderColor: m.ok,
    },
    summaryBadgeText: {
      fontSize: 9,
      fontWeight: '900',
      color: m.ok,
      letterSpacing: 1.4,
    },
    summaryClose: {
      fontSize: 13,
      fontWeight: '900',
      color: m.accentDim,
      paddingHorizontal: 4,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 10,
      marginBottom: 6,
    },
    summaryLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: m.accentDim,
      letterSpacing: 1.6,
      width: 52,
    },
    summaryValue: {
      flex: 1,
      fontFamily: SERIF,
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: m.lineSoft,
      marginVertical: 8,
    },
    summaryMessage: {
      fontFamily: SERIF,
      fontSize: 13,
      fontWeight: '400',
      color: colors.text,
      lineHeight: 20,
      marginTop: 2,
    },
  });
};