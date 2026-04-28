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

// Pastel key colors per letter, with 3 octave depth levels
// oct3 = deep/saturated, oct4 = mid, oct5 = light/pastel
export const KEY_COLORS = {
  C: {
    oct3: { bg: '#E07070', glow: '#F09090' },
    oct4: { bg: '#F3A8A8', glow: '#FAC8C8' },
    oct5: { bg: '#FADADD', glow: '#FDE8EA' },
    label: 'Do',
  },
  D: {
    oct3: { bg: '#D4882A', glow: '#E8A850' },
    oct4: { bg: '#FCC190', glow: '#FDD5B0' },
    oct5: { bg: '#FDDDB4', glow: '#FEEAD0' },
    label: 'Re',
  },
  E: {
    oct3: { bg: '#C8A800', glow: '#DFC020' },
    oct4: { bg: '#F9DC7A', glow: '#FBE9A0' },
    oct5: { bg: '#FEF0B0', glow: '#FEF6D0' },
    label: 'Mi',
  },
  F: {
    oct3: { bg: '#3A9A50', glow: '#5AB870' },
    oct4: { bg: '#A0D9A8', glow: '#C0EACA' },
    oct5: { bg: '#C8EDD0', glow: '#DFF4E5' },
    label: 'Fa',
  },
  G: {
    oct3: { bg: '#2E78CC', glow: '#5098E0' },
    oct4: { bg: '#9FC2DD', glow: '#BCE0F8' },
    oct5: { bg: '#C8DFF0', glow: '#DDEEF8' },
    label: 'Sol',
  },
  A: {
    oct3: { bg: '#7A3AA8', glow: '#9A5AC8' },
    oct4: { bg: '#C39BD3', glow: '#D8BAE8' },
    oct5: { bg: '#DFD0F0', glow: '#EDE5F8' },
    label: 'La',
  },
  B: {
    oct3: { bg: '#CC3878', glow: '#E05898' },
    oct4: { bg: '#F3A8C8', glow: '#F8C4DC' },
    oct5: { bg: '#FAD0E2', glow: '#FCE4EE' },
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

// Drum note → frequency mapping (pitched percussion feel)
const DRUM_FREQS = {
  C: 80,   // kick
  D: 200,  // snare low
  E: 300,  // snare high
  F: 600,  // hi-hat closed
  G: 900,  // hi-hat open
  A: 150,  // tom low
  B: 250,  // tom high
};

function playDrum(letter, ctx) {
  const freq = DRUM_FREQS[letter] || 200;
  const isKick = letter === 'C';
  const isHat = letter === 'F' || letter === 'G';

  const gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);

  if (isKick) {
    // Kick: sine with pitch sweep down
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);
    gainNode.gain.setValueAtTime(0.8, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gainNode);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } else if (isHat) {
    // Hi-hat: white noise burst
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = letter === 'G' ? 5000 : 8000;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (letter === 'G' ? 0.25 : 0.08));
    source.start(ctx.currentTime);
  } else {
    // Snare / tom: sine + noise blend
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gainNode);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
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
    playDrum(letter, ctx);
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
];