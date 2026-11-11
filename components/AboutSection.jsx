// components/AboutSection.jsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Easing,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useFadeSlideUp } from '../utils/animations';

/* ═══════════════════════════════════════════
   HELPER — buka link
   ═══════════════════════════════════════════ */
async function openLink(url, fallbackMessage) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Tidak Bisa Dibuka', fallbackMessage);
    }
  } catch (err) {
    Alert.alert('Error', 'Gagal membuka link.');
  }
}

/* ═══════════════════════════════════════════
   HELPER — sanitize nomor telepon
   Output selalu format internasional: 62xxx
   ═══════════════════════════════════════════ */
function sanitizePhone(raw) {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  // hapus leading zero(s)
  digits = digits.replace(/^0+/, '');
  // kalau belum diawali 62, tambahkan
  if (!digits.startsWith('62')) {
    digits = '62' + digits;
  }
  return digits;
}

/* ═══════════════════════════════════════════
   HANDLER — WhatsApp
   ✅ Coba app native dulu → fallback ke wa.me
   ═══════════════════════════════════════════ */
function handleWhatsApp(phone) {
  const clean = sanitizePhone(phone);
  if (!clean) {
    Alert.alert('Nomor tidak valid', 'Nomor WhatsApp belum diisi.');
    return;
  }

  // Debug log — hapus setelah fix berhasil
  console.log('[WA] raw:', phone);
  console.log('[WA] clean:', clean);

  const nativeUrl = `whatsapp://send?phone=${clean}`;
  const webUrl = `https://wa.me/${clean}`;

  Linking.canOpenURL(nativeUrl)
    .then((supported) => {
      if (supported) return Linking.openURL(nativeUrl);
      return Linking.openURL(webUrl);
    })
    .catch(() => {
      Linking.openURL(webUrl).catch(() =>
        Alert.alert('Error', 'Tidak bisa membuka WhatsApp.')
      );
    });
}

/* ═══════════════════════════════════════════
   HANDLER — Maps
   ═══════════════════════════════════════════ */
function handleMaps(address) {
  if (!address) {
    Alert.alert('Alamat kosong', 'Alamat belum diisi.');
    return;
  }
  const query = encodeURIComponent(address);
  const nativeUrl =
    Platform.OS === 'ios' ? `maps://?q=${query}` : `geo:0,0?q=${query}`;
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  Linking.canOpenURL(nativeUrl).then((supported) => {
    if (supported) Linking.openURL(nativeUrl);
    else Linking.openURL(webUrl);
  });
}

/* ═══════════════════════════════════════════
   CONTACT ROW
   ═══════════════════════════════════════════ */
function ContactRow({ item, index, theme, styles }) {
  const anim = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  const pressScaleInterp = pressScale.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [0, 0.5, 1, 1.5, 2],
  });

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: 200 + index * 100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });

  const handlePressIn = () => {
    Animated.timing(pressScale, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 4,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateX }],
        marginBottom: 10,
      }}
    >
      <Pressable
        onPress={item.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${item.label}: ${item.value}`}
      >
        <Animated.View
          style={[
            styles.contactRow,
            { transform: [{ scale: pressScaleInterp }] },
          ]}
        >
          <View style={styles.contactIconWrap}>
            <Text style={styles.contactIcon}>{item.icon}</Text>
          </View>
          <View style={styles.contactTextWrap}>
            <Text style={styles.contactLabel}>{item.label}</Text>
            <Text style={styles.contactValue} numberOfLines={1}>
              {item.value}
            </Text>
          </View>
          <View style={styles.contactArrowWrap}>
            <Text style={styles.contactArrow}>›</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function AboutSection({ email, telepon, lokasi }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const listAnim = useFadeSlideUp({ delay: 200 });

  const phone = telepon || '089524538184';
  const address = lokasi || 'Jl. Bakung 3 No 26, Rancaekek Kencana, Rancaekek';

  const contacts = [
    {
      key: 'email',
      label: 'Email',
      value: email,
      icon: '✉️',
      onPress: () =>
        openLink(`mailto:${email}`, 'Aplikasi email tidak ditemukan.'),
    },
    {
      key: 'wa',
      label: 'WhatsApp',
      value: phone,
      icon: '💬',
      onPress: () => handleWhatsApp(phone),
    },
    {
      key: 'maps',
      label: 'Lokasi',
      value: address,
      icon: '📍',
      onPress: () => handleMaps(address),
    },
  ].filter((c) => c.value);

  if (contacts.length === 0) return null;

  return (
    <Animated.View style={listAnim.style}>
      {contacts.map((item, i) => (
        <ContactRow
          key={item.key}
          item={item}
          index={i}
          theme={theme}
          styles={styles}
        />
      ))}
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   STYLES
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
    borderLight: t?.borderLight || '#2a2a2a',
    shadow: t?.shadow || '#000000',
    accent: t?.accent || '#ffffff',
  };

  return StyleSheet.create({
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
    },
    contactIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactIcon: {
      fontSize: 20,
    },
    contactTextWrap: {
      flex: 1,
    },
    contactLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textMute,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      marginBottom: 3,
    },
    contactValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.1,
    },
    contactArrowWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactArrow: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.textMute,
      lineHeight: 22,
      marginTop: -2,
    },
  });
};