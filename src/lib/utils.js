import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function playAdhanBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime;
    const notes = [
      [523, t,      0.35],
      [659, t+0.4,  0.35],
      [784, t+0.8,  0.45],
      [659, t+1.3,  0.30],
      [784, t+1.65, 0.55],
    ];
    notes.forEach(([freq, start, dur]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.28, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
    setTimeout(() => ctx.close(), 3000);
  } catch {
    // AudioContext not available or error creating audio
  }
}
