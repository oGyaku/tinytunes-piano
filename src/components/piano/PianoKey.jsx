import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { KEY_COLORS, playNote } from '@/lib/audioEngine';
import FloatingNote from './FloatingNote';

export default function PianoKey({ note, isHighlighted, onPlay }) {
  const [isPressed, setIsPressed] = useState(false);
  const [floatingNotes, setFloatingNotes] = useState([]);
  const keyRef = useRef(null);
  const colors = KEY_COLORS[note];

  const handlePress = () => {
    playNote(note);
    setIsPressed(true);
    if (onPlay) onPlay(note);

    // Spawn floating note
    const id = Date.now() + Math.random();
    setFloatingNotes(prev => [...prev, id]);
    setTimeout(() => {
      setFloatingNotes(prev => prev.filter(n => n !== id));
    }, 1300);

    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <div className="relative flex-1 flex flex-col items-center" ref={keyRef}>
      {/* Floating notes */}
      {floatingNotes.map(id => (
        <FloatingNote key={id} x="50%" color={colors.bg} />
      ))}

      {/* Key button */}
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
        className="relative w-full rounded-2xl md:rounded-3xl cursor-pointer select-none touch-manipulation overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${colors.glow} 0%, ${colors.bg} 100%)`,
          aspectRatio: '1 / 1.4',
          border: isHighlighted ? `4px solid white` : `3px solid ${colors.glow}`,
        }}
      >
        {/* Shine effect */}
        <div
          className="absolute top-1 left-1 right-1 rounded-xl md:rounded-2xl opacity-50"
          style={{
            height: '40%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, transparent 100%)',
          }}
        />

        {/* Highlight pulse */}
        {isHighlighted && (
          <motion.div
            className="absolute inset-0 rounded-2xl md:rounded-3xl"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ background: `radial-gradient(circle, white 0%, transparent 70%)` }}
          />
        )}

        {/* Note label */}
        <div className="absolute bottom-2 md:bottom-3 left-0 right-0 flex flex-col items-center">
          <span className="text-white font-fredoka font-bold text-lg md:text-2xl drop-shadow-md">
            {note}
          </span>
          <span className="text-white/80 font-fredoka text-xs md:text-sm">
            {colors.label}
          </span>
        </div>
      </motion.button>
    </div>
  );
}