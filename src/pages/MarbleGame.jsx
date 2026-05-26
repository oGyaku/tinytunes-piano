import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NUM_SLOTS = 15;
const NUM_BALLS = 15;

const PEG_ROWS = [
  [1,3,5,7,9,11,13],
  [0,2,4,6,8,10,12,14],
  [1,3,5,7,9,11,13],
  [0,2,4,6,8,10,12,14],
];

function calcScore(litCount) {
  if (litCount < 7 || litCount > 11) {
    return { pts: Math.floor(Math.random() * 6) + 5, jackpot: true };
  }
  if (litCount === 7 || litCount === 11) return { pts: 2, jackpot: false };
  return { pts: 1, jackpot: false };
}

const STARS = Array.from({ length: 20 }, (_, i) => ({
  x: (i * 41 + 7) % 100, y: (i * 57 + 13) % 100,
  r: i % 3 === 0 ? 2.5 : 1.5, delay: (i * 0.22) % 2.5,
}));

const BALL_COLORS = ['#FFD93D','#FF6B6B','#4ECDC4','#C850C0','#7adfff','#80ffcc'];

function Board({ litSlots, dropping, ballPos, onSlotClick }) {
  const boardW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 420) : 375;
  const slotW = Math.floor(boardW / NUM_SLOTS);
  const actualW = slotW * NUM_SLOTS;
  const boardH = 180;
  const ballColor = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];

  return (
    <div style={{ width: actualW }}>
      {/* Pegboard */}
      <div className="relative rounded-2xl overflow-hidden mb-1"
        style={{ width: actualW, height: boardH, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.15)', cursor: dropping ? 'default' : 'pointer' }}
        onClick={e => {
          if (dropping) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const slot = Math.max(0, Math.min(NUM_SLOTS - 1, Math.floor(x / slotW)));
          onSlotClick(slot);
        }}
      >
        {/* Pegs */}
        {PEG_ROWS.map((row, ri) => row.map(ci => (
          <div key={`${ri}-${ci}`} className="absolute rounded-full"
            style={{
              width: 5, height: 5,
              left: ci * slotW + slotW / 2 - 2.5,
              top: 20 + ri * 38,
              background: 'rgba(255,255,255,0.55)',
              boxShadow: '0 0 4px rgba(255,255,255,0.3)',
            }} />
        )))}

        {/* Column guides */}
        {Array.from({ length: NUM_SLOTS }, (_, i) => (
          <div key={i} className="absolute top-0 bottom-0"
            style={{ left: i * slotW, width: slotW, borderRight: '1px solid rgba(255,255,255,0.04)' }} />
        ))}

        {/* Falling ball */}
        {dropping && ballPos && (
          <motion.div
            initial={{ y: -8, x: ballPos.fromSlot * slotW + slotW / 2 - 9 }}
            animate={{ y: boardH - 20, x: ballPos.toSlot * slotW + slotW / 2 - 9 }}
            transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute rounded-full z-10"
            style={{
              width: 18, height: 18,
              background: `radial-gradient(circle at 35% 30%, #fff, ${ballColor})`,
              boxShadow: `0 0 10px ${ballColor}99`,
            }}
          />
        )}

        {/* Aim label */}
        {!dropping && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-fredoka text-white/20 text-sm">👆 點擊投球</span>
          </div>
        )}
      </div>

      {/* Slot lights */}
      <div className="flex gap-px">
        {Array.from({ length: NUM_SLOTS }, (_, i) => (
          <motion.div
            key={i}
            animate={litSlots.has(i) ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={() => !dropping && onSlotClick(i)}
            style={{
              flex: 1,
              height: slotW - 2,
              borderRadius: 4,
              background: litSlots.has(i)
                ? 'linear-gradient(180deg, #FFD93D, #FF9F43)'
                : 'rgba(255,255,255,0.08)',
              border: `1px solid ${litSlots.has(i) ? 'rgba(255,217,61,0.6)' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: litSlots.has(i) ? '0 0 8px rgba(255,217,61,0.5)' : 'none',
              cursor: dropping ? 'default' : 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          />
        ))}
      </div>

      {/* Slot numbers */}
      <div className="flex gap-px mt-0.5">
        {Array.from({ length: NUM_SLOTS }, (_, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 7, color: 'rgba(255,255,255,0.25)', fontFamily: 'Fredoka, sans-serif' }}>
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarbleGame() {
  const [phase, setPhase] = useState('home');
  const [ballsLeft, setBallsLeft] = useState(NUM_BALLS);
  const [litSlots, setLitSlots] = useState(new Set());
  const [dropping, setDropping] = useState(false);
  const [ballPos, setBallPos] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);

  useEffect(() => {
    if (phase === 'playing' && ballsLeft === 0 && !dropping) {
      const result = calcScore(litSlots.size);
      setScoreResult(result);
      setTimeout(() => setPhase('result'), 400);
    }
  }, [ballsLeft, dropping, phase, litSlots.size]);

  const startGame = () => {
    setBallsLeft(NUM_BALLS);
    setLitSlots(new Set());
    setDropping(false);
    setBallPos(null);
    setScoreResult(null);
    setPhase('playing');
  };

  const dropBall = (targetSlot) => {
    if (dropping || ballsLeft <= 0 || phase !== 'playing') return;
    const dev = Math.floor(Math.random() * 5) - 2;
    const landSlot = Math.max(0, Math.min(NUM_SLOTS - 1, targetSlot + dev));
    setBallPos({ fromSlot: targetSlot, toSlot: landSlot });
    setDropping(true);
    setTimeout(() => {
      setLitSlots(prev => new Set([...prev, landSlot]));
      setBallsLeft(prev => prev - 1);
      setBallPos(null);
      setDropping(false);
    }, 850);
  };

  return (
    <div className="flex flex-col"
      style={{ position: 'fixed', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'linear-gradient(160deg, #1a0b40 0%, #2d1b6e 35%, #1e3a8a 70%, #0f2b5c 100%)' }}>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none">
        {STARS.map((s, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r }}
            animate={{ opacity: [0.15, 0.8, 0.15] }}
            transition={{ duration: 2.2 + s.delay, repeat: Infinity, delay: s.delay }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <Link to="/">
          <button className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </Link>
        <h1 className="font-fredoka text-xl font-bold text-white">🌊 彈珠台</h1>
        <div className="w-10" />
      </div>

      {/* HOME */}
      {phase === 'home' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-6 pb-10">
          <div className="text-center">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-3">🌊</motion.div>
            <h2 className="font-fredoka text-3xl font-bold text-white mb-2">夜市彈珠台</h2>
            <p className="font-fredoka text-white/70 text-sm">點擊板面，投下彈珠！</p>
          </div>
          <div className="rounded-3xl p-5 w-full max-w-sm"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.18)' }}>
            <div className="space-y-2 font-fredoka text-sm text-white/80">
              <div>🔮 每局共 {NUM_BALLS} 顆彈珠</div>
              <div>💡 {NUM_SLOTS} 個軌道，球入後亮燈</div>
              <div>🏆 亮燈 7 或 11 個 → 2分</div>
              <div>⭐ 亮燈 8、9、10 個 → 1分</div>
              <div>🌟 亮燈 &lt;7 或 &gt;11 個 → 大獎 5~10分！</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="font-fredoka text-xl font-bold px-10 py-4 rounded-3xl shadow-2xl"
            style={{ background: '#FFD93D', color: '#1a0b40' }}>
            🎮 開始！
          </motion.button>
        </div>
      )}

      {/* PLAYING */}
      {phase === 'playing' && (
        <div className="relative z-10 flex flex-col items-center gap-3 px-4 pb-6">
          {/* Stats */}
          <div className="flex gap-3 w-full max-w-md">
            <div className="flex-1 rounded-2xl px-3 py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="font-fredoka text-xs text-white/50">剩餘球數</div>
              <div className="font-fredoka text-lg font-bold text-yellow-300">🔮 {ballsLeft}</div>
            </div>
            <div className="flex-1 rounded-2xl px-3 py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="font-fredoka text-xs text-white/50">亮燈數</div>
              <div className="font-fredoka text-lg font-bold" style={{ color: '#7adfff' }}>💡 {litSlots.size}</div>
            </div>
          </div>

          <Board litSlots={litSlots} dropping={dropping} ballPos={ballPos} onSlotClick={dropBall} />

          <p className="font-fredoka text-white/40 text-xs mt-1">
            {dropping ? '💥 彈珠飛行中...' : '👆 點擊板面投下彈珠'}
          </p>

          {/* Ball count visual */}
          <div className="flex gap-1 flex-wrap justify-center max-w-xs">
            {Array.from({ length: NUM_BALLS }, (_, i) => (
              <div key={i} className="rounded-full transition-all"
                style={{
                  width: 10, height: 10,
                  background: i < ballsLeft ? '#FFD93D' : 'rgba(255,255,255,0.15)',
                  boxShadow: i < ballsLeft ? '0 0 4px #FFD93D88' : 'none',
                }} />
            ))}
          </div>
        </div>
      )}

      {/* RESULT */}
      <AnimatePresence>
        {phase === 'result' && scoreResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.4, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #2d1b6e, #1e3a8a)', border: '2px solid rgba(255,217,61,0.4)' }}>
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6, repeat: 2 }} className="text-6xl mb-3">
                {scoreResult.jackpot ? '🌟' : '🏆'}
              </motion.div>
              <h2 className="font-fredoka text-2xl font-bold text-white mb-1">
                {scoreResult.jackpot ? '大獎！！！' : '遊戲結束！'}
              </h2>
              <p className="font-fredoka text-white/70 mb-5">亮燈了 {litSlots.size} 個軌道</p>
              <div className="flex gap-3 justify-center mb-6">
                <div className="rounded-2xl px-5 py-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="font-fredoka text-xs text-white/50">得分</div>
                  <div className="font-fredoka text-4xl font-bold" style={{ color: '#FFD93D' }}>{scoreResult.pts}</div>
                </div>
                <div className="rounded-2xl px-5 py-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="font-fredoka text-xs text-white/50">亮燈</div>
                  <div className="font-fredoka text-4xl font-bold" style={{ color: '#7adfff' }}>{litSlots.size}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to="/" className="flex-1">
                  <button className="w-full font-fredoka py-2.5 rounded-2xl text-white/80"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    🏠 回首頁
                  </button>
                </Link>
                <button onClick={startGame} className="flex-1 font-fredoka py-2.5 rounded-2xl font-bold"
                  style={{ background: '#FFD93D', color: '#1a0b40' }}>
                  🔄 再玩
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}