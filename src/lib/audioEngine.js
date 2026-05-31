// Web Audio API based piano sound engine
let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

// Three octaves: C3, C4, C5 etc.
const BASE_FREQUENCIES = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.00,
  A: 440.00,
  B: 493.88,
};

// note format: 'C4', 'D3', 'G5' etc.
function getNoteFreq(note) {
  const letter = note.slice(0, -1);
  const octave = parseInt(note.slice(-1));
  const base = BASE_FREQUENCIES[letter];
  if (!base) return null;
  // Relative to octave 4
  return base * Math.pow(2, octave - 4);
}

// Key colors with 3 octave depth levels
// oct3 (lowest/bottom row) = darkest/most saturated
// oct4 (middle row) = medium
// oct5 (highest/top row) = lighter but still visible
export const KEY_COLORS = {
  C: {
    oct3: { bg: '#C94040', glow: '#E06060' },
    oct4: { bg: '#E8807E', glow: '#F4A8A6' },
    oct5: { bg: '#F5B8BA', glow: '#FAD4D5' },
    label: 'Do',
  },
  D: {
    oct3: { bg: '#B86010', glow: '#D88030' },
    oct4: { bg: '#E89840', glow: '#F4B870' },
    oct5: { bg: '#F5C880', glow: '#FAD8A0' },
    label: 'Re',
  },
  E: {
    oct3: { bg: '#A08800', glow: '#C0A820' },
    oct4: { bg: '#D4B830', glow: '#E8D060' },
    oct5: { bg: '#EDD870', glow: '#F5E898' },
    label: 'Mi',
  },
  F: {
    oct3: { bg: '#287840', glow: '#409860' },
    oct4: { bg: '#5CB870', glow: '#88D098' },
    oct5: { bg: '#8ED4A0', glow: '#B4E4C0' },
    label: 'Fa',
  },
  G: {
    oct3: { bg: '#1C60B0', glow: '#3C80CC' },
    oct4: { bg: '#5898C8', glow: '#80B8E0' },
    oct5: { bg: '#88B8D8', glow: '#AACED8' },
    label: 'Sol',
  },
  A: {
    oct3: { bg: '#602890', glow: '#8048B0' },
    oct4: { bg: '#9A60C0', glow: '#B888D8' },
    oct5: { bg: '#BE98D8', glow: '#D4B8E8' },
    label: 'La',
  },
  B: {
    oct3: { bg: '#A82060', glow: '#C84080' },
    oct4: { bg: '#D86898', glow: '#E898B8' },
    oct5: { bg: '#E898B8', glow: '#F4B8CC' },
    label: 'Si',
  },
};

// Three octaves of notes
export const NOTES_3OCT = [
  'C3','D3','E3','F3','G3','A3','B3',
  'C4','D4','E4','F4','G4','A4','B4',
  'C5','D5','E5','F5','G5','A5','B5',
];

// For backward compat (single octave)
export const NOTES = ['C','D','E','F','G','A','B'];

export const INSTRUMENTS = [
  { id: 'piano',     name: '鋼琴',  emoji: '🎹' },
  { id: 'xylophone', name: '木琴',  emoji: '🎼' },
  { id: 'organ',     name: '風琴',  emoji: '🎶' },
  { id: 'guitar',    name: '吉他',  emoji: '🎸' },
  { id: 'drums',     name: '鼓聲',  emoji: '🥁' },
];

// 21 distinct percussion sounds mapped to notes across 3 octaves
// Each entry: [octave, letter] → sound type
const DRUM_MAP = {
  // OCT 3 (low row): Big deep percussion
  'C3': 'kick',        // 大鼓 Bass Kick
  'D3': 'floor_tom',   // 地鼓 Floor Tom
  'E3': 'bass_drum2',  // 深低音鼓
  'F3': 'taiko',       // 太鼓 Taiko
  'G3': 'gong',        // 鑼 Gong
  'A3': 'bass_tom',    // 低音桶鼓
  'B3': 'conga_low',   // 康加鼓（低）
  // OCT 4 (mid row): Mid percussion  
  'C4': 'snare',       // 小鼓 Snare
  'D4': 'hi_tom',      // 高桶鼓 Hi Tom
  'E4': 'mid_tom',     // 中桶鼓 Mid Tom
  'F4': 'conga_hi',    // 康加鼓（高）
  'G4': 'bongo',       // 邦哥鼓 Bongo
  'A4': 'clap',        // 拍手 Handclap
  'B4': 'rimshot',     // 鼓框 Rimshot
  // OCT 5 (high row): High metallic/bright
  'C5': 'hihat_closed',// 閉合鈸 Hi-hat Closed
  'D5': 'hihat_open',  // 開放鈸 Hi-hat Open
  'E5': 'crash',       // 碎音鈸 Crash Cymbal
  'F5': 'ride',        // 踩鈸 Ride Cymbal
  'G5': 'cowbell',     // 牛鈴 Cowbell
  'A5': 'woodblock',   // 木魚 Woodblock
  'B5': 'triangle_bell',// 三角鐵 Triangle
};

function makeNoise(ctx, duration) {
  const bufSize = ctx.sampleRate * duration;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

function playDrum(fullNote, ctx) {
  const type = DRUM_MAP[fullNote] || 'snare';
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  switch (type) {
    case 'kick': {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(180, t);
      o.frequency.exponentialRampToValueAtTime(35, t + 0.3);
      gain.gain.setValueAtTime(1.0, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      o.connect(gain); o.start(t); o.stop(t + 0.4);
      break;
    }
    case 'bass_drum2': {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.35);
      gain.gain.setValueAtTime(0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
      o.connect(gain); o.start(t); o.stop(t + 0.45);
      break;
    }
    case 'floor_tom': {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(100, t);
      o.frequency.exponentialRampToValueAtTime(60, t + 0.25);
      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      o.connect(gain); o.start(t); o.stop(t + 0.3);
      break;
    }
    case 'bass_tom': {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(70, t + 0.22);
      gain.gain.setValueAtTime(0.75, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
      o.connect(gain); o.start(t); o.stop(t + 0.28);
      break;
    }
    case 'taiko': {
      // Deep resonant taiko — sine + noise burst
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(80, t);
      o.frequency.exponentialRampToValueAtTime(50, t + 0.5);
      gain.gain.setValueAtTime(0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
      o.connect(gain); o.start(t); o.stop(t + 0.6);
      // noise punch
      const n = makeNoise(ctx, 0.05);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.5, t);
      ng.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      n.connect(ng); ng.connect(ctx.destination); n.start(t);
      break;
    }
    case 'gong': {
      // Gong: long metallic decay with multiple harmonics
      [220, 330, 550, 880].forEach((freq, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.35 / (i + 1), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 2.5);
      });
      break;
    }
    case 'snare': {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(200, t);
      o.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      o.connect(gain); o.start(t); o.stop(t + 0.15);
      const n = makeNoise(ctx, 0.18);
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 3000; f.Q.value = 0.5;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.45, t);
      ng.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
      n.connect(f); f.connect(ng); ng.connect(ctx.destination); n.start(t);
      break;
    }
    case 'hi_tom': {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(300, t);
      o.frequency.exponentialRampToValueAtTime(180, t + 0.15);
      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      o.connect(gain); o.start(t); o.stop(t + 0.2);
      break;
    }
    case 'mid_tom': {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(130, t + 0.18);
      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
      o.connect(gain); o.start(t); o.stop(t + 0.22);
      break;
    }
    case 'conga_low': {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(180, t);
      o.frequency.exponentialRampToValueAtTime(100, t + 0.2);
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      o.connect(gain); o.start(t); o.stop(t + 0.25);
      break;
    }
    case 'conga_hi': {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(350, t);
      o.frequency.exponentialRampToValueAtTime(200, t + 0.15);
      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
      o.connect(gain); o.start(t); o.stop(t + 0.18);
      break;
    }
    case 'bongo': {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(500, t);
      o.frequency.exponentialRampToValueAtTime(320, t + 0.1);
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      o.connect(gain); o.start(t); o.stop(t + 0.12);
      break;
    }
    case 'clap': {
      // Layered noise bursts for handclap
      [0, 0.02, 0.04].forEach(delay => {
        const n = makeNoise(ctx, 0.06);
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 0.7;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.4, t + delay);
        g.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.07);
        n.connect(f); f.connect(g); g.connect(ctx.destination);
        n.start(t + delay);
      });
      break;
    }
    case 'rimshot': {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.setValueAtTime(800, t);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
      o.connect(gain); o.start(t); o.stop(t + 0.06);
      const n = makeNoise(ctx, 0.04);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.3, t); ng.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
      n.connect(ng); ng.connect(ctx.destination); n.start(t);
      break;
    }
    case 'hihat_closed': {
      const n = makeNoise(ctx, 0.06);
      const f = ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 9000;
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
      n.connect(f); f.connect(gain); n.start(t);
      break;
    }
    case 'hihat_open': {
      const n = makeNoise(ctx, 0.4);
      const f = ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 7000;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      n.connect(f); f.connect(gain); n.start(t);
      break;
    }
    case 'crash': {
      const n = makeNoise(ctx, 1.2);
      const f = ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 5000;
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);
      n.connect(f); f.connect(gain); n.start(t);
      // shimmer
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = 4200;
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.15, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      o.connect(og); og.connect(ctx.destination); o.start(t); o.stop(t + 0.8);
      break;
    }
    case 'ride': {
      [2000, 4100, 6300].forEach((freq, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.2 / (i + 1), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.6);
      });
      break;
    }
    case 'cowbell': {
      [562, 845].forEach((freq) => {
        const o = ctx.createOscillator();
        o.type = 'square'; o.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 2;
        o.connect(f); f.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 0.5);
      });
      break;
    }
    case 'woodblock': {
      const o = ctx.createOscillator();
      o.type = 'square'; o.frequency.value = 1200;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 8;
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      o.connect(f); f.connect(gain); o.start(t); o.stop(t + 0.08);
      break;
    }
    case 'triangle_bell': {
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = 2800;
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
      o.connect(gain); o.start(t); o.stop(t + 1.8);
      break;
    }
    default: {
      const o = ctx.createOscillator();
      o.type = 'triangle'; o.frequency.value = 300;
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      o.connect(gain); o.start(t); o.stop(t + 0.15);
    }
  }
}

// Instrument sound configs
const INSTRUMENT_CONFIGS = {
  piano: {
    osc1Type: 'triangle',
    osc2Type: 'sine',
    osc2Mult: 2,
    filterFreq: 2000,
    attackTime: 0.02,
    decayTime: 1.2,
    peakGain: 0.4,
  },
  xylophone: {
    osc1Type: 'sine',
    osc2Type: 'sine',
    osc2Mult: 3,
    filterFreq: 4000,
    attackTime: 0.005,
    decayTime: 0.7,
    peakGain: 0.5,
  },
  organ: {
    osc1Type: 'square',
    osc2Type: 'sine',
    osc2Mult: 2,
    filterFreq: 1500,
    attackTime: 0.01,
    decayTime: 1.8,
    peakGain: 0.25,
  },
  guitar: {
    osc1Type: 'sawtooth',
    osc2Type: 'triangle',
    osc2Mult: 0.5,
    filterFreq: 800,
    attackTime: 0.01,
    decayTime: 0.9,
    peakGain: 0.3,
  },
};

// note: 'C4' or 'C' (defaults octave 4), instrument: one of INSTRUMENTS ids
export function playNote(note, instrument = 'piano') {
  const ctx = getAudioContext();
  // Support both 'C' and 'C4' formats
  const fullNote = /\d/.test(note) ? note : `${note}4`;
  const letter = fullNote.slice(0, -1);

  // Drums use a special engine
  if (instrument === 'drums') {
    playDrum(fullNote, ctx);
    return;
  }

  const freq = getNoteFreq(fullNote);
  if (!freq) return;

  const cfg = INSTRUMENT_CONFIGS[instrument] || INSTRUMENT_CONFIGS.piano;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filterNode = ctx.createBiquadFilter();

  osc1.type = cfg.osc1Type;
  osc1.frequency.setValueAtTime(freq, ctx.currentTime);

  osc2.type = cfg.osc2Type;
  osc2.frequency.setValueAtTime(freq * cfg.osc2Mult, ctx.currentTime);

  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(cfg.filterFreq, ctx.currentTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(cfg.peakGain, ctx.currentTime + cfg.attackTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + cfg.decayTime);

  osc1.connect(filterNode);
  osc2.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + cfg.decayTime);
  osc2.stop(ctx.currentTime + cfg.decayTime);
}

// Song notes use octave notation e.g. 'C4'
export const SONGS = [
  {
    id: 'twinkle',
    name: '小星星',
    emoji: '⭐',
    color: '#FFD93D',
    tempo: 480,
    // Full Twinkle Twinkle Little Star (2 verses)
    notes: [
      'C4','C4','G4','G4','A4','A4','G4',
      'F4','F4','E4','E4','D4','D4','C4',
      'G4','G4','F4','F4','E4','E4','D4',
      'G4','G4','F4','F4','E4','E4','D4',
      'C4','C4','G4','G4','A4','A4','G4',
      'F4','F4','E4','E4','D4','D4','C4',
    ],
  },
  {
    id: 'mary',
    name: '瑪莉有隻小綿羊',
    emoji: '🐑',
    color: '#6BCB77',
    tempo: 430,
    // Full Mary Had a Little Lamb (2 verses)
    notes: [
      'E4','D4','C4','D4','E4','E4','E4',
      'D4','D4','D4','E4','G4','G4',
      'E4','D4','C4','D4','E4','E4','E4',
      'E4','D4','D4','E4','D4','C4',
      'E4','D4','C4','D4','E4','E4','E4',
      'D4','D4','D4','E4','G4','G4',
      'E4','D4','C4','D4','E4','E4','E4',
      'E4','D4','D4','E4','D4','C4',
    ],
  },
  {
    id: 'jingle',
    name: '聖誕鈴聲',
    emoji: '🎄',
    color: '#FF4B4B',
    tempo: 380,
    // Full Jingle Bells (verse + chorus x2)
    notes: [
      'E4','E4','E4',
      'E4','E4','E4',
      'E4','G4','C4','D4','E4',
      'F4','F4','F4','F4',
      'F4','E4','E4','E4',
      'E4','D4','D4','E4','D4','G4',
      'E4','E4','E4',
      'E4','E4','E4',
      'E4','G4','C4','D4','E4',
      'F4','F4','F4','F4',
      'F4','E4','E4','E4',
      'G4','G4','F4','D4','C4',
    ],
  },
  {
    id: 'birthday',
    name: '生日快樂',
    emoji: '🎂',
    color: '#9B59B6',
    tempo: 480,
    // Full Happy Birthday (sung twice)
    notes: [
      'C4','C4','D4','C4','F4','E4',
      'C4','C4','D4','C4','G4','F4',
      'C4','C4','C5','A4','F4','E4','D4',
      'A4','A4','G4','F4','G4','F4',
      'C4','C4','D4','C4','F4','E4',
      'C4','C4','D4','C4','G4','F4',
      'C4','C4','C5','A4','F4','E4','D4',
      'A4','A4','G4','F4','F4','E4',
    ],
  },
  {
    id: 'rainy_night',
    name: '雨夜花',
    emoji: '🌧️',
    color: '#5DADE2',
    tempo: 450,
    notes: [
      'G4','G4','A4','G4','E4','D4','C4',
      'A4','G4','G4','G4','C5','A4','G4',
      'E4','G4','A4',
      'G4','G4','A4','G4','E4','D4','C4',
      'E4','D4','C4','C4','A4','C5','D5','E5','D5','C5',
    ],
  },
  {
    id: 'jasmine',
    name: '茉莉花',
    emoji: '🌸',
    color: '#F8C8D4',
    tempo: 480,
    notes: [
      'G4','G4','A4','G4','E4','D4',
      'E4','E4','G4','E4','D4','C4','D4',
      'E4','E4','G4','A4','G4','A4','G4',
      'E4','D4','C4',
      'G4','G4','A4','G4','E4','D4',
      'E4','A4','G4','A4','G4','E4','D4',
      'C4','D4','E4','D4','C4',
    ],
  },
  {
    id: 'norwegian_wood',
    name: '挪威的森林',
    emoji: '🌲',
    color: '#27AE60',
    tempo: 380,
    notes: [
      'E4','E4','E4','D4','C4','B3',
      'E4','E4',
      'E4','E4','E4','D4','C4','B3',
      'D4','D4',
      'C4','D4','E4','F4','E4','C4',
      'C4','D4','E4','D4','C4','B3','A3',
      'E4','E4','E4','D4','C4','B3',
      'E4','E4',
      'E4','E4','E4','D4','C4','B3',
      'D4','D4',
      'C4','D4','E4','F4','E4','C4',
      'C4','D4','E4','D4','C4','A3',
    ],
  },
];