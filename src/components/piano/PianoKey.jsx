import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { KEY_COLORS, playNote } from '@/lib/audioEngine';
import FloatingNote from './FloatingNote';

export default function PianoKey({ note, isHighlighted, onPlay, instrument = 'piano', octave }) {
  const [isPressed, setIsPressed] = useState(false);
  const [floatingNotes, setFloatingNotes] = useState([]);
  const keyRef = useRef(null);

  const letter = note.length > 1 && /\d/.test(note) ? note.slice(0, -1) : note;
  const fullNote = note.length > 1 && /\d/.test(note) ? note : `${note}${octave || 4}`;
  const oct = octave || 4;

  const colorDef = KEY_COLORS[letter];
  // oct3 = deep, oct4 = mid, oct5 = light
  const octKey = oct <= 3 ? 'oct3' : oct === 4 ? 'oct4' : 'oct5';
  const colors = colorDef?.[octKey] || { bg: '#F3A8A8', glow: '#FAC8C8' };

  const handlePress = () => {
    playNote(fullNote, instrument);
    setIsPressed(true);
    if (onPlay) onPlay(fullNote);

    const id = Date.now() + Math.random();
    setFloatingNotes(prev => [...prev, id]);
    setTimeout(() => setFloatingNotes(prev => prev.filter(n => n !== id)), 1300);
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <div className="relative flex-1 flex flex-col items-center" ref={keyRef}>
      {floatingNotes.map(id => (
        <FloatingNote key={id} x="50%" color={colors.bg} />
      ))}

      <motion.button
        onPointerDown={handlePress}
        animate={{
          scale: isPressed ? 0.92 : isHighlighted ? 1.08 : 1,
          boxShadow: isHighlighted
            ? `0 0 24px ${colors.glow}, 0 0 48px ${colors.glow}60`
            : isPressed
            ? `0 2px 6px ${colors.bg}80`
            : `0 4px 16px ${colors.bg}60`,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="relative w-full rounded-2xl cursor-pointer select-none touch-manipulation overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${colors.glow} 0%, ${colors.bg} 100%)`,
          aspectRatio: '1 / 1.4',
          border: isHighlighted ? `3px solid white` : `2px solid ${colors.glow}`,
        }}
      >
        {/* Shine */}
        <div
          className="absolute top-1 left-1 right-1 rounded-xl opacity-60"
          style={{ height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%)' }}
        />

        {isHighlighted && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ background: `radial-gradient(circle, white 0%, transparent 70%)` }}
          />
        )}

        <div className="absolute bottom-1 left-0 right-0 flex flex-col items-center">
          <span className="text-white font-fredoka font-bold text-xs md:text-sm drop-shadow">
            {letter}
          </span>
        </div>
      </motion.button>
    </div>
  );
}