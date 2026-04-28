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

// Key colors matching rainbow pattern (by letter)
export const KEY_COLORS = {
  C: { bg: '#FF4B4B', glow: '#FF8888', label: 'Do' },
  D: { bg: '#FF9F1C', glow: '#FFBE5C', label: 'Re' },
  E: { bg: '#FFD93D', glow: '#FFE88A', label: 'Mi' },
  F: { bg: '#6BCB77', glow: '#9EDEA5', label: 'Fa' },
  G: { bg: '#4D96FF', glow: '#85B8FF', label: 'Sol' },
  A: { bg: '#9B59B6', glow: '#C39BD3', label: 'La' },
  B: { bg: '#FF6B9D', glow: '#FF9DC0', label: 'Si' },
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
  { id: 'piano',    name: '鋼琴',  emoji: '🎹' },
  { id: 'xylophone',name: '木琴',  emoji: '🎼' },
  { id: 'flute',    name: '笛子',  emoji: '🎵' },
  { id: 'guitar',   name: '吉他',  emoji: '🎸' },
];

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
  flute: {
    osc1Type: 'sine',
    osc2Type: 'sine',
    osc2Mult: 2,
    filterFreq: 1200,
    attackTime: 0.06,
    decayTime: 1.5,
    peakGain: 0.35,
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
];