import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_RATE = 44100;
const DURATION_SEC = 10;
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION_SEC;
const NUM_CHANNELS = 2;

// Musical profiles for the 15 stories + atlas
const TRACKS = [
  {
    filename: 'atlas.wav',
    name: 'Celestial Atlas',
    root: 216.0, // A3
    scale: [1, 1.25, 1.333, 1.5, 1.875], // Lydian
    drone: [108.0, 216.0, 324.0, 432.0]
  },
  {
    filename: 'cinderella.wav',
    name: 'Cinderella (France)',
    root: 261.63, // C4
    scale: [1, 1.125, 1.25, 1.333, 1.5, 1.667, 1.875], // French Courtly Major
    drone: [130.81, 196.0, 261.63, 392.0]
  },
  {
    filename: 'kongjwi.wav',
    name: 'Kongjwi and Patjwi (Korea)',
    root: 233.08, // Bb3
    scale: [1, 1.125, 1.333, 1.5, 1.667], // Kyemyonjo pentatonic
    drone: [116.54, 174.61, 233.08, 349.23]
  },
  {
    filename: 'yexian.wav',
    name: 'Ye Xian (China)',
    root: 196.0, // G3
    scale: [1, 1.125, 1.25, 1.5, 1.667], // Yu mode pentatonic
    drone: [98.0, 147.0, 196.0, 294.0]
  },
  {
    filename: 'shakuntala.wav',
    name: 'Shakuntala (India)',
    root: 220.0, // A3
    scale: [1, 1.067, 1.25, 1.4, 1.5, 1.6, 1.875], // Bhairavi / Kalyani raga
    drone: [110.0, 165.0, 220.0, 330.0]
  },
  {
    filename: 'vasilisa.wav',
    name: 'Vasilisa the Beautiful (Russia)',
    root: 146.83, // D3
    scale: [1, 1.125, 1.2, 1.333, 1.5, 1.667, 1.8], // Dorian minor
    drone: [73.42, 110.0, 146.83, 220.0]
  },
  {
    filename: 'anansi.wav',
    name: 'Anansi (Ghana)',
    root: 174.61, // F3
    scale: [1, 1.125, 1.25, 1.333, 1.5, 1.667, 1.8], // Mixolydian
    drone: [87.31, 130.81, 174.61, 261.63]
  },
  {
    filename: 'momotaro.wav',
    name: 'Momotaro (Japan)',
    root: 220.0, // A3
    scale: [1, 1.125, 1.333, 1.5, 1.875], // Yo mode heroic
    drone: [110.0, 165.0, 220.0, 330.0]
  },
  {
    filename: 'golden-crab.wav',
    name: 'The Golden Crab (Greece)',
    root: 164.81, // E3
    scale: [1, 1.125, 1.2, 1.333, 1.5, 1.6, 1.8], // Aeolian Mediterranean
    drone: [82.41, 123.47, 164.81, 246.94]
  },
  {
    filename: 'urashima-taro.wav',
    name: 'Urashima Taro (Japan)',
    root: 138.59, // C#3
    scale: [1, 1.125, 1.2, 1.333, 1.5, 1.6, 1.8], // Deep aquatic minor
    drone: [69.3, 103.83, 138.59, 207.65]
  },
  {
    filename: 'sedna.wav',
    name: 'Sedna (Inuit)',
    root: 185.0, // F#3
    scale: [1, 1.125, 1.2, 1.333, 1.414, 1.6], // Arctic mystical
    drone: [92.5, 138.59, 185.0, 277.18]
  },
  {
    filename: 'rhodopis.wav',
    name: 'Rhodopis (Egypt)',
    root: 146.83, // D3
    scale: [1, 1.067, 1.25, 1.333, 1.5, 1.6, 1.875], // Hijaz
    drone: [73.42, 110.0, 146.83, 220.0]
  },
  {
    filename: 'one-hand-girl.wav',
    name: 'The Maiden Without Hands (Swahili)',
    root: 220.0, // A3
    scale: [1, 1.125, 1.25, 1.4, 1.5, 1.75], // Mbira
    drone: [110.0, 165.0, 220.0, 330.0]
  },
  {
    filename: 'mufaro.wav',
    name: 'Mufaro’s Beautiful Daughters (Zimbabwe)',
    root: 196.0, // G3
    scale: [1, 1.125, 1.25, 1.333, 1.5, 1.667, 1.875], // Shona hymn
    drone: [98.0, 147.0, 196.0, 294.0]
  },
  {
    filename: 'popol-vuh-twins.wav',
    name: 'Hero Twins of Popol Vuh (Maya)',
    root: 130.81, // C3
    scale: [1, 1.125, 1.2, 1.333, 1.5, 1.6], // Maya archaic minor
    drone: [65.41, 98.0, 130.81, 196.0]
  },
  {
    filename: 'baba-abdalla.wav',
    name: 'Blind Baba Abdalla (Iraq)',
    root: 233.08, // Bb3
    scale: [1, 1.067, 1.25, 1.333, 1.5, 1.6, 1.875], // Bayati
    drone: [116.54, 174.61, 233.08, 349.23]
  }
];

function generateWavBuffer(track) {
  const bytesPerSample = 2;
  const blockAlign = NUM_CHANNELS * bytesPerSample;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = TOTAL_SAMPLES * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(NUM_CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;

    // Equal-power cosine window for click-free loop
    let loopWindow = 1.0;
    const fadeLen = 0.6;
    if (t < fadeLen) {
      loopWindow = 0.5 * (1 - Math.cos((Math.PI * t) / fadeLen));
    } else if (t > DURATION_SEC - fadeLen) {
      loopWindow = 0.5 * (1 - Math.cos((Math.PI * (DURATION_SEC - t)) / fadeLen));
    }

    const lfo1 = 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.1 * t);
    const lfo2 = 0.7 + 0.3 * Math.cos(2 * Math.PI * 0.08 * t);

    let left = 0;
    let right = 0;

    // 1. Drone layers
    track.drone.forEach((freq, idx) => {
      const pan = (idx % 2 === 0 ? 0.25 : -0.25);
      const amp = 0.16 / (idx + 1);
      const detune = 1.0 + 0.0012 * Math.sin(2 * Math.PI * 0.2 * t * (idx + 1));
      const sig = Math.sin(2 * Math.PI * freq * detune * t);

      left += sig * amp * (0.5 - pan * 0.5) * lfo1;
      right += sig * amp * (0.5 + pan * 0.5) * lfo1;
    });

    // 2. Modal harmonic bell chimes
    track.scale.forEach((interval, sIdx) => {
      const bellFreq = track.root * interval;
      const pulsePhase = (t + sIdx * 1.6) % 3.5;
      if (pulsePhase < 1.4) {
        const bellAmp = 0.09 * Math.exp(-pulsePhase * 2.0);
        const bellPan = Math.sin(sIdx + t * 0.25);
        const bellSig = Math.sin(2 * Math.PI * bellFreq * t) + 0.2 * Math.sin(4 * Math.PI * bellFreq * t);

        left += bellSig * bellAmp * (0.5 - bellPan * 0.4) * lfo2;
        right += bellSig * bellAmp * (0.5 + bellPan * 0.4) * lfo2;
      }
    });

    const masterGain = 0.85 * loopWindow;
    const finalLeft = Math.max(-0.95, Math.min(0.95, Math.tanh(left * masterGain)));
    const finalRight = Math.max(-0.95, Math.min(0.95, Math.tanh(right * masterGain)));

    buffer.writeInt16LE(Math.round(finalLeft * 32767), offset);
    buffer.writeInt16LE(Math.round(finalRight * 32767), offset + 2);
    offset += 4;
  }

  return buffer;
}

const outDir = path.resolve(process.cwd(), 'public/audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log(`Generating 16 high-fidelity audio loops in ${outDir}...`);
for (const track of TRACKS) {
  const filePath = path.join(outDir, track.filename);
  const buf = generateWavBuffer(track);
  fs.writeFileSync(filePath, buf);
  console.log(`✓ ${track.filename} (${(buf.length / 1024 / 1024).toFixed(2)} MB) - ${track.name}`);
}
console.log('All 16 audio loops generated successfully.');
