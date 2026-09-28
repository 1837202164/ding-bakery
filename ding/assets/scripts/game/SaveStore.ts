import type { UnlockId } from '../sim/Types';
import { UNLOCKS } from '../sim/Types';

export interface DingSave {
  bestStars: number;
  dayIndex: number;
  tipsTotal: number;
  unlocks: UnlockId[];
}

const SAVE_KEY = 'ding-save-v1';
const memoryStore: { value: string | null } = { value: null };

function parseUnlocks(raw: unknown): UnlockId[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const valid = new Set(UNLOCKS.map((u) => u.id));
  return raw.filter((id): id is UnlockId => typeof id === 'string' && valid.has(id as UnlockId));
}

function readRaw(): string | null {
  try {
    const wxApi = (globalThis as { wx?: { getStorageSync?: (k: string) => unknown } }).wx;
    if (wxApi?.getStorageSync) {
      const v = wxApi.getStorageSync(SAVE_KEY);
      return typeof v === 'string' ? v : v != null ? JSON.stringify(v) : null;
    }
  } catch {
    // ignore
  }
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(SAVE_KEY);
    }
  } catch {
    // ignore
  }
  return memoryStore.value;
}

function writeRaw(raw: string): void {
  try {
    const wxApi = (globalThis as { wx?: { setStorageSync?: (k: string, v: string) => void } }).wx;
    if (wxApi?.setStorageSync) {
      wxApi.setStorageSync(SAVE_KEY, raw);
      return;
    }
  } catch {
    // ignore
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SAVE_KEY, raw);
      return;
    }
  } catch {
    // ignore
  }
  memoryStore.value = raw;
}

export function loadSave(): DingSave {
  try {
    const raw = readRaw();
    if (!raw) {
      return { bestStars: 0, dayIndex: 1, tipsTotal: 0, unlocks: [] };
    }
    const parsed = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Partial<DingSave>;
    return {
      bestStars: Number(parsed.bestStars) || 0,
      dayIndex: Math.max(1, Number(parsed.dayIndex) || 1),
      tipsTotal: Math.max(0, Number(parsed.tipsTotal) || 0),
      unlocks: parseUnlocks(parsed.unlocks),
    };
  } catch {
    return { bestStars: 0, dayIndex: 1, tipsTotal: 0, unlocks: [] };
  }
}

export function writeSave(save: DingSave): void {
  writeRaw(JSON.stringify(save));
}

export function persistFromSim(sim: {
  getStats: () => { bestStars: number; dayIndex: number; tipsTotal: number };
  getUnlocks: () => UnlockId[];
}): void {
  const stats = sim.getStats();
  writeSave({
    bestStars: stats.bestStars,
    dayIndex: stats.dayIndex,
    tipsTotal: stats.tipsTotal,
    unlocks: sim.getUnlocks(),
  });
}
