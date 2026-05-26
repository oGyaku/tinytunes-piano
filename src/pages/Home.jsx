import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BackgroundBubbles from '@/components/piano/BackgroundBubbles';

const modes = [
  {
    to: '/free-play',
    emoji: '🎹',
    title: '自由彈奏',
    desc: '用彩色琴鍵創作音樂',
    accent: '#FFD93D',
  },
  {
    to: '/song-mode',
    emoji: '🎵',
    title: '歌曲跟彈',
    desc: '跟隨提示學習經典歌曲',
    accent: '#4ECDC4',
  },
];

export default function Home() {
  return (
    <div className="relative flex flex-col"
      style={{ position:'fixed', inset:0, overflowY:'auto', WebkitOverflowScrolling:'touch', background: 'linear-gradient(160deg, #1a0b40 0%, #2d1b6e 35%, #1e3a8a 70%, #0f2b5c 100%)' }}
    >
      <BackgroundBubbles />
      <div className="absolute top-4 left-4 z-20">
        <Link to="/">
          <motion.button whileTap={{ scale: 0.93 }} className="bg-white/70 backdrop-blur-sm rounded-full px-3 py-1.5 font-fredoka text-sm shadow-md text-foreground">
            ← 遊樂園
          </motion.button>
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-sm md:max-w-lg lg:max-w-2xl mx-auto px-4 py-16">
        {/* Logo / Title */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="text-center mb-8 md:mb-10"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="text-6xl md:text-7xl lg:text-8xl mb-3"
          >
            🎹
          </motion.div>
          <h1 className="font-fredoka text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
            演奏
          </h1>
          <p className="font-fredoka text-white/75 mt-2 text-base md:text-lg">
            音樂與歌曲 🎶
          </p>
        </motion.div>

        {/* Mode Selection */}
        <div className="flex flex-col gap-3 md:gap-4 w-full">
          {modes.map((mode, i) => (
            <motion.div
              key={mode.to}
              initial={{ x: i % 2 === 0 ? -60 : 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15, type: 'spring' }}
            >
              <Link to={mode.to}>
                <motion.div
                  whileHover={{ scale: 1.025, x: 6 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center gap-4 overflow-hidden cursor-pointer select-none"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 20,
                    padding: '16px 20px',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div className="absolute left-0 top-0 bottom-0 rounded-l-[18px]"
                    style={{ width: 4, background: mode.accent }} />
                  <div className="flex-shrink-0 flex items-center justify-center rounded-2xl"
                    style={{ width: 56, height: 56, background: mode.accent + '22', border: `1.5px solid ${mode.accent}55` }}>
                    <span className="text-4xl">{mode.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-fredoka text-xl font-bold text-white">{mode.title}</h2>
                    <p className="font-fredoka text-white/55 text-sm mt-0.5">{mode.desc}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 28, height: 28, background: mode.accent }}>
                    <span style={{ fontSize: 14, color: '#1a0b40', fontWeight: 'bold' }}>›</span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Decorative characters */}
        <motion.div
          className="flex gap-3 mt-8 md:mt-10 text-2xl md:text-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {['🐠', '🐬', '🐙', '🦀', '🐡'].map((emoji, i) => (
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