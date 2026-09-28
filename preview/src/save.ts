const SAVE_KEY = 'ding-save-v1';

import type { UnlockId } from './sim/Types';
import { UNLOCKS } from './sim/Types';

export interface DingSave {
  bestStars: number;
  dayIndex: number;
  tipsTotal: number;
  unlocks: UnlockId[];
}

function parseUnlocks(raw: unknown): UnlockId[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const valid = new Set(UNLOCKS.map((u) => u.id));
  return raw.filter((id): id is UnlockId => typeof id === 'string' && valid.has(id as UnlockId));
}

export function loadSave(): DingSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return { bestStars: 0, dayIndex: 1, tipsTotal: 0, unlocks: [] };
    }
    const parsed = JSON.parse(raw) as Partial<DingSave>;
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
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}
