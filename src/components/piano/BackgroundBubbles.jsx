import { motion } from 'framer-motion';

const bubbles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 20 + Math.random() * 50,
  x: Math.random() * 100,
  delay: Math.random() * 8,
  duration: 6 + Math.random() * 6,
  color: ['#F3A8A840','#FCC19040','#F9DC7A40','#A0D9A840','#9FC2DD40','#C39BD340','#F3A8C840'][i % 7],
}));

export default function BackgroundBubbles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map(b => (
        <motion.div
          key={b.id}
          className="absolute rounded-full"
          style={{ width: b.size, height: b.size, left: `${b.x}%`, bottom: -b.size, background: b.color }}
          animate={{ y: [0, -(window.innerHeight + b.size * 2)], x: [0, Math.sin(b.id) * 30] }}
          transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}