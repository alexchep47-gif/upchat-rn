import type { AppSettings, FeatureFlags, ThemeMode } from '../types';
import { KEYS, loadJson, saveJson } from './storage';

export const defaultFlags: FeatureFlags = {
  lab_ephemeral_identity: true,
  lab_radar_discovery: true,
  lab_favorites_alert: false,
  lab_mesh_relay: false,
  lab_rooms: false,
  lab_urgent_wipe: true,
};

export const defaultSettings: AppSettings = {
  theme: 'dark',
  internetMode: false,
  flags: defaultFlags,
  onboardingDone: false,
};

export async function loadSettings(): Promise<AppSettings> {
  const s = await loadJson<AppSettings>(KEYS.settings, defaultSettings);
  return {
    ...defaultSettings,
    ...s,
    flags: { ...defaultFlags, ...s.flags },
  };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await saveJson(KEYS.settings, settings);
}

export async function setTheme(mode: ThemeMode): Promise<AppSettings> {
  const s = await loadSettings();
  const next = { ...s, theme: mode };
  await saveSettings(next);
  return next;
}
