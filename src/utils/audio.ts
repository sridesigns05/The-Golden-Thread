import { StoryId } from '../types';

// ============================================================================
// THE GOLDEN THREAD — GLOBAL AUDIO MANAGER
// High-fidelity dual-channel crossfading audio engine for 15 world fairytales
// Zero 404s, 100% locally hosted 44.1kHz audio loops, browser autoplay compliant
// ============================================================================

const STORAGE_KEY_AUDIO = 'golden_thread_audio_settings_v3';

// 15 Stories + Celestial Atlas Audio Mapping
export const STORY_AUDIO_MAP: Record<StoryId | 'atlas', { url: string; title: string; mood: string }> = {
  atlas: {
    url: '/audio/atlas.wav',
    title: 'Celestial Spheres & Stardust Harmony',
    mood: 'Ambient Lydian Harmony (A=216Hz)'
  },
  cinderella: {
    url: '/audio/cinderella.wav',
    title: 'Parisian Salon & Glass Slipper Waltz',
    mood: 'French Courtly Major Lydian'
  },
  kongjwi: {
    url: '/audio/kongjwi.wav',
    title: 'Korean Countryside Morning Dew',
    mood: 'Pastoral Kyemyonjo Pentatonic'
  },
  yexian: {
    url: '/audio/yexian.wav',
    title: 'Ancient Lotus Pond & Spirit Fish',
    mood: 'Chinese Yu Mode Water Harp'
  },
  shakuntala: {
    url: '/audio/shakuntala.wav',
    title: 'Malini River Hermitage Longing',
    mood: 'Bhairavi / Kalyani Classical Raga'
  },
  vasilisa: {
    url: '/audio/vasilisa.wav',
    title: 'East Slavic Birch Taiga & Skull Lantern',
    mood: 'Dorian Taiga Forest Minor'
  },
  anansi: {
    url: '/audio/anansi.wav',
    title: 'Ashanti Golden Story Stool & Spun Silk',
    mood: 'Mixolydian Warmth & Kora Resonance'
  },
  momotaro: {
    url: '/audio/momotaro.wav',
    title: 'Inland Sea Peach Expedition',
    mood: 'Heroic Yo Mode Fellowship Aura'
  },
  'golden-crab': {
    url: '/audio/golden-crab.wav',
    title: 'Aegean Sea Waves & Sun King Pilgrimage',
    mood: 'Aeolian Mediterranean Coastal Minor'
  },
  'urashima-taro': {
    url: '/audio/urashima-taro.wav',
    title: 'Sub-Aquatic Coral Palace of Ryugu-jo',
    mood: 'Deep Sub-Aquatic Ocean Ambient'
  },
  sedna: {
    url: '/audio/sedna.wav',
    title: 'Circumpolar Pack Ice & Oceanic Abyss',
    mood: 'Mystical Glacial Pack Ice Tones'
  },
  rhodopis: {
    url: '/audio/rhodopis.wav',
    title: 'Nile Reed Delta & Horus Eagle Soaring',
    mood: 'Ancient Nile Delta Hijaz Mystery'
  },
  'one-hand-girl': {
    url: '/audio/one-hand-girl.wav',
    title: 'Swahili Sacred Baobab Sanctuary',
    mood: 'Gentle Coastal Mbira Harmony'
  },
  'popol-vuh-twins': {
    url: '/audio/popol-vuh-twins.wav',
    title: 'Highland Maya Obsidian Underworld',
    mood: 'Archaic Maya Obsidian Atmosphere'
  },
  // No dedicated tracks yet for these two; they use the atlas theme.
  'tam-cam': {
    url: '/audio/atlas.wav',
    title: 'Celestial Spheres & Stardust Harmony',
    mood: 'Ambient Lydian Harmony (A=216Hz)'
  },
  'fisherman-and-the-jinni': {
    url: '/audio/atlas.wav',
    title: 'Celestial Spheres & Stardust Harmony',
    mood: 'Ambient Lydian Harmony (A=216Hz)'
  }
};

// Global audio state
let isAudioEnabled = false;
let isMuted = false;
let currentVolume = 0.25; // 25% initial volume requirement
let currentTrackId: StoryId | 'atlas' = 'atlas';

// Listeners for UI state reactivity
type AudioStateListener = (state: {
  isAudioEnabled: boolean;
  isMuted: boolean;
  volume: number;
  currentTrackId: StoryId | 'atlas';
  trackTitle: string;
}) => void;

const listeners: Set<AudioStateListener> = new Set();

function notifyListeners() {
  const meta = STORY_AUDIO_MAP[currentTrackId] || STORY_AUDIO_MAP.atlas;
  const state = {
    isAudioEnabled,
    isMuted,
    volume: currentVolume,
    currentTrackId,
    trackTitle: meta.title
  };
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch {
      // Ignore listener error
    }
  });
}

export function subscribeAudioState(fn: AudioStateListener): () => void {
  listeners.add(fn);
  // Immediate call with current state
  const meta = STORY_AUDIO_MAP[currentTrackId] || STORY_AUDIO_MAP.atlas;
  fn({
    isAudioEnabled,
    isMuted,
    volume: currentVolume,
    currentTrackId,
    trackTitle: meta.title
  });
  return () => {
    listeners.delete(fn);
  };
}

// Restore saved preferences
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIO);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.isMuted === 'boolean') isMuted = parsed.isMuted;
      if (typeof parsed.volume === 'number' && parsed.volume >= 0 && parsed.volume <= 1) {
        currentVolume = parsed.volume;
      }
      if (typeof parsed.isAudioEnabled === 'boolean') {
        isAudioEnabled = parsed.isAudioEnabled;
      }
    }
  } catch {
    // Ignore storage parse error
  }
}

function persistSettings() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY_AUDIO,
      JSON.stringify({
        isAudioEnabled,
        isMuted,
        volume: currentVolume
      })
    );
  } catch {
    // Ignore
  }
}

// Dual HTML5 Audio elements for smooth crossfading
let playerA: HTMLAudioElement | null = null;
let playerB: HTMLAudioElement | null = null;
let activePlayerIndex = 0; // 0 for A, 1 for B
let crossfadeTimer: number | null = null;

function getPlayers(): [HTMLAudioElement, HTMLAudioElement] {
  if (typeof window === 'undefined') {
    return [null as unknown as HTMLAudioElement, null as unknown as HTMLAudioElement];
  }
  if (!playerA) {
    playerA = new Audio();
    playerA.loop = true;
    playerA.preload = 'auto';
    playerA.volume = 0;
  }
  if (!playerB) {
    playerB = new Audio();
    playerB.loop = true;
    playerB.preload = 'auto';
    playerB.volume = 0;
  }
  return [playerA, playerB];
}

// Web Audio API context for procedural chime and resonance SFX
let audioCtx: AudioContext | null = null;
let sfxGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      sfxGain = audioCtx.createGain();
      sfxGain.gain.setValueAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime);
      sfxGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Resumes audio context and plays the current track on user gesture
 */
export async function enableAudioByUserGesture(): Promise<boolean> {
  isAudioEnabled = true;
  persistSettings();

  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // Ignore
    }
  }

  const [pA, pB] = getPlayers();
  if (!pA) return false;

  const active = activePlayerIndex === 0 ? pA : pB;
  const meta = STORY_AUDIO_MAP[currentTrackId] || STORY_AUDIO_MAP.atlas;

  if (!active.src || !active.src.endsWith(meta.url)) {
    active.src = meta.url;
  }

  active.volume = isMuted ? 0 : currentVolume;

  try {
    await active.play();
    notifyListeners();
    return true;
  } catch (err) {
    console.warn('[Audio] Autoplay play() rejected:', err);
    return false;
  }
}

/**
 * Switches the active soundtrack with a smooth 1.5-second crossfade
 */
export function switchStoryMusic(storyId: StoryId | null) {
  const targetKey: StoryId | 'atlas' = storyId || 'atlas';

  // Avoid unnecessary restart on every React render if track is already active
  if (targetKey === currentTrackId && isAudioEnabled) {
    return;
  }

  currentTrackId = targetKey;
  notifyListeners();

  if (!isAudioEnabled) {
    return;
  }

  const [pA, pB] = getPlayers();
  if (!pA || !pB) return;

  const currentActive = activePlayerIndex === 0 ? pA : pB;
  const nextActive = activePlayerIndex === 0 ? pB : pA;
  const meta = STORY_AUDIO_MAP[targetKey] || STORY_AUDIO_MAP.atlas;

  // Clear any ongoing crossfade
  if (crossfadeTimer !== null) {
    window.clearInterval(crossfadeTimer);
    crossfadeTimer = null;
  }

  const targetVol = isMuted ? 0 : currentVolume;

  nextActive.src = meta.url;
  nextActive.loop = true;
  nextActive.volume = 0;

  nextActive
    .play()
    .then(() => {
      // 1.5 second crossfade with 30 steps (every 50ms)
      const durationMs = 1500;
      const stepMs = 50;
      const totalSteps = durationMs / stepMs;
      let step = 0;
      const initialActiveVol = currentActive.volume;

      crossfadeTimer = window.setInterval(() => {
        step++;
        const progress = Math.min(1, step / totalSteps);

        // Linear crossfade ramp
        nextActive.volume = Math.max(0, Math.min(1, targetVol * progress));
        currentActive.volume = Math.max(0, Math.min(1, initialActiveVol * (1 - progress)));

        if (progress >= 1) {
          if (crossfadeTimer !== null) {
            window.clearInterval(crossfadeTimer);
            crossfadeTimer = null;
          }
          currentActive.pause();
          currentActive.currentTime = 0;
          activePlayerIndex = activePlayerIndex === 0 ? 1 : 0;
        }
      }, stepMs);
    })
    .catch((err) => {
      console.warn('[Audio] play() blocked or error:', err);
    });
}

/**
 * Sets master volume (0.0 to 1.0)
 */
export function setMasterVolume(vol: number) {
  currentVolume = Math.max(0, Math.min(1, vol));
  persistSettings();

  const [pA, pB] = getPlayers();
  if (pA && pB) {
    const active = activePlayerIndex === 0 ? pA : pB;
    if (!isMuted) {
      active.volume = currentVolume;
    }
  }

  if (sfxGain && audioCtx) {
    sfxGain.gain.setValueAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime);
  }

  notifyListeners();
}

export function getMasterVolume(): number {
  return currentVolume;
}

/**
 * Toggles or sets mute state
 */
export function setSoundMuted(muted: boolean) {
  isMuted = muted;
  persistSettings();

  const [pA, pB] = getPlayers();
  if (pA && pB) {
    const active = activePlayerIndex === 0 ? pA : pB;
    active.volume = isMuted ? 0 : currentVolume;
  }

  if (sfxGain && audioCtx) {
    sfxGain.gain.setValueAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime);
  }

  notifyListeners();
}

export function getSoundMuted(): boolean {
  return isMuted;
}

/**
 * Toggles music enabled
 */
export function setMusicEnabled(enabled: boolean) {
  if (enabled) {
    enableAudioByUserGesture();
  } else {
    isAudioEnabled = false;
    persistSettings();
    const [pA, pB] = getPlayers();
    if (pA) pA.pause();
    if (pB) pB.pause();
    notifyListeners();
  }
}

export function getMusicEnabled(): boolean {
  return isAudioEnabled;
}

export function getCurrentAtmosphereName(): string {
  const meta = STORY_AUDIO_MAP[currentTrackId] || STORY_AUDIO_MAP.atlas;
  return meta.title;
}

// ============================================================================
// PROCEDURAL SOUND EFFECTS (Web Audio API)
// ============================================================================

export function playCelestialChime() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || !sfxGain) return;

  const now = ctx.currentTime;
  const baseFreqs = [540, 720, 1080, 1440];

  baseFreqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
    gain.gain.linearRampToValueAtTime(0.12 * currentVolume, now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

    osc.connect(gain);
    gain.connect(sfxGain!);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 1.3);
  });
}

export function playGoldenThreadResonance() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || !sfxGain) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(432, now);
  osc1.frequency.exponentialRampToValueAtTime(540, now + 1.2);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(864, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.16 * currentVolume, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(sfxGain!);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 2.3);
  osc2.stop(now + 2.3);
}

export function playParchmentRustle() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || !sfxGain) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.12;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = data[i];
    data[i] *= 0.15;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05 * currentVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain!);

  noise.start(now);
}

export function playGentleClick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || !sfxGain) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

  gain.gain.setValueAtTime(0.05 * currentVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

  osc.connect(gain);
  gain.connect(sfxGain!);

  osc.start(now);
  osc.stop(now + 0.035);
}
