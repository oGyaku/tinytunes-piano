import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// 31 symbols — enough to generate a valid order-5 projective plane (6 symbols per card, any 2 cards share exactly 1)
const SYMBOLS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸','🐵','🐔','🐧','🐦','🦆','🦅','🦉','🦇','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🦕','🌸','⭐'];

// Generate a Dobble/Spot-it deck using projective plane order 5 (n=5, 6 symbols/card, 31 cards)
// We use a simple mathematical construction
function generateDeck() {
  const n = 5;
  // Card 0: symbols 0..n (indices 0-5)
  // This is a well-known algorithm for order-n projective plane
  const cards = [];

  // First card: first n+1 symbols
  cards.push([0, 1, 2, 3, 4, 5]);

  // n cards of the form {0, n+1+i*n .. n+1+i*n+(n-1)}
  for (let i = 0; i < n; i++) {
    const card = [0];
    for (let j = 0; j < n; j++) {
      card.push(n + 1 + i * n + j);
    }
    cards.push(card);
  }

  // n*n cards
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const card = [i + 1];
      for (let k = 0; k < n; k++) {
        card.push(n + 1 + k * n + ((i * k + j) % n));
      }
      cards.push(card);
    }
  }

  return cards; // 31 cards
}

const DECK = generateDeck();

// Pick a random rotation/size for each symbol on a card to look natural
function randomTransform(seed) {
  const rng = (s) => ((s * 1664525 + 1013904223) & 0xffffffff) / 0xffffffff;
  const r1 = Math.abs(rng(seed));
  const r2 = Math.abs(rng(seed + 7));
  const r3 = Math.abs(rng(seed + 13));
  return {
    rotate: r1 * 60 - 30,
    scale: 0.8 + r2 * 0.5,
    x: r3 * 10 - 5,
  };
}

// Positions for 6 symbols arranged in a circle on the card
const POSITIONS = [
  { top: '12%', left: '50%', transform: 'translateX(-50%)' },
  { top: '32%', left: '78%' },
  { top: '65%', left: '78%' },
  { top: '80%', left: '50%', transform: 'translateX(-50%)' },
  { top: '65%', left: '8%' },
  { top: '32%', left: '8%' },
];

function Card({ cardSymbols, onSymbolClick, highlight, disabled, size = 280 }) {
  return (
    <div
      className="relative rounded-full select-none"
      style={{
        width: size, height: size,
        background: 'radial-gradient(circle at 35% 35%, #fff9f0, #fff0f8)',
        border: '4px solid #F3C8E8',
        boxShadow: '0 8px 32px rgba(200,100,160,0.2)',
        flexShrink: 0,
      }}
    >
      {cardSymbols.map((symIdx, i) => {
        const pos = POSITIONS[i];
        const t = randomTransform(symIdx * 31 + i);
        const isHighlight = highlight === symIdx;
        return (
          <motion.button
            key={i}
            disabled={disabled}
            onClick={() => onSymbolClick && onSymbolClick(symIdx)}
            whileTap={{ scale: 0.85 }}
            animate={isHighlight ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="absolute flex items-center justify-center cursor-pointer"
            style={{
              top: pos.top, left: pos.left,
              transform: `${pos.transform || ''} rotate(${t.rotate}deg) scale(${t.scale})`,
              fontSize: size * 0.13,
              lineHeight: 1,
              background: 'none',
              border: 'none',
              padding: 0,
              filter: isHighlight ? 'drop-shadow(0 0 8px gold)' : 'none',
            }}
          >
            {SYMBOLS[symIdx]}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function SpotItGame() {
  const [phase, setPhase] = useState('home'); // home | playing | win
  const [deckOrder, setDeckOrder] = useState([]);
  const [deckIdx, setDeckIdx] = useState(0);
  const [topCard, setTopCard] = useState(null);
  const [playerCard, setPlayerCard] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [highlight, setHighlight] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // Find the shared symbol between two cards
  const findMatch = (a, b) => a.find(s => b.includes(s));

  const startGame = () => {
    const order = [...Array(DECK.length).keys()].sort(() => Math.random() - 0.5);
    setDeckOrder(order);
    setDeckIdx(1);
    setTopCard(DECK[order[0]]);
    setPlayerCard(DECK[order[1]]);
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
          setTopCard(playerCard);
          setPlayerCard(DECK[deckOrder[nextIdx]]);
          setDeckIdx(nextIdx);
        }
      }, 700);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const cardSize = typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 300) : 280;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #FFF5FA 0%, #FFF9E6 50%, #F0FFFE 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to="/">
          <button className="w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="font-fredoka text-xl font-bold" style={{ color: '#D4608C' }}>🔍 Spot It!</h1>
        <div className="w-10" />
      </div>

      {/* HOME */}
      {phase === 'home' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 gap-6">
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
            <div className="text-7xl mb-3">🔍</div>
            <h2 className="font-fredoka text-3xl font-bold mb-2" style={{ color: '#D4608C' }}>Spot It!</h2>
            <p className="font-fredoka text-muted-foreground text-base">每兩張牌恰好有一個相同圖案，找出來點擊它！</p>
          </motion.div>

          {/* Example preview */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white/70 rounded-3xl p-5 shadow-md w-full max-w-sm"
          >
            <p className="font-fredoka text-sm text-center text-muted-foreground mb-3">遊戲說明</p>
            <div className="space-y-2 font-fredoka text-sm text-foreground">
              <div className="flex items-center gap-2">🃏 <span>翻開兩張牌放在桌上</span></div>
              <div className="flex items-center gap-2">👁️ <span>找出兩張牌上相同的圖案</span></div>
              <div className="flex items-center gap-2">👆 <span>點擊下方牌上的那個圖案</span></div>
              <div className="flex items-center gap-2">⚡ <span>越快越好！共 {DECK.length - 1} 關</span></div>
            </div>
          </motion.div>

          <motion.button
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="font-fredoka text-xl font-bold text-white px-10 py-4 rounded-3xl shadow-xl"
            style={{ background: 'linear-gradient(135deg, #FF6BA8, #A855C8)' }}
          >
            🎮 開始遊戲！
          </motion.button>
        </div>
      )}

      {/* PLAYING */}
      {phase === 'playing' && topCard && playerCard && (
        <div className="flex-1 flex flex-col items-center gap-4 px-4 pb-6">
          {/* Stats */}
          <div className="flex gap-3 w-full max-w-sm">
            <div className="flex-1 bg-white/70 rounded-2xl px-3 py-2 text-center shadow">
              <div className="font-fredoka text-xs text-muted-foreground">得分</div>
              <div className="font-fredoka text-lg font-bold" style={{ color: '#D4608C' }}>{score}/{total}</div>
            </div>
            <div className="flex-1 bg-white/70 rounded-2xl px-3 py-2 text-center shadow">
              <div className="font-fredoka text-xs text-muted-foreground">時間</div>
              <div className="font-fredoka text-lg font-bold" style={{ color: '#4ECDC4' }}>{fmt(seconds)}</div>
            </div>
          </div>

          {/* Feedback banner */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`font-fredoka text-lg font-bold px-6 py-2 rounded-2xl shadow ${feedback === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}
              >
                {feedback === 'correct' ? '✅ 答對了！' : '❌ 再找找看！'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top card (reference) */}
          <div className="flex flex-col items-center gap-1">
            <p className="font-fredoka text-xs text-muted-foreground">🃏 上方牌（參考）</p>
            <Card cardSymbols={topCard} disabled size={cardSize} />
          </div>

          {/* Divider */}
          <div className="font-fredoka text-2xl">⬇️ 找相同圖案</div>

          {/* Player card (clickable) */}
          <div className="flex flex-col items-center gap-1">
            <p className="font-fredoka text-xs text-muted-foreground">👆 點擊你的牌上的相同圖案</p>
            <Card cardSymbols={playerCard} onSymbolClick={handleSymbolClick} highlight={highlight} disabled={!!feedback} size={cardSize} />
          </div>
        </div>
      )}

      {/* WIN */}
      <AnimatePresence>
        {phase === 'win' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.4, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6, repeat: 3 }} className="text-6xl mb-3">🏆</motion.div>
              <h2 className="font-fredoka text-2xl font-bold text-foreground mb-1">全部找完啦！</h2>
              <p className="font-fredoka text-muted-foreground mb-5">恭喜你通關！🎉</p>
              <div className="flex gap-3 justify-center mb-6">
                <div className="bg-pink-50 rounded-2xl px-4 py-2">
                  <div className="font-fredoka text-xs text-muted-foreground">答對</div>
                  <div className="font-fredoka text-xl font-bold" style={{ color: '#D4608C' }}>{score}/{total}</div>
                </div>
                <div className="bg-teal-50 rounded-2xl px-4 py-2">
                  <div className="font-fredoka text-xs text-muted-foreground">時間</div>
                  <div className="font-fredoka text-xl font-bold" style={{ color: '#4ECDC4' }}>{fmt(seconds)}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to="/" className="flex-1">
                  <button className="w-full font-fredoka py-2.5 rounded-2xl border-2 border-border text-foreground hover:bg-muted transition-all">🏠 回首頁</button>
                </Link>
                <button
                  onClick={startGame}
                  className="flex-1 font-fredoka py-2.5 rounded-2xl text-white shadow"
                  style={{ background: 'linear-gradient(135deg, #FF6BA8, #A855C8)' }}
                >
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