import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Piano, Music, Headphones } from 'lucide-react';
import BackgroundBubbles from '@/components/piano/BackgroundBubbles';

const modes = [
  {
    to: '/free-play',
    icon: Piano,
    emoji: '🎹',
    title: '自由彈奏',
    desc: '用彩色琴鍵創作音樂',
    gradient: 'from-[#FF4B4B] to-[#FF9F1C]',
  },
  {
    to: '/song-mode',
    icon: Music,
    emoji: '🎵',
    title: '歌曲跟彈',
    desc: '跟隨提示學習經典歌曲',
    gradient: 'from-[#4D96FF] to-[#9B59B6]',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
      <BackgroundBubbles />

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        {/* Logo / Title */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="text-7xl md:text-8xl mb-4"
          >
            🎹
          </motion.div>
          <h1 className="font-fredoka text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#FF4B4B] via-[#FFD93D] to-[#4D96FF] bg-clip-text text-transparent">
            Piano Kids
          </h1>
          <p className="font-fredoka text-muted-foreground mt-2 text-lg">
            音樂與歌曲 🎶
          </p>
        </motion.div>

        {/* Mode Selection */}
        <div className="flex flex-col gap-4 w-full">
          {modes.map((mode, i) => (
            <motion.div
              key={mode.to}
              initial={{ x: i % 2 === 0 ? -60 : 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15, type: 'spring' }}
            >
              <Link to={mode.to}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    bg-gradient-to-r ${mode.gradient} rounded-3xl p-6 md:p-8
                    shadow-xl cursor-pointer select-none
                    flex items-center gap-5
                  `}
                >
                  <span className="text-5xl md:text-6xl">{mode.emoji}</span>
                  <div>
                    <h2 className="font-fredoka text-2xl md:text-3xl font-bold text-white">
                      {mode.title}
                    </h2>
                    <p className="font-fredoka text-white/80 text-sm md:text-base mt-1">
                      {mode.desc}
                    </p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Decorative characters */}
        <motion.div
          className="flex gap-3 mt-10 text-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {['🐻', '🐰', '🦊', '🐸', '🐱'].map((emoji, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}