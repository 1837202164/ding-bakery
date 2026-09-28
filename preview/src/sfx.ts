import type { SfxCue } from './sim/Types';

let audioCtx: AudioContext | null = null;
let muted = false;
let ambientTimer: number | null = null;

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
  if (muted && ambientTimer !== null) {
    window.clearInterval(ambientTimer);
    ambientTimer = null;
  }
}

export function toggleMute(): boolean {
  setMuted(!muted);
  if (!muted) {
    startAmbient();
  }
  return muted;
}

function ctx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

function beep(freq: number, durationSec: number, type: OscillatorType = 'sine', gain = 0.04): void {
  if (muted) {
    return;
  }
  try {
    const ac = ctx();
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + durationSec);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + durationSec);
  } catch {
    // ignore
  }
}

export function playSfx(cue: SfxCue): void {
  switch (cue) {
    case 'open':
      beep(523, 0.08);
      setTimeout(() => beep(784, 0.12), 70);
      break;
    case 'seat':
      beep(340, 0.05, 'triangle', 0.03);
      break;
    case 'order':
      beep(660, 0.07, 'square', 0.03);
      break;
    case 'bake-step':
      beep(480, 0.05, 'triangle', 0.03);
      break;
    case 'ding':
      beep(880, 0.08);
      setTimeout(() => beep(1175, 0.16), 90);
      break;
    case 'serve':
      beep(700, 0.06);
      setTimeout(() => beep(920, 0.1), 60);
      break;
    case 'sad':
      beep(220, 0.18, 'sawtooth', 0.025);
      break;
    case 'settle':
      beep(392, 0.1);
      setTimeout(() => beep(523, 0.12), 100);
      setTimeout(() => beep(659, 0.16), 220);
      break;
    case 'cancel':
      beep(180, 0.08, 'triangle', 0.03);
      break;
    case 'wave':
      beep(494, 0.07, 'sine', 0.03);
      setTimeout(() => beep(659, 0.1, 'sine', 0.035), 80);
      break;
    case 'tip':
      beep(740, 0.06, 'sine', 0.035);
      setTimeout(() => beep(988, 0.1, 'sine', 0.04), 70);
      break;
    case 'goal':
      beep(523, 0.08);
      setTimeout(() => beep(659, 0.1), 90);
      setTimeout(() => beep(784, 0.14), 200);
      break;
    case 'buy':
      beep(440, 0.06, 'triangle', 0.03);
      setTimeout(() => beep(554, 0.1, 'triangle', 0.035), 80);
      break;
    default:
      break;
  }
}

export function startAmbient(): void {
  unlockAudio();
  if (muted || ambientTimer !== null) {
    return;
  }
  const notes = [262, 330, 392, 523, 392, 330];
  let i = 0;
  const tick = (): void => {
    beep(notes[i % notes.length], 0.55, 'sine', 0.012);
    i += 1;
  };
  tick();
  ambientTimer = window.setInterval(tick, 1400);
}

export function unlockAudio(): void {
  try {
    void ctx();
  } catch {
    // ignore
  }
}
