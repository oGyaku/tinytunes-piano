import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GAMES = [
  {
    to: '/piano',
    emoji: '🎹',
    title: '演奏',
    desc: '彈琴學歌曲',
    accent: '#FFD93D',
    cardBg: '#2D1B69',
    deco: '🐳',
  },
  {
    to: '/coloring',
    emoji: '🎨',
    title: '畫畫',
    desc: '塗上美麗顏色',
    accent: '#FF6B6B',
    cardBg: '#1A3A5C',
    deco: '🐙',
  },
  {
    to: '/puzzle',
    emoji: '🧩',
    title: '拼圖',
    desc: '完成美麗圖案',
    accent: '#4ECDC4',
    cardBg: '#2D1B69',
    deco: '🐠',
  },
  {
    to: '/spotit',
    emoji: '🔍',
    title: '尋找',
    desc: '找出相同圖案',
    accent: '#FFD93D',
    cardBg: '#1A2A5E',
    deco: '🪼',
  },
];

// Stars scattered in background
const STARS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7)  % 100,
  r: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5,
  delay: (i * 0.18) % 2.4,
}));

export default function GameHub() {
  return (
    <div
      className="min-h-screen relative overflow-y-auto flex flex-col items-center"
      style={{ background: 'linear-gradient(160deg, #1a0b40 0%, #2d1b6e 35%, #1e3a8a 70%, #0f2b5c 100%)' }}
    >
      {/* ── Blob shapes (reference style) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full"
          style={{ width: 320, height: 320, top: '-80px', right: '-60px',
            background: 'rgba(255,217,61,0.08)', filter: 'blur(60px)' }} />
        <div className="absolute rounded-full"
          style={{ width: 280, height: 280, bottom: '-60px', left: '-40px',
            background: 'rgba(78,205,196,0.09)', filter: 'blur(50px)' }} />
        <div className="absolute rounded-full"
          style={{ width: 200, height: 200, top: '40%', left: '60%',
            background: 'rgba(120,80,220,0.12)', filter: 'blur(40px)' }} />
      </div>

      {/* ── Stars ── */}
      <div className="fixed inset-0 pointer-events-none">
        {STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 2 + s.delay, repeat: Infinity, delay: s.delay }}
          />
        ))}
        {/* ✦ sparkles */}
        {[
          { x: '12%', y: '22%', s: 14 },
          { x: '82%', y: '15%', s: 18 },
          { x: '6%',  y: '58%', s: 12 },
          { x: '90%', y: '65%', s: 14 },
          { x: '50%', y: '88%', s: 16 },
        ].map((sp, i) => (
          <motion.span key={i} className="absolute select-none"
            style={{ left: sp.x, top: sp.y, fontSize: sp.s, color: '#FFD93D', opacity: 0.7 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, delay: i * 0.4, repeat: Infinity }}
          >✦</motion.span>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm px-5 flex flex-col items-center pt-12 pb-10 gap-8">

        {/* ── Hero ── */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 80 }}
          className="w-full text-left"
        >
          {/* Big floating creature + title side by side */}
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-7xl shrink-0"
            >
              🐋
            </motion.div>
            <div>
              <h1 className="font-fredoka font-bold leading-tight"
                style={{ fontSize: 32, color: '#ffffff', lineHeight: 1.15 }}>
                兒童學習遊戲
              </h1>
              <p className="font-fredoka mt-1" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                玩中學，學中樂 🌟
              </p>
            </div>
          </div>

          {/* Yellow accent line */}
          <div className="mt-2 rounded-full" style={{ width: 48, height: 4, background: '#FFD93D' }} />
        </motion.div>

        {/* ── Game cards ── */}
        <div className="w-full flex flex-col gap-3">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.to}
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 140 }}
            >
              <Link to={game.to}>
                <motion.div
                  whileHover={{ scale: 1.025, x: 6 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center gap-4 overflow-hidden cursor-pointer select-none"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 20,
                    padding: '14px 18px',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {/* Accent left bar */}
                  <div className="absolute left-0 top-0 bottom-0 rounded-l-[18px]"
                    style={{ width: 4, background: game.accent }} />

                  {/* Emoji badge */}
                  <div className="flex-shrink-0 flex items-center justify-center rounded-2xl"
                    style={{ width: 52, height: 52, background: game.accent + '22', border: `1.5px solid ${game.accent}55` }}>
                    <span style={{ fontSize: 26 }}>{game.emoji}</span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="font-fredoka font-bold text-white" style={{ fontSize: 20 }}>
                      {game.title}
                    </div>
                    <div className="font-fredoka" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                      {game.desc}
                    </div>
                  </div>

                  {/* Deco creature */}
                  <motion.span
                    className="flex-shrink-0"
                    style={{ fontSize: 30, opacity: 0.55 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {game.deco}
                  </motion.span>

                  {/* Arrow */}
                  <div className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 28, height: 28, background: game.accent, marginLeft: 4 }}>
                    <span style={{ fontSize: 13, color: '#1a0b40', fontWeight: 'bold' }}>›</span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom CTA (reference style white pill button) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full"
        >
          <div
            className="w-full rounded-3xl py-4 text-center"
            style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
          >
            <div className="font-fredoka font-bold" style={{ fontSize: 17, color: '#2d1b6e' }}>
              開始探索！
            </div>
            <div className="font-fredoka mt-0.5" style={{ fontSize: 13, color: '#9080c0' }}>
              選個遊戲，出發吧 🚀
            </div>
          </div>
        </motion.div>

        {/* Bottom creatures */}
        <motion.div className="flex gap-5 text-2xl"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
          {['🐠','🐬','🐙','🦀','🐡'].map((e, i) => (
            <motion.span key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.8, delay: i * 0.18, repeat: Infinity }}>
              {e}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}