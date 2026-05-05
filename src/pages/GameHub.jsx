import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GAMES = [
  {
    to: '/piano',
    emoji: '🎹',
    title: '演奏',
    desc: '彈琴學歌曲',
    bg: 'linear-gradient(135deg, #1a6fa8 0%, #2196c4 60%, #26aec0 100%)',
    glow: 'rgba(33,150,196,0.45)',
    deco: ['🐳','🎵','🐬'],
  },
  {
    to: '/coloring',
    emoji: '🎨',
    title: '畫畫',
    desc: '塗上美麗顏色',
    bg: 'linear-gradient(135deg, #0e8c7a 0%, #18b89a 60%, #26d4b0 100%)',
    glow: 'rgba(24,184,154,0.45)',
    deco: ['🐙','🖌️','🦑'],
  },
  {
    to: '/puzzle',
    emoji: '🧩',
    title: '拼圖',
    desc: '完成美麗圖案',
    bg: 'linear-gradient(135deg, #1456a8 0%, #2272cc 60%, #3a9ce0 100%)',
    glow: 'rgba(34,114,204,0.45)',
    deco: ['🐠','💎','🐡'],
  },
  {
    to: '/spotit',
    emoji: '🔍',
    title: '尋找',
    desc: '找出相同圖案',
    bg: 'linear-gradient(135deg, #5e3fa0 0%, #7b5cbf 60%, #9a7cd8 100%)',
    glow: 'rgba(123,92,191,0.45)',
    deco: ['🪸','🔮','🦀'],
  },
];

// Floating ocean-sky creatures in the background
const BG_DECO = [
  { e:'🐋', x:8,  y:12, s:40 },
  { e:'🫧', x:22, y:5,  s:22 },
  { e:'🐬', x:38, y:18, s:32 },
  { e:'🐠', x:55, y:8,  s:24 },
  { e:'🦋', x:70, y:20, s:28 },
  { e:'🐙', x:85, y:10, s:34 },
  { e:'🫧', x:92, y:35, s:18 },
  { e:'🐡', x:15, y:55, s:26 },
  { e:'🦑', x:48, y:72, s:30 },
  { e:'🪸', x:75, y:65, s:28 },
  { e:'🦀', x:30, y:80, s:24 },
  { e:'🐚', x:62, y:88, s:22 },
  { e:'⭐', x:5,  y:40, s:18 },
  { e:'💫', x:95, y:60, s:20 },
];

export default function GameHub() {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center p-4 pb-10"
      style={{
        background: 'linear-gradient(180deg, #0d3d6e 0%, #0e5a94 18%, #1278b8 38%, #28a8d8 58%, #4dd4e8 78%, #a0eeee 100%)',
      }}
    >
      {/* Cloud layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Big background clouds */}
        {[
          { w:220, h:80, x:'5%',  y:'15%', op:0.18 },
          { w:300, h:100,x:'55%', y:'8%',  op:0.14 },
          { w:180, h:70, x:'75%', y:'30%', op:0.16 },
          { w:250, h:90, x:'20%', y:'60%', op:0.12 },
          { w:200, h:75, x:'60%', y:'70%', op:0.15 },
          { w:150, h:60, x:'10%', y:'82%', op:0.13 },
        ].map((c,i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: c.w, height: c.h,
              left: c.x, top: c.y,
              background: 'rgba(255,255,255,0.9)',
              opacity: c.op,
              filter: 'blur(8px)',
            }}
            animate={{ x: [0, 18, 0], y: [0, -6, 0] }}
            transition={{ duration: 12 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
          />
        ))}

        {/* Floating sea creatures */}
        {BG_DECO.map((item, i) => (
          <motion.div
            key={i}
            className="absolute select-none"
            style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: item.s, opacity: 0.28 }}
            animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0], opacity: [0.22, 0.38, 0.22] }}
            transition={{ duration: 4 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          >
            {item.e}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-6 pt-4">

        {/* Hero header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 90 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl md:text-8xl mb-3 inline-block"
          >
            🐋
          </motion.div>
          <h1
            className="font-fredoka text-4xl md:text-5xl font-bold tracking-wide drop-shadow-lg"
            style={{ color: '#ffffff', textShadow: '0 2px 20px rgba(0,100,180,0.6), 0 4px 40px rgba(0,60,120,0.4)' }}
          >
            海洋天空
          </h1>
          <motion.p
            className="font-fredoka text-base mt-1 text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            🫧 海洋生物的雲上樂園 🫧
          </motion.p>
        </motion.div>

        {/* Game cards — 2×2 grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.to}
              initial={{ scale: 0.75, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 160 }}
            >
              <Link to={game.to}>
                <motion.div
                  whileHover={{ scale: 1.06, y: -5, boxShadow: `0 16px 48px ${game.glow}` }}
                  whileTap={{ scale: 0.96 }}
                  className="relative overflow-hidden rounded-3xl p-5 cursor-pointer select-none"
                  style={{
                    background: game.bg,
                    boxShadow: `0 6px 24px ${game.glow}`,
                    border: '1.5px solid rgba(255,255,255,0.22)',
                  }}
                >
                  {/* Shimmer bubble top-right */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(2px)' }}
                  />

                  {/* Main emoji */}
                  <motion.div
                    className="text-4xl mb-2 inline-block"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.5 }}
                  >
                    {game.emoji}
                  </motion.div>

                  <h2 className="font-fredoka text-xl font-bold text-white drop-shadow mb-0.5">
                    {game.title}
                  </h2>
                  <p className="font-fredoka text-sm text-white/75">{game.desc}</p>

                  {/* Deco row */}
                  <div className="flex gap-1.5 mt-3">
                    {game.deco.map((d, j) => (
                      <motion.span
                        key={j}
                        className="text-base"
                        animate={{ opacity: [0.5, 1, 0.5], y: [0, -3, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: j * 0.3 }}
                      >
                        {d}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom sea creatures */}
        <motion.div
          className="flex gap-4 text-3xl mt-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {['🐠','🐬','🐙','🦀','🐡','🦋'].map((e, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -10, 0], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 1.8, delay: i * 0.2, repeat: Infinity }}
            >
              {e}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}