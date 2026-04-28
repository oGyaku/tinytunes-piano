import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { KEY_COLORS, playNote } from '@/lib/audioEngine';
import FloatingNote from './FloatingNote';

export default function PianoKey({ note, isHighlighted, onPlay, instrument = 'piano', octave }) {
  const [isPressed, setIsPressed] = useState(false);
  const [floatingNotes, setFloatingNotes] = useState([]);
  const keyRef = useRef(null);

  // note can be 'C4' (full) or 'C' (letter only, octave from prop)
  const letter = note.length > 1 && /\d/.test(note) ? note.slice(0, -1) : note;
  const fullNote = note.length > 1 && /\d/.test(note) ? note : `${note}${octave || 4}`;
  const colors = KEY_COLORS[letter];

  const handlePress = () => {
    playNote(fullNote, instrument);
    setIsPressed(true);
    if (onPlay) onPlay(fullNote);

    const id = Date.now() + Math.random();
    setFloatingNotes(prev => [...prev, id]);
    setTimeout(() => {
      setFloatingNotes(prev => prev.filter(n => n !== id));
    }, 1300);

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
            ? `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}40`
            : isPressed
            ? `0 2px 8px ${colors.bg}60`
            : `0 6px 20px ${colors.bg}40`,
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
          className="absolute top-1 left-1 right-1 rounded-xl opacity-50"
          style={{
            height: '40%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, transparent 100%)',
          }}
        />

        {isHighlighted && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ background: `radial-gradient(circle, white 0%, transparent 70%)` }}
          />
        )}

        {/* Label */}
        <div className="absolute bottom-1 left-0 right-0 flex flex-col items-center">
          <span className="text-white font-fredoka font-bold text-xs md:text-sm drop-shadow-md">
            {letter}
          </span>
          {octave && (
            <span className="text-white/60 font-fredoka text-[10px] leading-none">
              {octave}
            </span>
          )}
        </div>
      </motion.button>
    </div>
  );
}