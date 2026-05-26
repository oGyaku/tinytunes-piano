import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SYMBOLS = [
  '🐋','🐬','🐳','🦈','🐠','🐡','🐟','🦀','🦞','🦐',
  '🐙','🦑','🪸','🐚','🦪','🐊','🐢','🦭','🦦','🦋',
  '🌊','💧','🫧','⭐','💫','🌙','☀️','🌸','🍀','🔮','🪼'
];

function generateDeck() {
  const n = 5;
  const cards = [];
  cards.push([0, 1, 2, 3, 4, 5]);
  for (let i = 0; i < n; i++) {
    const card = [0];
    for (let j = 0; j < n; j++) card.push(n + 1 + i * n + j);
    cards.push(card);
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const card = [i + 1];
      for (let k = 0; k < n; k++) card.push(n + 1 + k * n + ((i * k + j) % n));
      cards.push(card);
    }
  }
  return cards;
}

const DECK = generateDeck();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Stable card: display order is fixed per (cardSymbols, seed) — no re-render shuffling
function CardRect({ cardSymbols, onSymbolClick, highlight, disabled, width, seed }) {
  // Shuffle display order ONCE per card (seed changes only when card changes)
  const displayOrder = useMemo(() => shuffle([...cardSymbols]), [seed]);
  const cellSize = Math.floor(width / 3);
  const sizes = [1.0, 0.82, 0.95, 0.88, 1.05, 0.78];

  return (
    <div
      className="rounded-3xl select-none overflow-hidden"
      style={{
        width,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(100,180,255,0.15) 100%)',
        border: '2px solid rgba(255,255,255,0.3)',
        boxShadow: '0 8px 32px rgba(0,20,80,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="grid p-2 gap-1"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' }}
      >
        {displayOrder.map((symIdx, i) => {
          const isHighlight = highlight === symIdx;
          const fontSize = Math.floor(cellSize * 0.44 * sizes[i % sizes.length]);
          return (
            <motion.button
              key={symIdx}
              disabled={disabled}
              onClick={() => onSymbolClick && onSymbolClick(symIdx)}
              whileTap={disabled ? {} : { scale: 0.75 }}
              animate={isHighlight ? { scale: [1, 1.5, 1], rotate: [0, 20, -20, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center rounded-2xl"
              style={{
                height: cellSize - 4,
                fontSize,
                lineHeight: 1,
                background: isHighlight ? 'rgba(255,217,61,0.35)' : 'transparent',
                cursor: disabled ? 'default' : 'pointer',
                border: 'none',
                filter: isHighlight ? 'drop-shadow(0 0 10px gold)' : 'none',
              }}
            >
              {SYMBOLS[symIdx]}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Stars background
const STARS = Array.from({ length: 20 }, (_, i) => ({
  x: (i * 41 + 7) % 100, y: (i * 57 + 13) % 100,
  r: i % 3 === 0 ? 2.5 : 1.5, delay: (i * 0.22) % 2.5,
}));

export default function SpotItGame() {
  const [phase, setPhase] = useState('home');
  const [deckOrder, setDeckOrder] = useState([]);
  const [deckIdx, setDeckIdx] = useState(0);
  const [topCard, setTopCard] = useState(null);
  const [playerCard, setPlayerCard] = useState(null);
  const [topSeed, setTopSeed] = useState(0);
  const [playerSeed, setPlayerSeed] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [highlight, setHighlight] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const findMatch = (a, b) => a.find(s => b.includes(s));

  const startGame = () => {
    const order = [...Array(DECK.length).keys()].sort(() => Math.random() - 0.5);
    setDeckOrder(order);
    setDeckIdx(1);
    setTopCard(DECK[order[0]]);
    setPlayerCard(DECK[order[1]]);
    setTopSeed(Math.random());
    setPlayerSeed(Math.random());
    setScore(0);
    setTotal(DECK.length - 1);
    setSeconds(0);
    setHighlight(null);
    setFeedback(null);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const handleSymbolClick = (symIdx) => {
    if (!topCard || !playerCard || feedback) return;
    const match = findMatch(topCard, playerCard);
    if (symIdx === match) {
      setHighlight(symIdx);
      setFeedback('correct');
      setScore(s => s + 1);
      setTimeout(() => {
        setHighlight(null);
        setFeedback(null);
        const nextIdx = deckIdx + 1;
        if (nextIdx >= deckOrder.length) {
          setPhase('win');
        } else {
          const newTop = playerCard;
          const newTopSeedVal = playerSeed; // carry over player's seed so layout stays same
          const newPlayer = DECK[deckOrder[nextIdx]];
          const newPlayerSeedVal = Math.random();
          setTopCard(newTop);
          setTopSeed(newTopSeedVal);
          setPlayerCard(newPlayer);
          setPlayerSeed(newPlayerSeedVal);
          setDeckIdx(nextIdx);
        }
      }, 700);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const cardW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 40, 360) : 320;

  return (
    <div className="min-h-screen flex flex-col relative"
      style={{ background: 'linear-gradient(160deg, #1a0b40 0%, #2d1b6e 35%, #1e3a8a 70%, #0f2b5c 100%)' }}>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none">
        {STARS.map((s, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r }}
            animate={{ opacity: [0.15, 0.8, 0.15] }}
            transition={{ duration: 2.2 + s.delay, repeat: Infinity, delay: s.delay }}
          />
        ))}
        {[{ x:'10%',y:'18%' },{ x:'85%',y:'12%' },{ x:'5%',y:'60%' },{ x:'92%',y:'70%' }].map((sp,i)=>(
          <motion.span key={i} className="absolute select-none"
            style={{ left:sp.x, top:sp.y, fontSize:14, color:'#FFD93D', opacity:0.6 }}
            animate={{ scale:[1,1.4,1], opacity:[0.3,0.9,0.3] }}
            transition={{ duration:1.8, delay:i*0.45, repeat:Infinity }}>✦</motion.span>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <Link to="/">
          <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </Link>
        <h1 className="font-fredoka text-xl font-bold text-white drop-shadow">🔍 尋找</h1>
        <div className="w-10" />
      </div>

      {/* HOME */}
      {phase === 'home' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-10 gap-6">
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
            <div className="text-7xl mb-3">🔍</div>
            <h2 className="font-fredoka text-3xl font-bold text-white drop-shadow mb-2">Spot It!</h2>
            <p className="font-fredoka text-white/70">兩張牌各有一個相同圖案，找到就點擊！</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
            className="rounded-3xl p-5 w-full max-w-sm"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)' }}
          >
            <div className="space-y-2 font-fredoka text-sm text-white/80">
              <div>🃏 兩張牌各有 6 個海洋圖案</div>
              <div>👁️ 找出兩張牌上相同的那一個</div>
              <div>👆 點擊下方牌上的正確圖案</div>
              <div>⚡ 共 {DECK.length - 1} 關，越快越好！</div>
            </div>
          </motion.div>

          <motion.button
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="font-fredoka text-xl font-bold px-10 py-4 rounded-3xl shadow-2xl"
            style={{ background: '#FFD93D', color: '#1a0b40', border: 'none' }}
          >
            🎮 開始！
          </motion.button>
        </div>
      )}

      {/* PLAYING */}
      {phase === 'playing' && topCard && playerCard && (
        <div className="relative z-10 flex-1 flex flex-col items-center gap-4 px-4 pb-6">
          <div className="flex gap-3 w-full max-w-sm">
            {[
              { label: '得分', value: `${score}/${total}`, color: '#FFD93D' },
              { label: '時間', value: fmt(seconds), color: '#7adfff' },
            ].map(s => (
              <div key={s.label} className="flex-1 rounded-2xl px-3 py-2 text-center"
                style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="font-fredoka text-xs text-white/50">{s.label}</div>
                <div className="font-fredoka text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="font-fredoka text-base font-bold px-6 py-2 rounded-2xl"
                style={{
                  background: feedback === 'correct' ? 'rgba(50,200,120,0.25)' : 'rgba(220,60,60,0.25)',
                  border: `1.5px solid ${feedback === 'correct' ? 'rgba(80,220,130,0.5)' : 'rgba(220,60,60,0.5)'}`,
                  color: feedback === 'correct' ? '#80ffcc' : '#ff9999',
                }}
              >
                {feedback === 'correct' ? '✅ 答對了！' : '❌ 再找找看！'}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center gap-1.5">
            <p className="font-fredoka text-xs text-white/50">🃏 參考牌</p>
            <CardRect cardSymbols={topCard} disabled width={cardW} seed={topSeed} />
          </div>

          <div className="font-fredoka text-white/60 text-sm">▼ 找出相同的圖案點擊</div>

          <div className="flex flex-col items-center gap-1.5">
            <p className="font-fredoka text-xs text-white/50">👆 你的牌</p>
            <CardRect cardSymbols={playerCard} onSymbolClick={handleSymbolClick} highlight={highlight} disabled={!!feedback} width={cardW} seed={playerSeed} />
          </div>
        </div>
      )}

      {/* WIN */}
      <AnimatePresence>
        {phase === 'win' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.4, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #2d1b6e, #1e3a8a)', border: '2px solid rgba(255,217,61,0.4)' }}
            >
              <motion.div animate={{ rotate: [0,-10,10,0] }} transition={{ duration: 0.6, repeat: 3 }} className="text-6xl mb-3">🏆</motion.div>
              <h2 className="font-fredoka text-2xl font-bold text-white mb-1">全部找完啦！</h2>
              <p className="font-fredoka text-white/70 mb-5">恭喜你通關！🎉</p>
              <div className="flex gap-3 justify-center mb-6">
                {[
                  { label:'答對', value:`${score}/${total}`, color:'#FFD93D' },
                  { label:'時間', value:fmt(seconds), color:'#7adfff' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl px-4 py-2" style={{ background:'rgba(255,255,255,0.1)' }}>
                    <div className="font-fredoka text-xs text-white/50">{s.label}</div>
                    <div className="font-fredoka text-xl font-bold" style={{ color:s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link to="/" className="flex-1">
                  <button className="w-full font-fredoka py-2.5 rounded-2xl text-white/80 hover:text-white transition-all"
                    style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)' }}>
                    🏠 回首頁
                  </button>
                </Link>
                <button onClick={startGame} className="flex-1 font-fredoka py-2.5 rounded-2xl font-bold"
                  style={{ background:'#FFD93D', color:'#1a0b40' }}>
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