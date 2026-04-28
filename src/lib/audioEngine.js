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

// Note frequencies for one octave (C4 to B4)
const NOTE_FREQUENCIES = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.00,
  A: 440.00,
  B: 493.88,
};

// Key colors matching rainbow pattern
export const KEY_COLORS = {
  C: { bg: '#FF4B4B', glow: '#FF8888', label: 'Do' },
  D: { bg: '#FF9F1C', glow: '#FFBE5C', label: 'Re' },
  E: { bg: '#FFD93D', glow: '#FFE88A', label: 'Mi' },
  F: { bg: '#6BCB77', glow: '#9EDEA5', label: 'Fa' },
  G: { bg: '#4D96FF', glow: '#85B8FF', label: 'Sol' },
  A: { bg: '#9B59B6', glow: '#C39BD3', label: 'La' },
  B: { bg: '#FF6B9D', glow: '#FF9DC0', label: 'Si' },
};

export const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export function playNote(note) {
  const ctx = getAudioContext();
  const freq = NOTE_FREQUENCIES[note];
  if (!freq) return;

  // Create oscillator for a pleasant piano-like tone
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filterNode = ctx.createBiquadFilter();

  // Main tone
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(freq, ctx.currentTime);

  // Harmonic
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);

  // Filter for warmth
  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(2000, ctx.currentTime);

  // Envelope
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);

  // Connect
  osc1.connect(filterNode);
  osc2.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 1.0);
  osc2.stop(ctx.currentTime + 1.0);
}

// Song definitions
export const SONGS = [
  {
    id: 'twinkle',
    name: '小星星',
    emoji: '⭐',
    color: '#FFD93D',
    notes: ['C','C','G','G','A','A','G','F','F','E','E','D','D','C'],
    tempo: 500,
  },
  {
    id: 'mary',
    name: '瑪莉有隻小綿羊',
    emoji: '🐑',
    color: '#6BCB77',
    notes: ['E','D','C','D','E','E','E','D','D','D','E','G','G'],
    tempo: 450,
  },
  {
    id: 'jingle',
    name: '聖誕鈴聲',
    emoji: '🎄',
    color: '#FF4B4B',
    notes: ['E','E','E','E','E','E','E','G','C','D','E'],
    tempo: 400,
  },
  {
    id: 'birthday',
    name: '生日快樂',
    emoji: '🎂',
    color: '#9B59B6',
    notes: ['C','C','D','C','F','E','C','C','D','C','G','F'],
    tempo: 500,
  },
  {
    id: 'doremi',
    name: 'Do Re Mi',
    emoji: '🎵',
    color: '#4D96FF',
    notes: ['C','D','E','C','E','C','E','D','E','F','F','E','D','F'],
    tempo: 400,
  },
];