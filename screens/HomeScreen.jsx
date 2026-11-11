// screens/HomeScreen.jsx — Section bawah: komposisi seimbang + penjelasan lengkap
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, Easing, Platform, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs, LinearGradient as SvgGradient, RadialGradient, Stop, Path, Rect, Circle, Line, Ellipse, G,
} from 'react-native-svg';
import profile from '../data/profile.json';
import skills from '../data/skills.json';
import portfolio from '../data/portfolio.json';
import { useTheme } from '../theme/ThemeContext';

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' });
const ND = Platform.OS !== 'web';
const VB_W = 400;
const VB_H = 330;
const GROUND = 310;

/* ==============================================
   0. PALET
   ============================================== */
function hexToRgb(h) {
  const n = h.replace('#', '');
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

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

    sky: dark ? ['#050505', '#0E0E0E', '#1C1C1C'] : ['#FFFFFF', '#F4F4F4', '#E2E2E2'],
    stoneLit:  dark ? '#3A3A3A' : '#F2F2F2',
    stone:     dark ? '#232323' : '#DADADA',
    stoneShade:dark ? '#101010' : '#B0B0B0',
    backLit:   dark ? '#2A2A2A' : '#EDEDED',
    back:      dark ? '#181818' : '#D0D0D0',
    backShade: dark ? '#0A0A0A' : '#A8A8A8',
    outline:   dark ? '#4A4A4A' : '#8A8A8A',
    mortar:    dark ? 'rgba(0,0,0,0.5)' : 'rgba(60,60,60,0.28)',
    rim:       dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.75)',
    roofLight: dark ? '#5A5A5A' : '#7A7A7A',
    roofDark:  dark ? '#1A1A1A' : '#3A3A3A',
    gate:      dark ? '#000000' : '#2A2A2A',
    hillFar:   dark ? '#141414' : '#E4E4E4',
    hillNear:  dark ? '#0A0A0A' : '#D0D0D0',
    moundTop:  dark ? '#101010' : '#DDDDDD',
    pine:      dark ? '#050505' : '#9A9A9A',
    road:      dark ? '#262626' : '#E8E8E8',
    mist:      dark ? '#E0E0E0' : '#FFFFFF',

    line:      dark ? '#3A3A3A' : '#D9D9D9',
    lineSoft:  dark ? '#2A2A2A' : '#E8E8E8',
    accentDim: dark ? '#A8A8A8' : '#8A8A8A',
    surface:   dark ? '#101010' : '#FFFFFF',
    surfaceAlt:dark ? '#181818' : '#F4F4F4',
  };
}

/* ==============================================
   1. HELPER ANIMASI
   ============================================== */
function stagger(p, i, step = 0.12, span = 0.5) {
  const start = Math.min(i * step, 1 - span);
  return p.interpolate({ inputRange: [start, start + span], outputRange: [0, 1], extrapolate: 'clamp' });
}

function useLoop(duration, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: ND })),
    ]);
    a.start();
    return () => a.stop();
  }, []);
  return v;
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

function RevealSection({ scrollY, viewportH, style, children, threshold = 0.85, duration = 1200 }) {
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
    const id = scrollY.addListener(({ value }) => { lastScroll.current = value; check(); });
    return () => scrollY.removeListener(id);
  }, [check]);

  return (
    <View style={style} onLayout={(e) => { yRef.current = e.nativeEvent.layout.y; check(); }}>
      {children(p)}
    </View>
  );
}

function MaskLine({ progress, index, height, children }) {
  const t = useMemo(() => stagger(progress, index, 0.14, 0.5), [progress]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [height * 1.15, 0] });
  return (
    <View style={{ height, overflow: 'hidden', width: '100%', alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ translateY }], opacity: t }}>{children}</Animated.View>
    </View>
  );
}

function CharReveal({ text, progress, size, mono }) {
  const chars = Array.from(text);
  const n = Math.max(chars.length, 1);
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', height: size * 1.22, overflow: 'hidden' }}>
      {chars.map((c, i) => {
        const start = 0.16 + (i / n) * 0.42;
        const t = progress.interpolate({ inputRange: [start, start + 0.3], outputRange: [0, 1], extrapolate: 'clamp' });
        const ty = t.interpolate({ inputRange: [0, 1], outputRange: [size * 1.2, 0] });
        return (
          <Animated.Text
            key={i}
            style={{
              fontFamily: SERIF, fontSize: size, lineHeight: size * 1.2, fontStyle: 'italic', fontWeight: '700',
              color: mono.goldBright, opacity: t, transform: [{ translateY: ty }],
              textShadowColor: mono.dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.18)',
              textShadowRadius: mono.dark ? 22 : 10, textShadowOffset: { width: 0, height: 0 },
            }}
          >
            {c}
          </Animated.Text>
        );
      })}
    </View>
  );
}

/* ==============================================
   2. LANGIT & KASTIL (TIDAK DIUBAH)
   ============================================== */
const STARS = [
  [8, 40, 2, 0], [18, 110, 3, 400], [30, 64, 2, 900], [44, 26, 2, 1300], [58, 88, 3, 200],
  [70, 40, 2, 700], [82, 150, 2, 1100], [92, 76, 3, 1500], [12, 190, 2, 600], [26, 250, 2, 1000],
  [76, 230, 2, 300], [90, 196, 3, 800], [50, 150, 2, 1400], [64, 20, 2, 500], [36, 170, 2, 1200],
];

function Star({ x, y, size, delay, color }) {
  const p = usePulse(2200 + (delay % 5) * 400, delay);
  const opacity = p.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.95] });
  const scale = p.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.3] });
  return (
    <Animated.View style={{ position: 'absolute', left: `${x}%`, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity, transform: [{ scale }] }} />
  );
}

function ShootingStar({ color }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.delay(4200),
        Animated.timing(v, { toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: ND }),
        Animated.delay(6500),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: ND }),
      ])
    );
    a.start();
    return () => a.stop();
  }, []);
  const tx = v.interpolate({ inputRange: [0, 1], outputRange: [0, -190] });
  const ty = v.interpolate({ inputRange: [0, 1], outputRange: [0, 96] });
  const op = v.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 0.6, 0] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 70, left: '68%', width: 80, height: 2, opacity: op, transform: [{ translateX: tx }, { translateY: ty }, { rotate: '-27deg' }] }}>
      <LinearGradient colors={[color, 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function Moon({ r }) {
  const p = usePulse(5200);
  const scale = p.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  return (
    <Animated.View style={{ position: 'absolute', top: 54, right: -10, width: 140, height: 140, transform: [{ scale }] }}>
      <Svg width={140} height={140} viewBox="0 0 140 140">
        <Defs>
          <RadialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0.25" stopColor={r.goldBright} stopOpacity="0.45" />
            <Stop offset="0.55" stopColor={r.gold} stopOpacity="0.15" />
            <Stop offset="1" stopColor={r.gold} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="moonDisc" cx="40%" cy="38%" r="75%">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor={r.dark ? '#BFBFBF' : '#E0E0E0'} />
          </RadialGradient>
        </Defs>
        <Circle cx={70} cy={70} r={70} fill="url(#moonGlow)" />
        <Circle cx={70} cy={70} r={22} fill="url(#moonDisc)" />
        <Circle cx={62} cy={64} r={4} fill={r.goldDeep} opacity={0.15} />
        <Circle cx={78} cy={77} r={5} fill={r.goldDeep} opacity={0.12} />
        <Circle cx={73} cy={59} r={2.5} fill={r.goldDeep} opacity={0.18} />
      </Svg>
    </Animated.View>
  );
}

function Mountains({ r }) {
  return (
    <Svg width="100%" height={170} viewBox="0 0 400 150" preserveAspectRatio="none">
      <Defs>
        <SvgGradient id="mtFog" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={r.sky[2]} stopOpacity="0" />
          <Stop offset="1" stopColor={r.sky[2]} stopOpacity="0.75" />
        </SvgGradient>
      </Defs>
      <Path d="M0 150 L0 88 L38 58 L68 84 L108 38 L150 80 L190 52 L232 90 L276 44 L320 84 L360 60 L400 86 L400 150 Z" fill={r.hillFar} />
      <Path d="M0 150 L0 112 L50 92 L95 112 L140 84 L190 114 L240 96 L290 116 L340 90 L400 112 L400 150 Z" fill={r.hillNear} opacity={0.85} />
      <Rect x={0} y={0} width={400} height={150} fill="url(#mtFog)" />
    </Svg>
  );
}

/* ==============================================
   3. KASTIL (TIDAK DIUBAH)
   ============================================== */
const WINDOWS = [
  [166, 212, 12, 28, 2], [194, 212, 12, 28, 0], [222, 212, 12, 28, 1],
  [194, 108, 12, 24, 1],
  [124, 196, 10, 22, 2], [125, 240, 8, 18, 0],
  [266, 196, 10, 22, 0], [267, 240, 8, 18, 1],
  [38, 246, 10, 22, 1], [352, 246, 10, 22, 2],
  [84, 272, 4, 16, 0], [312, 272, 4, 16, 2],
];
const ROSE = { cx: 200, cy: 184, r: 15, layer: 1 };
const TORCHES = [[176, 278], [224, 278]];
const FLAGS = [[200, 34, 26, 1.25], [129, 118, 22, 1], [271, 118, 22, 1], [43, 226, 18, 0.8], [357, 226, 18, 0.8]];

const arch = (x, y, w, h) => {
  const rr = w / 2;
  return `M${x} ${y + h} L${x} ${y + rr} A${rr} ${rr} 0 0 1 ${x + w} ${y + rr} L${x + w} ${y + h} Z`;
};

function bricks(x, y, w, h, row = 12) {
  let d = '';
  let i = 0;
  for (let yy = y + row; yy < y + h - 2; yy += row, i++) {
    d += `M${x} ${yy}H${x + w}`;
    const off = (i % 2) * 9;
    for (let xx = x + off + 9; xx < x + w - 2; xx += 18) d += `M${xx} ${yy - row}V${yy}`;
  }
  return d;
}

function roseSpokes(cx, cy, rad) {
  let d = '';
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    d += `M${cx} ${cy}L${(cx + Math.cos(a) * rad).toFixed(2)} ${(cy + Math.sin(a) * rad).toFixed(2)}`;
  }
  return d;
}

function pinePath(x, y, h, w) {
  return (
    `M${x} ${y - h}L${x + w * 0.55} ${y - h * 0.55}L${x - w * 0.55} ${y - h * 0.55}Z` +
    `M${x} ${y - h * 0.78}L${x + w * 0.8} ${y - h * 0.26}L${x - w * 0.8} ${y - h * 0.26}Z` +
    `M${x} ${y - h * 0.52}L${x + w} ${y - 3}L${x - w} ${y - 3}Z` +
    `M${x - 1.5} ${y - 4}H${x + 1.5}V${y}H${x - 1.5}Z`
  );
}

const CastleSvg = React.memo(function CastleSvg({ r, w }) {
  const h = (w * VB_H) / VB_W;
  const G0 = GROUND;

  const body = (x, top, bw, fill, key, bottom = G0) => (
    <G key={key}>
      <Rect x={x} y={top} width={bw} height={bottom - top} fill={fill} stroke={r.outline} strokeWidth={1.2} />
      <Path d={bricks(x, top, bw, bottom - top)} stroke={r.mortar} strokeWidth={0.7} fill="none" />
      <Rect x={x + bw - 2} y={top} width={2} height={bottom - top} fill={r.rim} />
    </G>
  );

  const crenels = (x, top, cw, n, key) => {
    const mw = 10;
    return (
      <G key={key}>
        {Array.from({ length: n }).map((_, i) => (
          <Rect key={i} x={x + (i * (cw - mw)) / (n - 1)} y={top - 9} width={mw} height={9} fill={r.stone} stroke={r.outline} strokeWidth={1} />
        ))}
        <Rect x={x - 2} y={top - 1} width={cw + 4} height={3.5} fill={r.outline} />
      </G>
    );
  };

  const roof = (cx, base, apex, half, key) => (
    <G key={key}>
      <Path d={`M${cx - half} ${base} L${cx} ${apex} L${cx} ${base} Z`} fill={r.roofDark} />
      <Path d={`M${cx + half} ${base} L${cx} ${apex} L${cx} ${base} Z`} fill={r.roofLight} />
      <Path d={`M${cx} ${apex} L${cx - half * 0.55} ${base} M${cx} ${apex} L${cx + half * 0.55} ${base}`} stroke="rgba(0,0,0,0.2)" strokeWidth={0.8} fill="none" />
      <Rect x={cx - half - 3} y={base - 2} width={half * 2 + 6} height={5} rx={1.5} fill={r.outline} />
      <Circle cx={cx} cy={apex} r={2.6} fill={r.goldBright} />
    </G>
  );

  const banner = (x, y, bw, bh, key) => (
    <G key={key}>
      <Path d={`M${x} ${y} H${x + bw} V${y + bh} L${x + bw / 2} ${y + bh - 8} L${x} ${y + bh} Z`} fill={r.roofLight} />
      <Rect x={x} y={y} width={bw} height={3} fill={r.goldBright} />
      <Circle cx={x + bw / 2} cy={y + 16} r={2.4} fill={r.goldBright} opacity={0.9} />
    </G>
  );

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      <Defs>
        <SvgGradient id="cs-stone" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={r.stoneLit} />
          <Stop offset="0.5" stopColor={r.stone} />
          <Stop offset="1" stopColor={r.stoneShade} />
        </SvgGradient>
        <SvgGradient id="cs-back" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={r.backLit} />
          <Stop offset="0.5" stopColor={r.back} />
          <Stop offset="1" stopColor={r.backShade} />
        </SvgGradient>
        <SvgGradient id="cs-mound" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={r.moundTop} />
          <Stop offset="1" stopColor={r.hillNear} />
        </SvgGradient>
      </Defs>

      {body(66, 254, 40, 'url(#cs-back)', 'wl')}
      {crenels(66, 254, 40, 3, 'wlc')}
      {body(294, 254, 40, 'url(#cs-back)', 'wr')}
      {crenels(294, 254, 40, 3, 'wrc')}

      {body(106, 176, 46, 'url(#cs-back)', 'ml')}
      {roof(129, 176, 118, 29, 'mlr')}
      {body(248, 176, 46, 'url(#cs-back)', 'mr')}
      {roof(271, 176, 118, 29, 'mrr')}

      {body(20, 226, 46, 'url(#cs-stone)', 'ol')}
      {crenels(20, 226, 46, 3, 'olc')}
      {body(334, 226, 46, 'url(#cs-stone)', 'or')}
      {crenels(334, 226, 46, 3, 'orc')}

      {body(152, 150, 96, 'url(#cs-stone)', 'keep')}
      {crenels(152, 150, 96, 6, 'keepc')}
      <Rect x={152} y={246} width={96} height={4} fill={r.outline} />
      {body(174, 96, 52, 'url(#cs-stone)', 'bel', 150)}
      {roof(200, 96, 34, 34, 'belr')}

      {FLAGS.map(([cx, apex, len], i) => (
        <Line key={`p${i}`} x1={cx} y1={apex} x2={cx} y2={apex - len} stroke={r.outline} strokeWidth={1.6} />
      ))}

      {banner(156, 158, 10, 50, 'b1')}
      {banner(234, 158, 10, 50, 'b2')}

      {WINDOWS.map(([x, y, ww, hh], i) => (
        <Path key={`w${i}`} d={arch(x, y, ww, hh)} fill={r.gold} fillOpacity={0.4} stroke={r.outline} strokeWidth={1} />
      ))}
      <Circle cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r + 3} fill={r.stoneShade} stroke={r.gold} strokeWidth={1.4} />
      <Circle cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r} fill="rgba(0,0,0,0.45)" />
      <Circle cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r} fill={r.gold} fillOpacity={0.25} />
      <Path d={roseSpokes(ROSE.cx, ROSE.cy, ROSE.r)} stroke={r.gold} strokeWidth={0.9} fill="none" />
      <Circle cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r * 0.34} fill="none" stroke={r.gold} strokeWidth={0.9} />

      <Path d="M186 310 V284 A14 14 0 0 1 214 284 V310 Z" fill={r.gate} stroke={r.gold} strokeWidth={2} />
      <Path d="M193 272 V310 M200 270 V310 M207 272 V310 M186 292 H214 M186 302 H214" stroke={r.gold} strokeOpacity={0.55} strokeWidth={0.9} fill="none" />

      <Path d={`M0 ${VB_H} L0 316 C50 300 110 296 160 306 C190 312 210 312 240 306 C290 296 350 300 400 316 L400 ${VB_H} Z`} fill="url(#cs-mound)" />
      <Path d="M186 309 L214 309 L250 330 L150 330 Z" fill={r.road} opacity={0.9} />
      <Path d="M200 312 L200 330" stroke={r.gold} strokeOpacity={0.4} strokeWidth={1.2} strokeDasharray="4 5" />

      <Path d={pinePath(8, 322, 48, 12) + pinePath(26, 320, 34, 9) + pinePath(48, 316, 26, 8) + pinePath(392, 322, 52, 13) + pinePath(372, 320, 36, 10) + pinePath(350, 316, 28, 8)} fill={r.pine} />
    </Svg>
  );
});

function WindowLayer({ r, w, layer }) {
  const h = (w * VB_H) / VB_W;
  const items = WINDOWS.filter((it) => it[4] === layer);
  const rose = ROSE.layer === layer;
  const torches = layer === 3;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id={`wg${layer}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={r.goldBright} stopOpacity="0.6" />
          <Stop offset="1" stopColor={r.goldBright} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`fl${layer}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {items.map(([x, y, ww, hh], i) => (
        <G key={i}>
          <Circle cx={x + ww / 2} cy={y + hh / 2} r={Math.max(ww, hh) * 1.2} fill={`url(#wg${layer})`} />
          <Path d={arch(x, y, ww, hh)} fill={r.goldBright} />
        </G>
      ))}
      {rose && (
        <G>
          <Circle cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r * 2.2} fill={`url(#wg${layer})`} />
          <Circle cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r} fill={r.goldBright} fillOpacity={0.85} />
          <Path d={roseSpokes(ROSE.cx, ROSE.cy, ROSE.r)} stroke={r.goldDeep} strokeWidth={1} fill="none" />
          <Circle cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r * 0.34} fill="none" stroke={r.goldDeep} strokeWidth={1} />
        </G>
      )}
      {torches &&
        TORCHES.map(([x, y], i) => (
          <G key={`t${i}`}>
            <Circle cx={x} cy={y} r={15} fill={`url(#fl${layer})`} />
            <Ellipse cx={x} cy={y} rx={2.6} ry={4.4} fill="#F0F0F0" />
          </G>
        ))}
    </Svg>
  );
}

function FlagOverlay({ r, cx, top, size, wave, s }) {
  const W = 26 * size * s;
  const H = 14 * size * s;
  const rot = wave.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '10deg'] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: cx * s, top: top * s, width: W, height: H, transform: [{ translateX: -W / 2 }, { rotate: rot }, { translateX: W / 2 }] }}>
      <Svg width={W} height={H} viewBox="0 0 26 14">
        <Path d="M0 0 L26 2 L20 7 L26 12 L0 14 Z" fill={r.goldBright} />
        <Path d="M0 0 L26 2 L20 7 L26 12 L0 14 Z" fill={r.gold} fillOpacity={0.35} />
        <Circle cx={7} cy={7} r={2.2} fill={r.roofDark} />
      </Svg>
    </Animated.View>
  );
}

function Ember({ left, bottom, rise, delay, duration, size, drift, color }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.out(Easing.quad), useNativeDriver: ND })),
    ]);
    a.start();
    return () => a.stop();
  }, []);
  const ty = v.interpolate({ inputRange: [0, 1], outputRange: [0, -rise] });
  const tx = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, drift, -drift * 0.5] });
  const op = v.interpolate({ inputRange: [0, 0.12, 0.7, 1], outputRange: [0, 1, 0.55, 0] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left, bottom, width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: op, transform: [{ translateY: ty }, { translateX: tx }], shadowColor: color, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }} />
  );
}

const EMBERS = [
  { x: 190, delay: 0, duration: 5200, size: 3, drift: 14 },
  { x: 214, delay: 1400, duration: 6200, size: 2, drift: -18 },
  { x: 168, delay: 2600, duration: 5600, size: 3, drift: 20 },
  { x: 236, delay: 800, duration: 6600, size: 2, drift: -14 },
  { x: 200, delay: 3400, duration: 5000, size: 4, drift: 10 },
  { x: 140, delay: 4200, duration: 6000, size: 2, drift: 18 },
  { x: 262, delay: 2000, duration: 5800, size: 3, drift: -20 },
  { x: 182, delay: 4800, duration: 6400, size: 2, drift: 12 },
];

function Mist({ r, w, s, top, delay, dur, id }) {
  const p = usePulse(dur, delay);
  const tx = p.interpolate({ inputRange: [0, 1], outputRange: [-28 * s, 28 * s] });
  const op = p.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: -w * 0.1, width: w * 1.2, top, height: 56 * s, opacity: op, transform: [{ translateX: tx }] }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
        <Defs>
          <SvgGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={r.mist} stopOpacity="0" />
            <Stop offset="0.5" stopColor={r.mist} stopOpacity={r.dark ? 0.22 : 0.55} />
            <Stop offset="1" stopColor={r.mist} stopOpacity="0" />
          </SvgGradient>
        </Defs>
        <Ellipse cx={50} cy={10} rx={50} ry={9} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

function CastleScene({ r, w, rise }) {
  const s = w / VB_W;
  const h = w * (VB_H / VB_W);
  const waveA = usePulse(2400);
  const waveB = usePulse(2900, 500);
  const l0 = usePulse(2600, 0);
  const l1 = usePulse(3300, 700);
  const l2 = usePulse(2100, 300);
  const l3 = usePulse(900, 0);
  const layers = [l0, l1, l2, l3];
  const lo = (v, lo_) => v.interpolate({ inputRange: [0, 1], outputRange: [lo_, 1] });

  const riseOp = rise.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const riseTY = rise.interpolate({ inputRange: [0, 1], outputRange: [56, 0] });

  return (
    <Animated.View style={{ width: w, height: h, opacity: riseOp, transform: [{ translateY: riseTY }] }}>
      <CastleSvg r={r} w={w} />
      {layers.map((v, i) => (
        <Animated.View key={i} pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: lo(v, i === 3 ? 0.55 : 0.35) }]}>
          <WindowLayer r={r} w={w} layer={i} />
        </Animated.View>
      ))}
      {FLAGS.map(([cx, apex, len, size], i) => (
        <FlagOverlay key={i} r={r} cx={cx} top={apex - len} size={size} wave={i % 2 ? waveB : waveA} s={s} />
      ))}
      <Mist r={r} w={w} s={s} top={h - 78 * s} delay={0} dur={9000} id="mistA" />
      <Mist r={r} w={w} s={s} top={h - 58 * s} delay={2500} dur={11000} id="mistB" />
      {EMBERS.map((e, i) => (
        <Ember key={i} left={e.x * s} bottom={90 * s} rise={230 * s} delay={e.delay} duration={e.duration} size={e.size} drift={e.drift * s} color={r.goldBright} />
      ))}
    </Animated.View>
  );
}

/* ==============================================
   4. STAT & MARQUEE (TIDAK DIUBAH)
   ============================================== */
function Stat({ p, index, value, label, icon, onPress, mono, styles }) {
  const t = useMemo(() => stagger(p, index, 0.18, 0.6), [p]);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const isNum = typeof value === 'number';
  const press = useRef(new Animated.Value(0)).current;
  const go = (v) => Animated.timing(press, { toValue: v, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();

  return (
    <Animated.View style={[styles.statCard, { opacity: t, transform: [{ translateY: ty }], backgroundColor: mono.surface, borderColor: mono.lineSoft }]}>
      <Pressable onPress={onPress} onPressIn={() => go(1)} onPressOut={() => go(0)} onHoverIn={() => go(1)} onHoverOut={() => go(0)} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, paddingVertical: 20, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', opacity: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.75] }), transform: [{ scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] }) }] }}>
          {icon ? <Text style={[styles.statIcon, { color: mono.accentDim }]}>{icon}</Text> : null}
          {isNum ? (
            <CountText progress={t} to={value} pad={2} style={[styles.statNum, { color: mono.ink }]} />
          ) : (
            <Text style={[styles.statNum, { color: mono.ink }]}>{value}</Text>
          )}
          <View style={[styles.statDivider, { backgroundColor: mono.line }]} />
          <Text style={[styles.statLabel, { color: mono.accentDim }]}>{label}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function Marquee({ items, mono }) {
  const x = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!w) return;
    x.setValue(0);
    const a = Animated.loop(Animated.timing(x, { toValue: -w, duration: (w / 45) * 1000, easing: Easing.linear, useNativeDriver: ND }));
    a.start();
    return () => a.stop();
  }, [w]);
  const seq = (
    <Text numberOfLines={1} style={{ fontFamily: SERIF, fontSize: 13, fontWeight: '700', letterSpacing: 4, color: mono.accentDim }}>
      {items.map((s, i) => (
        <Text key={i}>
          {String(s).toUpperCase()}
          <Text style={{ color: mono.gold }}>{'   ◆   '}</Text>
        </Text>
      ))}
    </Text>
  );
  return (
    <View style={{ height: 46, overflow: 'hidden', borderTopWidth: 1, borderBottomWidth: 1, borderColor: mono.gold + '55', marginBottom: 44, justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', left: 0, flexDirection: 'row', transform: [{ translateX: x }] }}>
        <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>{seq}</View>
        {seq}
        {seq}
      </Animated.View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   ▸▸▸ SECTION BAWAH: KOMPOSISI SEIMBANG ◂◂◂
   ═══════════════════════════════════════════ */

/* ───── Visual Ornamen (besar, sebagai "gambar") ───── */
function VisualOrnament({ type, mono, size = 180 }) {
  if (type === 'rings') {
    return (
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx={100} cy={100} r={90} fill="none" stroke={mono.lineSoft} strokeWidth={1} />
        <Circle cx={100} cy={100} r={72} fill="none" stroke={mono.lineSoft} strokeWidth={1} strokeDasharray="3 5" />
        <Circle cx={100} cy={100} r={54} fill="none" stroke={mono.gold} strokeWidth={1.5} />
        <Circle cx={100} cy={100} r={36} fill="none" stroke={mono.lineSoft} strokeWidth={1} />
        <Circle cx={100} cy={100} r={8} fill={mono.gold} />
        <Circle cx={100} cy={12} r={3} fill={mono.gold} />
        <Circle cx={188} cy={100} r={3} fill={mono.gold} />
        <Circle cx={100} cy={188} r={3} fill={mono.gold} />
        <Circle cx={12} cy={100} r={3} fill={mono.gold} />
      </Svg>
    );
  }
  if (type === 'diamond') {
    return (
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Path d="M100 20 L180 100 L100 180 L20 100 Z" fill="none" stroke={mono.gold} strokeWidth={1.5} />
        <Path d="M100 45 L155 100 L100 155 L45 100 Z" fill="none" stroke={mono.lineSoft} strokeWidth={1} />
        <Path d="M100 70 L130 100 L100 130 L70 100 Z" fill="none" stroke={mono.lineSoft} strokeWidth={1} />
        <Path d="M100 88 L112 100 L100 112 L88 100 Z" fill={mono.gold} />
        <Path d="M100 20 L100 45 M180 100 L155 100 M100 180 L100 155 M20 100 L45 100" stroke={mono.lineSoft} strokeWidth={1} />
        <Circle cx={100} cy={20} r={2.5} fill={mono.gold} />
        <Circle cx={180} cy={100} r={2.5} fill={mono.gold} />
        <Circle cx={100} cy={180} r={2.5} fill={mono.gold} />
        <Circle cx={20} cy={100} r={2.5} fill={mono.gold} />
      </Svg>
    );
  }
  if (type === 'grid') {
    return (
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {[40, 80, 120, 160].map((y) => (
          <Line key={`h${y}`} x1={20} y1={y} x2={180} y2={y} stroke={mono.lineSoft} strokeWidth={1} />
        ))}
        {[40, 80, 120, 160].map((x) => (
          <Line key={`v${x}`} x1={x} y1={20} x2={x} y2={180} stroke={mono.lineSoft} strokeWidth={1} />
        ))}
        <Rect x={20} y={20} width={160} height={160} fill="none" stroke={mono.gold} strokeWidth={1.2} />
        <Circle cx={80} cy={80} r={5} fill={mono.gold} />
        <Circle cx={120} cy={120} r={5} fill={mono.gold} />
        <Circle cx={160} cy={40} r={5} fill={mono.gold} />
        <Circle cx={40} cy={160} r={5} fill={mono.gold} />
      </Svg>
    );
  }
  if (type === 'wave') {
    return (
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Path
            key={i}
            d={`M20 ${40 + i * 24} Q70 ${20 + i * 24} 120 ${40 + i * 24} T220 ${40 + i * 24}`}
            fill="none"
            stroke={i === 2 ? mono.gold : mono.lineSoft}
            strokeWidth={i === 2 ? 1.8 : 1}
          />
        ))}
        <Circle cx={20} cy={88} r={3} fill={mono.gold} />
        <Circle cx={200} cy={88} r={3} fill={mono.gold} />
      </Svg>
    );
  }
  if (type === 'orbit') {
    return (
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Ellipse cx={100} cy={100} rx={90} ry={40} fill="none" stroke={mono.lineSoft} strokeWidth={1} />
        <Ellipse cx={100} cy={100} rx={60} ry={90} fill="none" stroke={mono.lineSoft} strokeWidth={1} />
        <Circle cx={100} cy={100} r={28} fill="none" stroke={mono.gold} strokeWidth={1.5} />
        <Circle cx={100} cy={100} r={8} fill={mono.gold} />
        <Circle cx={190} cy={100} r={4} fill={mono.gold} />
        <Circle cx={100} cy={10} r={4} fill={mono.gold} />
        <Circle cx={10} cy={100} r={3} fill={mono.gold} />
        <Circle cx={100} cy={190} r={3} fill={mono.gold} />
      </Svg>
    );
  }
  return null;
}

/* ───── SECTION HEADER: nomor + eyebrow + judul + garis ───── */
function SectionHeader({ no, eyebrow, title, p, mono, styles }) {
  const t = useMemo(() => stagger(p, 0, 0.1, 0.6), [p]);
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] });
  return (
    <Animated.View style={[styles.sectionHead, { opacity: t, transform: [{ translateX: tx }] }]}>
      <Text style={[styles.sectionNo, { color: mono.gold }]}>{no}</Text>
      <View style={styles.sectionTitleWrap}>
        <Text style={[styles.sectionEyebrow, { color: mono.accentDim }]}>{eyebrow}</Text>
        <Text style={[styles.sectionTitle, { color: mono.ink }]}>{title}</Text>
        <View style={[styles.sectionUnderline, { backgroundColor: mono.lineSoft }]}>
          <Animated.View style={{ height: 1, width: t.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: mono.gold }} />
        </View>
      </View>
    </Animated.View>
  );
}

/* ───── SPLIT: teks (60%) + visual (40%) dengan divider vertikal ───── */
function SplitSection({ p, mono, styles, visual, caption, children }) {
  const t = useMemo(() => stagger(p, 1, 0.15, 0.6), [p]);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  return (
    <Animated.View style={[styles.splitRow, { opacity: t, transform: [{ translateY: ty }] }]}>
      <View style={styles.splitText}>{children}</View>
      <View style={[styles.splitDivider, { backgroundColor: mono.lineSoft }]} />
      <View style={styles.splitVisual}>
        <View style={styles.visualInner}>{visual}</View>
        {!!caption && (
          <Text style={[styles.visualCaption, { color: mono.accentDim }]}>{caption}</Text>
        )}
      </View>
    </Animated.View>
  );
}

/* ───── Intro paragraph di setiap section ───── */
function Intro({ text, mono, styles, p, index = 1 }) {
  const t = stagger(p, index, 0.12, 0.6);
  return (
    <Animated.Text style={[styles.intro, { color: mono.inkSoft, opacity: t }]}>
      {text}
    </Animated.Text>
  );
}

/* ───── Link button ───── */
function LinkBtn({ label, onPress, mono, styles }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.linkBtn, { borderColor: mono.line }, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.linkText, { color: mono.ink }]}>{label}</Text>
      <Text style={[styles.linkArrow, { color: mono.gold }]}>→</Text>
    </Pressable>
  );
}

/* ==============================================
   5. LAYAR UTAMA
   ============================================== */
export default function HomeScreen({ onNavigate }) {
  const { theme } = useTheme();
  const mono = useMemo(() => getMono(theme), [theme]);
  const styles = useMemo(() => createStyles(), []);
  const { width: winW, height: winH } = useWindowDimensions();

  const scrollY = useRef(new Animated.Value(0)).current;
  const [viewportH, setViewportH] = useState(winH);
  const [contentH, setContentH] = useState(1);
  const [bandH, setBandH] = useState(120);

  const intro = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(intro, { toValue: 1, duration: 2800, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    Animated.timing(rise, { toValue: 1, duration: 2000, delay: 450, easing: Easing.out(Easing.cubic), useNativeDriver: ND }).start();
  }, []);
  const dot = usePulse(1800);

  const firstName = (profile?.nama || 'User').split(' ')[0];
  const safeSkills = Array.isArray(skills) ? skills : [];
  const safePortfolio = Array.isArray(portfolio) ? portfolio : [];
  const topSkills = [...safeSkills].sort((a, b) => (Number(b?.level) || 0) - (Number(a?.level) || 0)).slice(0, 3);

  const badgeT = useMemo(() => stagger(intro, 0, 0.12, 0.45), [intro]);
  const dividerT = useMemo(() => stagger(intro, 4, 0.12, 0.45), [intro]);
  const subT = useMemo(() => stagger(intro, 5, 0.12, 0.45), [intro]);
  const btnT = useMemo(() => stagger(intro, 6, 0.12, 0.4), [intro]);
  const lineW = dividerT.interpolate({ inputRange: [0, 1], outputRange: [0, 56] });

  const skyTY = scrollY.interpolate({ inputRange: [0, 500], outputRange: [0, 60], extrapolate: 'clamp' });
  const mtnTY = scrollY.interpolate({ inputRange: [0, 500], outputRange: [0, 100], extrapolate: 'clamp' });
  const castleTY = scrollY.interpolate({ inputRange: [0, 500], outputRange: [0, 130], extrapolate: 'clamp' });
  const heroTY = scrollY.interpolate({ inputRange: [0, 400], outputRange: [0, 70], extrapolate: 'clamp' });
  const heroOpacity = scrollY.interpolate({ inputRange: [0, 380], outputRange: [1, 0], extrapolate: 'clamp' });
  const progressW = scrollY.interpolate({ inputRange: [0, Math.max(1, contentH - viewportH)], outputRange: ['0%', '100%'], extrapolate: 'clamp' });

  const dotScale = dot.interpolate({ inputRange: [0, 1], outputRange: [1, 2] });
  const dotOpacity = dot.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] });

  const glow = usePulse(4200);
  const glowOp = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.9] });

  const castleW = Math.min(winW, 540);
  const nameSize = Math.max(44, Math.min(74, Math.floor((Math.min(winW, 520) - 56) / (Math.max(firstName.length, 3) * 0.6))));
  const starColor = mono.dark ? '#FFFFFF' : mono.gold;
  const isNarrow = winW < 380;

  return (
    <View style={{ flex: 1 }} onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}>
      <View pointerEvents="none" style={styles.progressTrack}>
        <Animated.View style={{ height: '100%', width: progressW }}>
          <LinearGradient colors={[mono.gold, mono.goldBright]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onContentSizeChange={(_, h) => setContentH(h)}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
        {/* ================= HERO (TIDAK DIUBAH) ================= */}
        <View style={styles.hero}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient colors={mono.sky} style={StyleSheet.absoluteFill} />
          </View>

          <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 1, transform: [{ translateY: skyTY }] }]} pointerEvents="none">
            <View style={[StyleSheet.absoluteFill, { opacity: mono.dark ? 1 : 0.5 }]}>
              {STARS.map(([x, y, size, delay], i) => (
                <Star key={i} x={x} y={y} size={size} delay={delay} color={starColor} />
              ))}
            </View>
            {mono.dark && <ShootingStar color="#FFFFFF" />}
            <Moon r={mono} />
          </Animated.View>

          <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 2, transform: [{ translateY: mtnTY }] }]} pointerEvents="none">
            <Animated.View style={{ position: 'absolute', left: '50%', marginLeft: -260, bottom: bandH - 40, width: 520, height: 260, opacity: glowOp }}>
              <Svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                <Defs>
                  <RadialGradient id="horizon" cx="50%" cy="100%" r="75%">
                    <Stop offset="0" stopColor={mono.gold} stopOpacity={mono.dark ? 0.28 : 0.32} />
                    <Stop offset="0.5" stopColor={mono.roofLight} stopOpacity={mono.dark ? 0.12 : 0.08} />
                    <Stop offset="1" stopColor={mono.gold} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect x={0} y={0} width={100} height={50} fill="url(#horizon)" />
              </Svg>
            </Animated.View>
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: bandH - 14 }}>
              <Mountains r={mono} />
            </View>
          </Animated.View>

          <Animated.View style={[styles.textBlock, { opacity: heroOpacity, transform: [{ translateY: heroTY }] }]}>
            <Animated.View style={[styles.badgeWrap, { opacity: badgeT, transform: [{ translateY: badgeT.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) }], borderColor: mono.gold }]}>
              <View style={styles.dotWrap}>
                <Animated.View style={[styles.dotHalo, { opacity: dotOpacity, transform: [{ scale: dotScale }], backgroundColor: mono.gold }]} />
                <View style={[styles.dotCore, { backgroundColor: mono.gold }]} />
              </View>
              <Text style={[styles.badgeText, { color: mono.gold }]}>{'♛\uFE0E'}  THE ROYAL PORTFOLIO  {'♛\uFE0E'}</Text>
            </Animated.View>

            <MaskLine progress={intro} index={1} height={46}>
              <Text style={[styles.greeting, { color: mono.ink }]}>Halo, saya</Text>
            </MaskLine>
            <CharReveal text={firstName} progress={intro} size={nameSize} mono={mono} />

            <View style={styles.ornament}>
              <Animated.View style={{ height: 1, width: lineW, backgroundColor: mono.gold }} />
              <Animated.View style={{ width: 9, height: 9, backgroundColor: mono.gold, marginHorizontal: 12, transform: [{ rotate: '45deg' }, { scale: dividerT }] }} />
              <Animated.View style={{ height: 1, width: lineW, backgroundColor: mono.gold }} />
            </View>

            <Animated.View style={{ opacity: subT, alignItems: 'center', transform: [{ translateY: subT.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
              <Text style={[styles.subHeadline, { color: mono.accentDim }]}>
                Mahasiswa {profile?.program_studi || 'Sistem Informasi'} yang berfokus pada pengembangan aplikasi dan desain antarmuka.
              </Text>
              {!!profile?.universitas && <Text style={[styles.univ, { color: mono.gold }]}>{String(profile.universitas).toUpperCase()}</Text>}
            </Animated.View>
          </Animated.View>

          <Animated.View style={{ zIndex: 5, marginTop: 6, transform: [{ translateY: castleTY }] }}>
            <CastleScene r={mono} w={castleW} rise={rise} />
          </Animated.View>

          <View style={[styles.band, { backgroundColor: mono.dark ? '#0A0A0A' : '#D0D0D0', borderTopColor: mono.gold + '88' }]} onLayout={(e) => setBandH(e.nativeEvent.layout.height)}>
            <Animated.View style={[styles.btnRow, { opacity: btnT, transform: [{ translateY: btnT.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}>
              <Pressable onPress={() => onNavigate?.('Portfolio')} style={({ pressed }) => [styles.btnPrimary, { backgroundColor: mono.gold }, pressed && { opacity: 0.85 }]}>
                <Text style={[styles.btnPrimaryText, { color: mono.dark ? '#0A0A0A' : '#FFFFFF' }]}>LIHAT KARYA</Text>
              </Pressable>
              <Pressable onPress={() => onNavigate?.('Contact')} style={({ pressed }) => [styles.btnOutline, { borderColor: mono.gold }, pressed && { opacity: 0.7 }]}>
                <Text style={[styles.btnOutlineText, { color: mono.ink }]}>KONTAK SAYA</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* ================= STATS (3 kartu) ================= */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.statsRow}>
          {(p) => (
            <>
              <Stat p={p} index={0} value={safeSkills.length} label="KEAHLIAN" icon="◆" onPress={() => onNavigate?.('Skills')} mono={mono} styles={styles} />
              <Stat p={p} index={1} value={safePortfolio.length} label="KARYA" icon="▣" onPress={() => onNavigate?.('Portfolio')} mono={mono} styles={styles} />
              <Stat p={p} index={2} value="A" label="GRADE" icon="★" onPress={() => onNavigate?.('Score')} mono={mono} styles={styles} />
            </>
          )}
        </RevealSection>

        {safeSkills.length > 0 && <Marquee items={safeSkills.map((s) => s?.nama || '-')} mono={mono} />}

        {/* ═════════════════════════════════════════
            ▸▸▸ SECTION BAWAH ◂◂◂
            ═════════════════════════════════════════ */}

        {/* 01 — TENTANG */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.section}>
          {(p) => (
            <>
              <SectionHeader no="01" eyebrow="PROFIL SINGKAT" title="TENTANG SAYA" p={p} mono={mono} styles={styles} />
              <SplitSection
                p={p} mono={mono} styles={styles}
                visual={<VisualOrnament type="diamond" mono={mono} size={isNarrow ? 120 : 160} />}
                caption="// IDENTITAS"
              >
                <Intro
                  p={p} mono={mono} styles={styles} index={1}
                  text={profile?.deskripsi || 'Mahasiswa Sistem Informasi yang menekuni dunia teknologi dengan semangat belajar tinggi. Berfokus pada pengembangan aplikasi mobile, web, dan desain antarmuka yang bersih.'}
                />
                <View style={styles.infoRow}>
                  <View style={[styles.infoCell, { borderRightWidth: 1, borderRightColor: mono.lineSoft }]}>
                    <Text style={[styles.infoLabel, { color: mono.accentDim }]}>NIM</Text>
                    <Text style={[styles.infoValue, { color: mono.ink }]} numberOfLines={1}>{profile?.nim || '—'}</Text>
                  </View>
                  <View style={[styles.infoCell, { paddingLeft: 12 }]}>
                    <Text style={[styles.infoLabel, { color: mono.accentDim }]}>SEMESTER</Text>
                    <Text style={[styles.infoValue, { color: mono.ink }]} numberOfLines={1}>{profile?.semester || '—'}</Text>
                  </View>
                </View>
                <LinkBtn label="SELENGKAPNYA" onPress={() => onNavigate?.('About')} mono={mono} styles={styles} />
              </SplitSection>
            </>
          )}
        </RevealSection>

        {/* 02 — KARYA */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.section} duration={1400}>
          {(p) => (
            <>
              <SectionHeader no="02" eyebrow="PORTOFOLIO" title="KARYA TERBARU" p={p} mono={mono} styles={styles} />
              <SplitSection
                p={p} mono={mono} styles={styles}
                visual={<VisualOrnament type="rings" mono={mono} size={isNarrow ? 120 : 160} />}
                caption="// 3 PROYEK"
              >
                <Intro
                  p={p} mono={mono} styles={styles} index={1}
                  text="Beberapa karya yang telah saya kerjakan — mulai dari aplikasi mobile, web, hingga desain antarmuka. Setiap proyek punya tantangan dan pelajaran tersendiri."
                />
                {safePortfolio.slice(0, 3).map((item, i) => (
                  <Animated.View
                    key={item.judul || i}
                    style={[
                      styles.listItem,
                      i < 2 && { borderBottomWidth: 1, borderBottomColor: mono.lineSoft },
                      { opacity: stagger(p, i + 2, 0.15, 0.5) },
                    ]}
                  >
                    <Text style={[styles.listNo, { color: mono.gold }]}>{String(i + 1).padStart(2, '0')}</Text>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.listTitle, { color: mono.ink }]} numberOfLines={1}>{item.judul || 'Proyek'}</Text>
                      <Text style={[styles.listMeta, { color: mono.accentDim }]} numberOfLines={1}>{item.kategori || '—'} · {item.tahun || '—'}</Text>
                    </View>
                  </Animated.View>
                ))}
                <View style={{ marginTop: 14 }}>
                  <LinkBtn label="SEMUA KARYA" onPress={() => onNavigate?.('Portfolio')} mono={mono} styles={styles} />
                </View>
              </SplitSection>
            </>
          )}
        </RevealSection>

        {/* 03 — KEAHLIAN */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.section} duration={1400}>
          {(p) => (
            <>
              <SectionHeader no="03" eyebrow="KOMPETENSI" title="KEAHLIAN UTAMA" p={p} mono={mono} styles={styles} />
              <SplitSection
                p={p} mono={mono} styles={styles}
                visual={<VisualOrnament type="wave" mono={mono} size={isNarrow ? 130 : 170} />}
                caption="// SKILL"
              >
                <Intro
                  p={p} mono={mono} styles={styles} index={1}
                  text="Keahlian yang saya pelajari dan kembangkan secara konsisten. Setiap skill punya tingkat penguasaan yang saya ukur dari latihan dan proyek nyata."
                />
                {topSkills.map((s, i) => {
                  const level = Math.max(0, Math.min(100, Number(s?.level) || 0));
                  const st = stagger(p, i + 2, 0.15, 0.5);
                  const w = st.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${level}%`] });
                  return (
                    <View key={s?.nama || i} style={[styles.skillRow, i < topSkills.length - 1 && { borderBottomWidth: 1, borderBottomColor: mono.lineSoft }]}>
                      <View style={styles.skillHead}>
                        <Text style={[styles.skillName, { color: mono.ink }]} numberOfLines={1}>
                          <Text style={{ color: mono.gold, fontWeight: '800' }}>{String(i + 1).padStart(2, '0')}{'  '}</Text>
                          {s?.nama || '-'}
                        </Text>
                        <Text style={[styles.skillPct, { color: mono.gold }]}>{level}%</Text>
                      </View>
                      <View style={[styles.skillTrack, { backgroundColor: mono.lineSoft }]}>
                        <Animated.View style={[styles.skillFill, { width: w, backgroundColor: mono.gold }]} />
                      </View>
                    </View>
                  );
                })}
                <View style={{ marginTop: 14 }}>
                  <LinkBtn label="SEMUA KEAHLIAN" onPress={() => onNavigate?.('Skills')} mono={mono} styles={styles} />
                </View>
              </SplitSection>
            </>
          )}
        </RevealSection>

        {/* 04 — NILAI */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.section} duration={1400}>
          {(p) => (
            <>
              <SectionHeader no="04" eyebrow="AKADEMIK" title="NILAI TERKINI" p={p} mono={mono} styles={styles} />
              <SplitSection
                p={p} mono={mono} styles={styles}
                visual={<VisualOrnament type="grid" mono={mono} size={isNarrow ? 120 : 150} />}
                caption="// AKADEMIK"
              >
                <Intro
                  p={p} mono={mono} styles={styles} index={1}
                  text="Ringkasan nilai akademik semester ini. Detail lengkap dengan rincian komponen penilaian bisa dilihat di halaman nilai."
                />
                <View style={styles.scoreRow}>
                  <View style={styles.scoreCell}>
                    <Text style={[styles.scoreLabel, { color: mono.accentDim }]}>NILAI AKHIR</Text>
                    <CountText progress={stagger(p, 2, 0.2, 0.6)} to={88} pad={0} style={[styles.scoreValue, { color: mono.ink }]} />
                  </View>
                  <View style={[styles.scoreDivider, { backgroundColor: mono.lineSoft }]} />
                  <View style={styles.scoreCell}>
                    <Text style={[styles.scoreLabel, { color: mono.accentDim }]}>GRADE</Text>
                    <Text style={[styles.scoreGrade, { color: mono.gold }]}>A</Text>
                  </View>
                </View>
                <View style={{ marginTop: 14 }}>
                  <LinkBtn label="DETAIL NILAI" onPress={() => onNavigate?.('Score')} mono={mono} styles={styles} />
                </View>
              </SplitSection>
            </>
          )}
        </RevealSection>

        {/* 05 — KONTAK */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.section} duration={1400}>
          {(p) => (
            <>
              <SectionHeader no="05" eyebrow="HUBUNGI" title="KONTAK" p={p} mono={mono} styles={styles} />
              <SplitSection
                p={p} mono={mono} styles={styles}
                visual={<VisualOrnament type="orbit" mono={mono} size={isNarrow ? 120 : 160} />}
                caption="// TERHUBUNG"
              >
                <Intro
                  p={p} mono={mono} styles={styles} index={1}
                  text="Terbuka untuk diskusi, kolaborasi, atau sekadar bertukar pikiran. Jangan ragu untuk menghubungi saya melalui salah satu kanal berikut."
                />
                {[
                  profile?.email && { key: 'email', icon: '✉', label: 'EMAIL', value: profile.email },
                  profile?.telepon && { key: 'wa', icon: '☎', label: 'WHATSAPP', value: profile.telepon },
                  profile?.lokasi && { key: 'lokasi', icon: '◉', label: 'LOKASI', value: profile.lokasi },
                ].filter(Boolean).map((row, i, arr) => (
                  <View key={row.key} style={[styles.contactRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: mono.lineSoft }]}>
                    <Text style={[styles.contactIcon, { color: mono.gold }]}>{row.icon}</Text>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.contactLabel, { color: mono.accentDim }]}>{row.label}</Text>
                      <Text style={[styles.contactValue, { color: mono.ink }]} numberOfLines={1}>{row.value}</Text>
                    </View>
                  </View>
                ))}
                <View style={{ marginTop: 14 }}>
                  <LinkBtn label="HUBUNGI SAYA" onPress={() => onNavigate?.('Contact')} mono={mono} styles={styles} />
                </View>
              </SplitSection>
            </>
          )}
        </RevealSection>

        {/* ================= FOOTER ================= */}
        <RevealSection scrollY={scrollY} viewportH={viewportH} style={styles.footer} duration={1400}>
          {(p) => (
            <Animated.View style={{ alignItems: 'center', opacity: p, transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }}>
              <View style={styles.footerOrnament}>
                <View style={{ height: 1, width: 40, backgroundColor: mono.gold, opacity: 0.6 }} />
                <Text style={[styles.footerCrown, { color: mono.gold }]}>{'♛\uFE0E'}</Text>
                <View style={{ height: 1, width: 40, backgroundColor: mono.gold, opacity: 0.6 }} />
              </View>
              <Text style={[styles.footerText, { color: mono.accentDim }]}>
                {profile?.nama?.toUpperCase() || 'PORTFOLIO'} · {new Date().getFullYear()}
              </Text>
            </Animated.View>
          )}
        </RevealSection>
      </Animated.ScrollView>
    </View>
  );
}

/* ==============================================
   6. STYLES
   ============================================== */
const createStyles = () =>
  StyleSheet.create({
    progressTrack: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 20 },

    /* HERO (tidak diubah) */
    hero: { alignItems: 'center', overflow: 'hidden', paddingTop: 52 },
    textBlock: { alignItems: 'center', width: '100%', maxWidth: 520, paddingHorizontal: 24, zIndex: 10 },
    badgeWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, marginBottom: 22, borderWidth: 1 },
    dotWrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    dotHalo: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
    dotCore: { width: 6, height: 6, borderRadius: 3 },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 2.5 },
    greeting: { fontFamily: SERIF, fontSize: 32, fontWeight: '300', lineHeight: 44, letterSpacing: 2 },
    ornament: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 18 },
    subHeadline: { fontSize: 14, textAlign: 'center', lineHeight: 22, maxWidth: 340 },
    univ: { fontSize: 10, fontWeight: '800', letterSpacing: 3, marginTop: 12, textAlign: 'center' },

    band: { alignSelf: 'stretch', zIndex: 8, paddingVertical: 26, paddingHorizontal: 24, alignItems: 'center', borderTopWidth: 1, marginTop: -1 },
    btnRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
    btnPrimary: { height: 50, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 2, overflow: 'hidden' },
    btnPrimaryText: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    btnOutline: { height: 50, paddingHorizontal: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 2, borderWidth: 1.5, overflow: 'hidden' },
    btnOutlineText: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },

    /* STATS */
    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 44, paddingBottom: 40 },
    statCard: { flex: 1, borderWidth: 1, borderRadius: 6, overflow: 'hidden' },
    statIcon: { fontSize: 13, marginBottom: 8 },
    statNum: { fontFamily: SERIF, fontSize: 32, fontWeight: '700', letterSpacing: -0.6, lineHeight: 36 },
    statDivider: { width: 20, height: 1, marginVertical: 8, opacity: 0.7 },
    statLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2.4, textAlign: 'center' },

    /* SECTION (non-kotak) */
    section: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16 },

    /* SECTION HEADER */
    sectionHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 24 },
    sectionNo: { fontFamily: SERIF, fontSize: 36, fontWeight: '700', fontStyle: 'italic', letterSpacing: -1.5, lineHeight: 40 },
    sectionTitleWrap: { flex: 1, paddingTop: 4 },
    sectionEyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 2.5, marginBottom: 4 },
    sectionTitle: { fontFamily: SERIF, fontSize: 20, fontWeight: '700', letterSpacing: -0.3, marginBottom: 8 },
    sectionUnderline: { height: 1, overflow: 'hidden' },

    /* SPLIT: teks + divider + visual */
    splitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 0 },
    splitText: { flex: 1.5, paddingRight: 16 },
    splitDivider: { width: 1, alignSelf: 'stretch', marginTop: 4, marginBottom: 4 },
    splitVisual: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 16, paddingTop: 4 },
    visualInner: { alignItems: 'center', justifyContent: 'center' },
    visualCaption: { fontSize: 8, fontWeight: '800', letterSpacing: 2, marginTop: 12, textAlign: 'center' },

    /* INTRO PARAGRAF */
    intro: { fontSize: 13, lineHeight: 21, marginBottom: 16 },

    /* INFO ROW (Tentang) */
    infoRow: { flexDirection: 'row', marginBottom: 16 },
    infoCell: { flex: 1, paddingHorizontal: 8, paddingVertical: 8, alignItems: 'flex-start' },
    infoLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.6, marginBottom: 4 },
    infoValue: { fontFamily: SERIF, fontSize: 14, fontWeight: '700' },

    /* LIST (Karya) */
    listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
    listNo: { fontFamily: SERIF, fontSize: 13, fontStyle: 'italic', fontWeight: '700', width: 24 },
    listTitle: { fontFamily: SERIF, fontSize: 14, fontWeight: '700', marginBottom: 2 },
    listMeta: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },

    /* SKILL (Keahlian) */
    skillRow: { paddingVertical: 10 },
    skillHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, gap: 8 },
    skillName: { fontFamily: SERIF, fontSize: 13, fontWeight: '700', flex: 1 },
    skillPct: { fontSize: 11, fontWeight: '900' },
    skillTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
    skillFill: { height: 3, borderRadius: 2 },

    /* SCORE */
    scoreRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 16 },
    scoreCell: { flex: 1, alignItems: 'center' },
    scoreDivider: { width: 1, height: 48 },
    scoreLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.8, marginBottom: 4 },
    scoreValue: { fontFamily: SERIF, fontSize: 36, fontWeight: '700', letterSpacing: -1.5, lineHeight: 40 },
    scoreGrade: { fontFamily: SERIF, fontSize: 36, fontWeight: '700', fontStyle: 'italic', letterSpacing: -1.5, lineHeight: 40 },

    /* CONTACT */
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
    contactIcon: { fontSize: 14, fontWeight: '900', width: 20 },
    contactLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.6, marginBottom: 2 },
    contactValue: { fontFamily: SERIF, fontSize: 13, fontWeight: '700' },

    /* LINK BUTTON */
    linkBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1 },
    linkText: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
    linkArrow: { fontSize: 12, fontWeight: '900' },

    /* FOOTER */
    footer: { paddingTop: 56, paddingBottom: 48, paddingHorizontal: 24, alignItems: 'center' },
    footerOrnament: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    footerCrown: { fontSize: 20, marginHorizontal: 12 },
    footerText: { fontSize: 9, fontWeight: '800', letterSpacing: 2.5 },
  });