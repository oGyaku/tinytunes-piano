import { motion } from 'framer-motion';

const bubbles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 20 + Math.random() * 60,
  x: Math.random() * 100,
  delay: Math.random() * 8,
  duration: 6 + Math.random() * 6,
  color: ['#FF4B4B20', '#FF9F1C20', '#FFD93D20', '#6BCB7720', '#4D96FF20', '#9B59B620', '#FF6B9D20'][i % 7],
}));

export default function BackgroundBubbles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map(b => (
        <motion.div
          key={b.id}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.x}%`,
            bottom: -b.size,
            background: b.color,
          }}
          animate={{
            y: [0, -(window.innerHeight + b.size * 2)],
            x: [0, Math.sin(b.id) * 40],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}