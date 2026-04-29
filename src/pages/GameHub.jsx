import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GAMES = [
  {
    to: '/piano',
    emoji: '🎹',
    title: 'Piano Kids',
    desc: '彈琴、學歌曲，音樂超好玩！',
    bg: 'linear-gradient(135deg, #FFD6E7 0%, #FFC8E8 50%, #E8C1F4 100%)',
    border: '#F3A8C8',
    accent: '#D4608C',
    deco: ['🎵','🎶','🎼'],
  },
  {
    to: '/coloring',
    emoji: '🎨',
    title: '台灣塗鴉樂園',
    desc: '幫台灣主題圖畫塗上美麗顏色！',
    bg: 'linear-gradient(135deg, #FFE8C8 0%, #FFDDB4 50%, #FFD6A0 100%)',
    border: '#FFBB77',
    accent: '#C07030',
    deco: ['🖌️','🌈','✨'],
  },
  {
    to: '/puzzle',
    emoji: '🧩',
    title: '拼圖挑戰',
    desc: '拖拉拼圖，完成美麗圖案！',
    bg: 'linear-gradient(135deg, #C8F0E8 0%, #B8E8F0 50%, #C0E0F8 100%)',
    border: '#80CCD8',
    accent: '#2A8898',
    deco: ['💎','🌊','⭐'],
  },
  {
    to: '/klotski',
    emoji: '🏯',
    title: '華容道',
    desc: '移動方塊，幫曹操逃出包圍！',
    bg: 'linear-gradient(135deg, #F8E8C0 0%, #F0D8A8 50%, #E8C890 100%)',
    border: '#D4A840',
    accent: '#805010',
    deco: ['👑','🗡️','🔮'],
  },
];

const BG_DECO = ['🌸','⭐','🌙','🦋','🌈','💫','🎀','🍭','🌺','✨','🐝','🌟'];

export default function GameHub() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center p-4 pb-8"
      style={{ background: 'linear-gradient(160deg, #FFF5FA 0%, #FFFBF0 40%, #F0FDFF 100%)' }}
    >
      {/* Scattered background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {BG_DECO.map((item, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${[8,20,35,50,65,78,90,12,40,60,80,25][i]}%`,
              top: `${[10,25,5,80,15,70,45,60,35,90,20,50][i]}%`,
              fontSize: [20,16,22,18,24,16,20,18,22,16,20,18][i],
              opacity: 0.25,
            }}
            animate={{
              y: [0, -12, 0],
              rotate: [0, 8, -8, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
          >
            {item}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-5 pt-4">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="text-center"
        >
          {/* Castle illustration */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl md:text-8xl mb-2 inline-block"
          >
            🏰
          </motion.div>
          <div className="relative inline-block">
            <h1 className="font-fredoka text-4xl md:text-5xl font-bold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #FF6BA8 0%, #A855C8 40%, #4B8FD8 80%, #3CB8A0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
              }}
            >
              童話遊樂園
            </h1>
          </div>
          <motion.p
            className="font-fredoka text-base mt-1"
            style={{ color: '#B06090' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            ✨ 選一個遊戲，一起玩吧！✨
          </motion.p>
        </motion.div>

        {/* Game cards — 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.to}
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 180 }}
            >
              <Link to={game.to}>
                <motion.div
                  whileHover={{ scale: 1.04, y: -4, boxShadow: `0 12px 40px ${game.border}88` }}
                  whileTap={{ scale: 0.97 }}
                  className="relative overflow-hidden rounded-3xl p-5 cursor-pointer select-none"
                  style={{
                    background: game.bg,
                    border: `2.5px solid ${game.border}`,
                    boxShadow: `0 6px 20px ${game.border}55`,
                  }}
                >
                  {/* Decorative corner */}
                  <div className="absolute -top-3 -right-3 text-3xl opacity-30 rotate-12">
                    {game.deco[2]}
                  </div>

                  {/* Main emoji */}
                  <motion.div
                    className="text-5xl mb-2 inline-block"
                    animate={{ rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
                  >
                    {game.emoji}
                  </motion.div>

                  <h2 className="font-fredoka text-lg font-bold mb-0.5" style={{ color: game.accent }}>
                    {game.title}
                  </h2>
                  <p className="font-fredoka text-sm" style={{ color: `${game.accent}cc` }}>
                    {game.desc}
                  </p>

                  {/* Bottom deco row */}
                  <div className="flex gap-1.5 mt-3">
                    {game.deco.map((d, j) => (
                      <motion.span
                        key={j}
                        className="text-base"
                        animate={{ opacity: [0.4, 0.9, 0.4], y: [0, -3, 0] }}
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

        {/* Bottom animals */}
        <motion.div
          className="flex gap-4 text-3xl mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {['🐰','🐻','🦊','🐸','🐱','🐼'].map((e, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1.6, delay: i * 0.18, repeat: Infinity }}
            >
              {e}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}