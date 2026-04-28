import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GAMES = [
  {
    to: '/piano',
    emoji: '🎹',
    title: 'Piano Kids',
    desc: '彈琴、學歌曲，音樂超好玩！',
    gradient: 'from-[#F3A8A8] to-[#E8C1F4]',
    stars: ['⭐','🌟','✨'],
  },
  {
    to: '/coloring',
    emoji: '🎨',
    title: '台灣塗鴉樂園',
    desc: '幫台灣主題圖畫塗上美麗顏色！',
    gradient: 'from-[#FCC190] to-[#F3A8A8]',
    stars: ['🌸','🌺','🌷'],
  },
  {
    to: '/puzzle',
    emoji: '🧩',
    title: '拼圖挑戰',
    desc: '拖拉拼圖，完成美麗圖案！',
    gradient: 'from-[#A0D9C5] to-[#9FC2DD]',
    stars: ['💎','🔮','💜'],
  },
];

const floatingItems = ['🌸','⭐','🌟','💕','🌈','✨','🎀','🍭','🌙','💫'];

export default function GameHub() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF9E6 50%, #F0FFFE 100%)' }}
    >
      {/* Floating background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingItems.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl md:text-3xl"
            style={{ left: `${(i * 11) % 95}%`, top: `${(i * 17) % 90}%` }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          >
            {item}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md gap-6">
        {/* Header */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="text-6xl md:text-7xl mb-3"
          >
            🏰
          </motion.div>
          <h1 className="font-fredoka text-3xl md:text-4xl font-bold"
            style={{ background: 'linear-gradient(135deg, #F3A8A8, #C39BD3, #A0D9C5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            童話遊樂園
          </h1>
          <p className="font-fredoka text-muted-foreground mt-1 text-base">
            選一個遊戲，一起玩吧！ 🎉
          </p>
        </motion.div>

        {/* Game cards */}
        <div className="flex flex-col gap-4 w-full">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.to}
              initial={{ x: i % 2 === 0 ? -60 : 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.15, type: 'spring' }}
            >
              <Link to={game.to}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className={`bg-gradient-to-r ${game.gradient} rounded-3xl p-5 md:p-6 shadow-lg cursor-pointer select-none flex items-center gap-4`}
                  style={{ boxShadow: '0 8px 30px rgba(243,168,168,0.3)' }}
                >
                  <motion.span
                    className="text-4xl md:text-5xl"
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  >
                    {game.emoji}
                  </motion.span>
                  <div className="flex-1">
                    <h2 className="font-fredoka text-xl md:text-2xl font-bold text-white drop-shadow">
                      {game.title}
                    </h2>
                    <p className="font-fredoka text-white/85 text-sm mt-0.5">
                      {game.desc}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {game.stars.map((s, j) => (
                      <motion.span
                        key={j}
                        className="text-sm"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: j * 0.3 }}
                      >
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom decoration */}
        <motion.div
          className="flex gap-3 text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {['🐰','🐻','🦊','🐸','🐱'].map((e, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
            >
              {e}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}