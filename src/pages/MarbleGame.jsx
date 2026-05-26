import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TOTAL_BALLS = 15;
const TOTAL_SLOTS = 15;

// Staggered peg grid
const PEGS = [];
for (let row = 0; row < 7; row++) {
  const isEven = row % 2 === 0;
  const count = isEven ? 8 : 7;
  for (let col = 0; col < count; col++) {
    PEGS.push({
      x: isEven ? (col / 7) * 100 + 100 / 14 : (col / 6) * 100 + 100 / 12,
      y: 10 + row * 12,
    });
  }
}

function slotX(i) {
  return (i + 0.5) * (100 / TOTAL_SLOTS);
}

function calcScore(litCount) {
  if (litCount < 7 || litCount > 11) return Math.floor(Math.random() * 6) + 5;
  if (litCount === 7 || litCount === 11) return 2;
  return 1;
}

function getResult(litCount, score) {
  if (score >= 5) return { label: '大獎！！', emoji: '🎰', color: '#FFD93D', sub: '超厲害！' };
  if (score === 2) return { label: '好球！', emoji: '🎯', color: '#4ECDC4', sub: '打得不錯！' };
  return { label: '繼續加油！', emoji: '😊', color: '#aaaaff', sub: '下次更好！' };
}

export default function MarbleGame() {
  const [phase, setPhase] = useState('home');
  const [litSlots, setLitSlots] = useState(new Set());
  const [ballsLeft, setBallsLeft] = useState(TOTAL_BALLS);
  const [isLaunching, setIsLaunching] = useState(false);
  const [animSlot, setAnimSlot] = useState(null);
  const [finalScore, setFinalScore] = useState(null);
  const [finalLit, setFinalLit] = useState(0);
  const litRef = useRef(new Set());
  const ballsRef = useRef(TOTAL_BALLS);

  const startGame = () => {
    litRef.current = new Set();
    ballsRef.current = TOTAL_BALLS;
    setLitSlots(new Set());
    setBallsLeft(TOTAL_BALLS);
    setIsLaunching(false);
    setAnimSlot(null);
    setFinalScore(null);
    setPhase('playing');
  };

  const launchBall = () => {
    if (isLaunching || ballsRef.current <= 0) return;
    const slot = Math.floor(Math.random() * TOTAL_SLOTS);
    setIsLaunching(true);
    setAnimSlot(slot);

    setTimeout(() => {
      litRef.current = new Set([...litRef.current, slot]);
      setLitSlots(new Set(litRef.current));
      ballsRef.current -= 1;
      setBallsLeft(ballsRef.current);
      setAnimSlot(null);
      setIsLaunching(false);

      if (ballsRef.current === 0) {
        setTimeout(() => {
          const litCount = litRef.current.size;
          setFinalLit(litCount);
          setFinalScore(calcScore(litCount));
          setPhase('end');
        }, 400);
      }
    }, 1100);
  };

  // Mid-air waypoints for ball path
  const midX = animSlot !== null
    ? `${slotX(animSlot) * 0.5 + 50 * 0.5}%`
    : '50%';

  return (
    <div className="flex flex-col select-none"
      style={{ position: 'fixed', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        background: 'linear-gradient(160deg, #1a0b40 0%, #2d1b6e 35%, #1e3a8a 70%, #0f2b5c 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <Link to="/">
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
        </Link>
        <h1 className="font-fredoka text-xl font-bold text-white drop-shadow">🎱 彈珠台</h1>
        <div className="w-9" />
      </div>

      {/* ── HOME ── */}
      {phase === 'home' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 gap-6">
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-3">🎱</motion.div>
            <h2 className="font-fredoka text-3xl font-bold text-white drop-shadow mb-2">夜市彈珠台</h2>
            <p className="font-fredoka text-white/70">發射 15 顆球，讓軌道全部亮燈！</p>
          </motion.div>

          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
            className="rounded-3xl p-5 w-full max-w-sm"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.18)' }}>
            <div className="space-y-2 font-fredoka text-sm text-white/80">
              <div>🎱 每局 15 顆球，共 15 個軌道</div>
              <div>💡 球進軌道就亮燈（不重複計分）</div>
              <div>🎯 剛好 7 或 11 軌亮燈得 2 分</div>
              <div>✨ 8、9、10 軌亮燈得 1 分</div>
              <div>🎰 少於 7 或超過 11 軌：大獎！（5–10 分）</div>
            </div>
          </motion.div>

          <motion.button initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="font-fredoka text-xl font-bold px-10 py-4 rounded-3xl shadow-2xl"
            style={{ background: '#FFD93D', color: '#1a0b40' }}>
            🎮 開始！
          </motion.button>
        </div>
      )}

      {/* ── PLAYING ── */}
      {phase === 'playing' && (
        <div className="flex flex-col items-center gap-3 px-4 pb-6">
          {/* Stats */}
          <div className="flex gap-3 w-full max-w-sm">
            {[
              { label: '剩餘球數', value: `${ballsLeft}`, color: '#FFD93D' },
              { label: '已亮軌道', value: `${litSlots.size} / ${TOTAL_SLOTS}`, color: '#4ECDC4' },
            ].map(s => (
              <div key={s.label} className="flex-1 rounded-2xl px-3 py-2 text-center"
                style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="font-fredoka text-xs text-white/50">{s.label}</div>
                <div className="font-fredoka text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Board */}
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ height: 210, background: 'rgba(0,0,40,0.65)', border: '2px solid rgba(255,255,255,0.15)' }}>
            {/* Pegs */}
            {PEGS.map((p, i) => (
              <div key={i} className="absolute rounded-full"
                style={{ width: 6, height: 6, left: `${p.x}%`, top: `${p.y}%`,
                  transform: 'translate(-50%,-50%)', background: 'rgba(180,220,255,0.55)' }} />
            ))}
            {/* Animating ball */}
            <AnimatePresence>
              {animSlot !== null && (
                <motion.div key="ball" className="absolute rounded-full"
                  style={{ width: 14, height: 14, background: '#FFD93D',
                    boxShadow: '0 0 10px #FFD93D', zIndex: 10, transform: 'translate(-50%,-50%)' }}
                  initial={{ left: '50%', top: '2%' }}
                  animate={{ left: [`50%`, midX, `${slotX(animSlot)}%`], top: ['2%', '52%', '91%'] }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ duration: 1.0, ease: 'easeIn' }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Slots */}
          <div className="w-full max-w-sm">
            <div className="flex gap-0.5">
              {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
                const lit = litSlots.has(i);
                return (
                  <motion.div key={i} className="flex-1 rounded-lg flex items-center justify-center"
                    animate={lit ? { scale: [1, 1.25, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    style={{
                      height: 34,
                      background: lit ? '#FFD93D' : 'rgba(255,255,255,0.07)',
                      border: lit ? '1.5px solid #FFD93D' : '1px solid rgba(255,255,255,0.12)',
                      boxShadow: lit ? '0 0 8px #FFD93D55' : 'none',
                      transition: 'background 0.25s, border 0.25s, box-shadow 0.25s',
                    }}>
                    <span className="font-fredoka" style={{ fontSize: 10, color: lit ? '#1a0b40' : 'rgba(255,255,255,0.25)' }}>
                      {i + 1}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Launch */}
          <motion.button whileTap={{ scale: 0.94 }} onClick={launchBall}
            disabled={isLaunching || ballsLeft <= 0}
            className="font-fredoka text-lg font-bold px-12 py-4 rounded-3xl shadow-xl mt-1"
            style={{
              background: isLaunching || ballsLeft <= 0 ? 'rgba(255,255,255,0.1)' : '#FFD93D',
              color: isLaunching || ballsLeft <= 0 ? 'rgba(255,255,255,0.35)' : '#1a0b40',
              cursor: isLaunching || ballsLeft <= 0 ? 'not-allowed' : 'pointer',
            }}>
            {isLaunching ? '⚡ 飛行中…' : ballsLeft <= 0 ? '⌛ 結算中…' : '🎱 發射！'}
          </motion.button>
        </div>
      )}

      {/* ── END ── */}
      <AnimatePresence>
        {phase === 'end' && finalScore !== null && (() => {
          const result = getResult(finalLit, finalScore);
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div
                initial={{ scale: 0.4, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #2d1b6e, #1e3a8a)', border: '2px solid rgba(255,217,61,0.4)' }}>
                <motion.div animate={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 0.6, repeat: 3 }}
                  className="text-6xl mb-3">{result.emoji}</motion.div>
                <h2 className="font-fredoka text-2xl font-bold text-white mb-1">{result.label}</h2>
                <p className="font-fredoka text-white/60 mb-4">{result.sub}</p>
                <div className="flex gap-3 justify-center mb-6">
                  {[
                    { label: '亮燈軌道', value: `${finalLit} / ${TOTAL_SLOTS}`, color: '#4ECDC4' },
                    { label: '得分', value: `${finalScore}`, color: result.color },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="font-fredoka text-xs text-white/50">{s.label}</div>
                      <div className="font-fredoka text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
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
          );
        })()}
      </AnimatePresence>
    </div>
  );
}