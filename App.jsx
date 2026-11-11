// App.jsx — Monokrom (Putih · Hitam · Abu)
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing, Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import profile from './data/profile.json';

import HomeScreen from './screens/HomeScreen';
import AboutScreen from './screens/AboutScreen';
import SkillsScreen from './screens/SkillsScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import ScoreScreen from './screens/ScoreScreen';
import ContactScreen from './screens/ContactScreen';

const SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

const TABS = [
  { key: 'Home', label: 'BERANDA', component: HomeScreen },
  { key: 'About', label: 'TENTANG', component: AboutScreen },
  { key: 'Skills', label: 'KEAHLIAN', component: SkillsScreen },
  { key: 'Portfolio', label: 'KARYA', component: PortfolioScreen },
  { key: 'Score', label: 'NILAI', component: ScoreScreen },
  { key: 'Contact', label: 'KONTAK', component: ContactScreen },
];

function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/);
  if (!parts.length) return '?';
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Palet monokrom lokal (tidak bergantung pada theme.accent)
function getMono(theme) {
  const dark = theme.mode === 'dark';
  return {
    dark,
    line:      dark ? '#3A3A3A' : '#D9D9D9',
    lineSoft:  dark ? '#2A2A2A' : '#E8E8E8',
    accent:    dark ? '#E5E5E5' : '#4A4A4A',
    accentDim: dark ? '#A8A8A8' : '#8A8A8A',
    onDark:    '#FFFFFF',
  };
}

function AppContent() {
  const { theme, mode, toggleTheme } = useTheme();
  const mono = useMemo(() => getMono(theme), [theme]);
  const [activeTab, setActiveTab] = useState('Home');
  const isDark = mode === 'dark';

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenTranslateY = useRef(new Animated.Value(0)).current;
  const tabScales = useRef(TABS.map(() => new Animated.Value(1))).current;
  const tabBars = useRef(TABS.map(() => new Animated.Value(0))).current;

  // Sinkronkan indikator tab aktif saat mount
  React.useEffect(() => {
    TABS.forEach((t, i) => {
      Animated.timing(tabBars[i], {
        toValue: t.key === activeTab ? 1 : 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });
  }, [activeTab]);

  const ActiveComponent = TABS.find((t) => t.key === activeTab)?.component;

  const handleTabPress = useCallback(
    (key, index) => {
      if (key === activeTab) return;

      Animated.spring(tabScales[index], {
        toValue: 0.88,
        speed: 40,
        bounciness: 5,
        useNativeDriver: false,
      }).start(() => {
        Animated.spring(tabScales[index], {
          toValue: 1,
          speed: 30,
          bounciness: 12,
          useNativeDriver: false,
        }).start();
      });

      Animated.parallel([
        Animated.timing(screenOpacity, { toValue: 0, duration: 140, useNativeDriver: false }),
        Animated.timing(screenTranslateY, { toValue: -16, duration: 140, useNativeDriver: false }),
      ]).start(() => {
        setActiveTab(key);
        screenTranslateY.setValue(24);
        Animated.parallel([
          Animated.timing(screenOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.spring(screenTranslateY, {
            toValue: 0,
            speed: 20,
            bounciness: 6,
            useNativeDriver: false,
          }),
        ]).start();
      });
    },
    [activeTab]
  );

  const handleNavigate = useCallback(
    (key) => {
      const idx = TABS.findIndex((t) => t.key === key);
      if (idx >= 0) handleTabPress(key, idx);
    },
    [handleTabPress]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={['top']}
    >
      {/* ───────── HEADER ───────── */}
      <View style={[styles.header, { borderBottomColor: mono.lineSoft }]}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.text, borderColor: mono.line },
          ]}
        >
          <Text style={[styles.avatarText, { color: theme.bg }]}>
            {getInitials(profile?.nama)}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[styles.brandName, { color: theme.text }]}
            numberOfLines={1}
          >
            {profile?.nama || 'PORTFOLIO'}
          </Text>
          <Text style={[styles.brandSub, { color: mono.accentDim }]}>
            {profile?.nim ? `NIM ${profile.nim}` : 'PORTFOLIO PERSONAL'}
          </Text>
        </View>

        <Pressable
          onPress={toggleTheme}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isDark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}
          style={({ pressed }) => [
            styles.themeBtn,
            { borderColor: mono.line },
            pressed && { opacity: 0.6, transform: [{ scale: 0.94 }] },
          ]}
        >
          <Text style={{ fontSize: 16, color: theme.text }}>{isDark ? '☀' : '☾'}</Text>
        </Pressable>
      </View>

      {/* ───────── TAB BAR ───────── */}
      <View style={[styles.tabBarWrap, { borderBottomColor: mono.lineSoft }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
        >
          {TABS.map((tab, i) => {
            const focused = activeTab === tab.key;
            const barW = tabBars[i].interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            });
            return (
              <Pressable
                key={tab.key}
                onPress={() => handleTabPress(tab.key, i)}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={tab.label}
              >
                <Animated.View
                  style={[
                    styles.tabItem,
                    { transform: [{ scale: tabScales[i] }] },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: focused ? theme.text : mono.accentDim,
                        fontWeight: focused ? '900' : '500',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {/* Indikator aktif: garis bawah yang tumbuh */}
                  <View style={[styles.tabBarTrack, { backgroundColor: 'transparent' }]}>
                    <Animated.View
                      style={{
                        height: 2,
                        width: barW,
                        backgroundColor: theme.text,
                        borderRadius: 1,
                      }}
                    />
                  </View>
                </Animated.View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ───────── KONTEN ───────── */}
      <Animated.View
        style={{
          flex: 1,
          opacity: screenOpacity,
          transform: [{ translateY: screenTranslateY }],
        }}
      >
        {ActiveComponent && (
          <ActiveComponent
            key={activeTab}
            onNavigate={handleNavigate}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandName: {
    fontFamily: SERIF,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  brandSub: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 3,
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tab bar
  tabBarWrap: { borderBottomWidth: 1 },
  tabBarScroll: { paddingHorizontal: 24, gap: 26 },
  tabItem: {
    paddingTop: 14,
    paddingBottom: 10,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  tabBarTrack: {
    marginTop: 8,
    height: 2,
    width: '100%',
    overflow: 'hidden',
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}