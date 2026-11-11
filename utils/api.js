// utils/api.js
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Port backend API. Sesuaikan jika backend Anda di port lain.
 * Backend harus jalan di komputer yang SAMA dengan Metro bundler.
 */
const API_PORT = 3000;

/**
 * URL fallback untuk production (saat hostUri kosong).
 * Ganti dengan domain produksi Anda.
 */
const PRODUCTION_API_URL = 'https://api.namadomain.com';

/**
 * Ambil host IP Metro bundler.
 * Prioritas: hostUri → debuggerHost → localhost.
 */
function getMetroHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (!hostUri) return null;
  const host = String(hostUri).split(':')[0];
  return host || null;
}

/**
 * Deteksi otomatis alamat API berdasarkan IP Metro bundler.
 * - Development: ikut IP komputer (pindah WiFi = otomatis baru)
 * - Production: pakai PRODUCTION_API_URL
 */
export function getApiBaseUrl() {
  // 1. Env variable (paling prioritas, bisa override)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');

  // 2. Dev: ikut IP Metro
  const metroHost = getMetroHost();
  if (metroHost) {
    return `http://${metroHost}:${API_PORT}`;
  }

  // 3. Fallback web
  if (Platform.OS === 'web') {
    return `http://localhost:${API_PORT}`;
  }

  // 4. Fallback Android emulator (10.0.2.2 = host machine)
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  // 5. Production
  return PRODUCTION_API_URL;
}

/**
 * Fetch wrapper dengan base URL otomatis + JSON handling.
 * Melempar Error dengan pesan yang jelas saat gagal.
 */
export async function apiFetch(path, options = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;

  const controller = new AbortController();
  const timeoutMs = options.timeout ?? 15000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(
        `API ${res.status}: ${text || res.statusText || 'Gagal memanggil server'}`
      );
    }

    // Kalau response kosong (204), kembalikan null
    if (res.status === 204) return null;

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (err) {
    clearTimeout(timer);
    if (err?.name === 'AbortError') {
      throw new Error('Server tidak merespons (timeout).');
    }
    if (err?.message?.includes('Network request failed')) {
      throw new Error(
        'Tidak bisa terhubung ke server. Pastikan HP & komputer di WiFi yang sama, backend jalan, dan firewall mengizinkan.'
      );
    }
    throw err;
  }
}

/** Debug: tampilkan base URL saat app start */
export function logApiBaseUrl() {
  // eslint-disable-next-line no-console
  console.log('[API] Base URL:', getApiBaseUrl());
}