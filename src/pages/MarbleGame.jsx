import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TOTAL_BALLS = 15;
const TOTAL_SLOTS = 15;

// Peg positions as % of main board (0-100)
const PEGS = [
  // row 1
  {x:10,y:16},{x:24,y:16},{x:38,y:16},{x:52,y:16},{x:66,y:16},{x:80,y:16},
  // row 2
  {x:17,y:27},{x:31,y:27},{x:45,y:27},{x:59,y:27},{x:73,y:27},
  // row 3
  {x:10,y:38},{x:24,y:38},{x:38,y:38},{x:52,y:38},{x:66,y:38},{x:80,y:38},
  // row 4
  {x:17,y:49},{x:31,y:49},{x:45,y:49},{x:59,y:49},{x:73,y:49},
  // row 5
  {x:10,y:60},{x:24,y:60},{x:38,y:60},{x:52,y:60},{x:66,y:60},{x:80,y:60},
  // row 6
  {x:17,y:71},{x:31,y:71},{x:45,y:71},{x:59,y:71},{x:73,y:71},
];

function calcScore(litCount) {
  if (litCount < 7 || litCount > 11) return Math.floor(Math.random() * 6) + 5;
  if (litCount === 7 || litCount === 11) return 2;
  return 1;
}

// Generate a zigzag ball path through the board
// All values are % of the main board dimensions
function generatePath(slot) {
  const endX = (slot + 0.5) * (100 / TOTAL_SLOTS);
  const clamp = (v) => Math.max(5, Math.min(92, v));
  const r = () => (Math.random() - 0.5) * 28;
  return {
    x: ['88%', '88%', `${clamp(endX + r())}%`, `${clamp(endX + r())}%`, `${clamp(endX + r())}%`, `${endX}%`],
    y: ['84%',  '4%',            '22%',             '42%',             '64%',           '88%'],
    times: [0, 0.18, 0.40, 0.60, 0.80, 1],
  };
}

// ── Launcher component ──────────────────────────────────────────────────
function Launcher({ onLaunch, disabled, pulling }) {
  return (
    <div className="relative flex flex-col items-center justify-end shrink-0"
      style={{ width: 48, alignSelf: 'stretch',
        background: 'rgba(0,0,0,0.35)', borderLeft: '2px solid rgba(255,255,255,0.12)' }}>

      {/* Channel track */}
      <div className="absolute rounded-full"
        style={{ width: 8, top: 12, bottom: 110, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }} />

      {/* Ball waiting in launcher */}
      <motion.div
        animate={{ y: pulling ? 12 : 0 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 rounded-full"
        style={{ width: 20, height: 20, marginBottom: 2,
          background: 'radial-gradient(circle at 35% 30%, #fff9, #FFD93D)',
          boxShadow: '0 0 8px #FFD93D99' }}
      />

      {/* Spring coil */}
      <motion.div
        animate={{ scaleY: pulling ? 0.45 : 1 }}
        transition={{ duration: 0.15 }}
        style={{
          width: 16, height: 32, transformOrigin: 'bottom',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(180,200,255,0.7) 3px, rgba(180,200,255,0.7) 5px)',
          borderRadius: 3,
        }}
      />

      {/* Base plate */}
      <div className="rounded-t-lg mt-0.5"
        style={{ width: 36, height: 10, background: 'rgba(255,255,255,0.15)' }} />

      {/* Pull handle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={!disabled ? onLaunch : undefined}
        className="relative z-10 rounded-2xl font-fredoka font-bold mt-2 mb-3 flex flex-col items-center justify-center"
        style={{
          width: 38, height: 44, fontSize: 10, lineHeight: 1.3,
          background: disabled ? 'rgba(255,255,255,0.1)' : 'linear-gradient(180deg,#FF6B6B,#CC2222)',
          color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
          border: disabled ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,100,100,0.6)',
          boxShadow: disabled ? 'none' : '0 4px 12px rgba(220,50,50,0.5)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}>
        <span style={{ fontSize: 16 }}>🕹️</span>
        <span>拉桿</span>
      </motion.button>
    </div>
  );
}

// ── Main game ──────────────────────────────────────────────────────────
export default function MarbleGame() {
  const [phase, setPhase] = useState('home');
  const [litSlots, setLitSlots] = useState(new Set());
  const [ballsLeft, setBallsLeft] = useState(TOTAL_BALLS);
  const [isLaunching, setIsLaunching] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [ballPath, setBallPath] = useState(null);
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
    setPulling(false);
    setBallPath(null);
    setFinalScore(null);
    setPhase('playing');
  };

  const handleLaunch = () => {
    if (isLaunching || pulling || ballsRef.current <= 0) return;

    // 1. Pull lever
    setPulling(true);
    setTimeout(() => {
      setPulling(false);

      // 2. Launch ball
      const slot = Math.floor(Math.random() * TOTAL_SLOTS);
      setBallPath(generatePath(slot));
      setIsLaunching(true);

      // 3. Ball lands (after animation finishes)
      setTimeout(() => {
        litRef.current = new Set([...litRef.current, slot]);
        setLitSlots(new Set(litRef.current));
        ballsRef.current -= 1;
        setBallsLeft(ballsRef.current);
        setBallPath(null);
        setIsLaunching(false);

        if (ballsRef.current === 0) {
          setTimeout(() => {
            const litCount = litRef.current.size;
            setFinalLit(litCount);
            setFinalScore(calcScore(litCount));
            setPhase('end');
          }, 400);
        }
      }, 1600);
    }, 320);
  };

  return (
    <div className="flex flex-col select-none"
      style={{ position: 'fixed', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        background: 'linear-gradient(160deg, #1a0b40 0%, #2d1b6e 35%, #1e3a8a 70%, #0f2b5c 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <Link to="/"><button className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button></Link>
        <h1 className="font-fredoka text-xl font-bold text-white drop-shadow">🕹️ 彈珠台</h1>
        <div className="w-9" />
      </div>

      {/* ── HOME ── */}
      {phase === 'home' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 gap-6">
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-3">🕹️</motion.div>
            <h2 className="font-fredoka text-3xl font-bold text-white drop-shadow mb-2">夜市彈珠台</h2>
            <p className="font-fredoka text-white/70">拉動拉桿，讓彈珠衝入軌道！</p>
          </motion.div>
          <div className="rounded-3xl p-5 w-full max-w-sm"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.18)' }}>
            <div className="space-y-2 font-fredoka text-sm text-white/80">
              <div>🕹️ 點擊拉桿發射彈珠</div>
              <div>💥 彈珠撞釘後隨機落入軌道</div>
              <div>💡 同軌道重複進入不重複計分</div>
              <div>🎯 剛好亮 7 或 11 軌 → 2 分</div>
              <div>✨ 亮 8、9、10 軌 → 1 分</div>
              <div>🎰 少於 7 或超過 11 軌 → 大獎 5~10 分！</div>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} onClick={startGame}
            className="font-fredoka text-xl font-bold px-10 py-4 rounded-3xl shadow-2xl"
            style={{ background: '#FFD93D', color: '#1a0b40' }}>
            🎮 開始！
          </motion.button>
        </div>
      )}

      {/* ── PLAYING ── */}
      {phase === 'playing' && (
        <div className="flex flex-col items-center gap-3 px-4 pb-4">
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

          {/* Board + Launcher */}
          <div className="flex w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ border: '2px solid rgba(255,255,255,0.15)' }}>

            {/* Main board */}
            <div className="relative flex-1"
              style={{ height: 340, background: 'linear-gradient(180deg, #050820 0%, #0a1035 100%)' }}>

              {/* Pegs */}
              {PEGS.map((p, i) => (
                <div key={i} className="absolute"
                  style={{
                    left: `${p.x}%`, top: `${p.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 8, height: 8,
                    background: 'rgba(160,200,255,0.8)',
                    borderRadius: '2px',
                    rotate: '45deg',
                    boxShadow: '0 0 4px rgba(160,200,255,0.6)',
                  }}
                />
              ))}

              {/* Slot partition lines */}
              {Array.from({ length: TOTAL_SLOTS - 1 }, (_, i) => (
                <div key={i} className="absolute bottom-0"
                  style={{
                    left: `${(i + 1) * (100 / TOTAL_SLOTS)}%`,
                    width: 1, height: '14%',
                    background: 'rgba(255,255,255,0.2)',
                  }} />
              ))}

              {/* Animating ball */}
              <AnimatePresence>
                {ballPath && (
                  <motion.div key="ball" className="absolute z-10"
                    style={{ width: 16, height: 16, borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 30%, #fffde0, #FFD93D)',
                      boxShadow: '0 0 10px #FFD93D, 0 0 4px #fff',
                      transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ left: ballPath.x[0], top: ballPath.y[0] }}
                    animate={{ left: ballPath.x, top: ballPath.y }}
                    exit={{ opacity: 0, scale: 0.3 }}
                    transition={{ duration: 1.5, times: ballPath.times, ease: 'easeIn' }}
                  />
                )}
              </AnimatePresence>

              {/* Slot lights row */}
              <div className="absolute bottom-0 left-0 right-0 flex"
                style={{ height: '12%' }}>
                {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
                  const lit = litSlots.has(i);
                  return (
                    <motion.div key={i} className="flex-1 flex items-center justify-center"
                      animate={lit ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.25 }}
                      style={{
                        background: lit
                          ? 'linear-gradient(180deg,#FFD93D,#FF9F43)'
                          : 'rgba(255,255,255,0.05)',
                        borderTop: `1px solid ${lit ? 'rgba(255,217,61,0.8)' : 'rgba(255,255,255,0.1)'}`,
                        boxShadow: lit ? '0 -4px 8px rgba(255,217,61,0.4)' : 'none',
                        transition: 'background 0.25s',
                      }}>
                      <span className="font-fredoka" style={{ fontSize: 7, color: lit ? '#1a0b40' : 'rgba(255,255,255,0.2)' }}>
                        {i + 1}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Launcher column */}
            <Launcher onLaunch={handleLaunch} disabled={isLaunching || pulling || ballsLeft <= 0} pulling={pulling} />
          </div>

          {/* Ball counter dots */}
          <div className="flex gap-1 flex-wrap justify-center max-w-xs">
            {Array.from({ length: TOTAL_BALLS }, (_, i) => (
              <div key={i} className="rounded-full"
                style={{
                  width: 9, height: 9,
                  background: i < ballsLeft ? '#FFD93D' : 'rgba(255,255,255,0.12)',
                  boxShadow: i < ballsLeft ? '0 0 4px #FFD93D66' : 'none',
                  transition: 'background 0.2s',
                }} />
            ))}
          </div>

          <p className="font-fredoka text-white/35 text-xs">
            {pulling ? '⚡ 彈射中…' : isLaunching ? '💥 彈珠飛行中…' : ballsLeft <= 0 ? '⌛ 結算中…' : '👉 點擊右側拉桿發射'}
          </p>
        </div>
      )}

      {/* ── END ── */}
      <AnimatePresence>
        {phase === 'end' && finalScore !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.4, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #2d1b6e, #1e3a8a)', border: '2px solid rgba(255,217,61,0.4)' }}>
              <motion.div animate={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 0.6, repeat: 2 }}
                className="text-6xl mb-3">{finalScore >= 5 ? '🎰' : finalScore === 2 ? '🎯' : '😊'}</motion.div>
              <h2 className="font-fredoka text-2xl font-bold text-white mb-1">
                {finalScore >= 5 ? '大獎！！！' : finalScore === 2 ? '好球！' : '繼續加油！'}
              </h2>
              <p className="font-fredoka text-white/60 mb-5">亮燈了 {finalLit} 個軌道</p>
              <div className="flex gap-3 justify-center mb-6">
                {[
                  { label: '亮燈軌道', value: `${finalLit}/${TOTAL_SLOTS}`, color: '#4ECDC4' },
                  { label: '得分', value: `${finalScore}`, color: '#FFD93D' },
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
                  style={{ background: '#FFD93D', color: '#1a0b40' }}>🔄 再玩</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}