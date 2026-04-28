import { motion } from 'framer-motion';

const noteSymbols = ['♪', '♫', '♬', '🎵', '🎶', '✨', '⭐'];

export default function FloatingNote({ x, color }) {
  const symbol = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
  const randomX = (Math.random() - 0.5) * 80;

  return (
    <motion.div
      className="absolute pointer-events-none text-2xl md:text-3xl select-none z-50"
      style={{ left: x, bottom: '100%', color }}
      initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
      animate={{
        opacity: 0,
        y: -120,
        x: randomX,
        scale: 1.3,
        rotate: Math.random() > 0.5 ? 20 : -20,
      }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      {symbol}
    </motion.div>
  );
}