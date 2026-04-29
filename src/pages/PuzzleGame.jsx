import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Keep as BUILTIN for internal use
const BUILTIN = [
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/0fc37d2e1_puzzle1.jpg', label: '彩虹雲朵', emoji: '🌈', diffKey: 'easy',   cols: 3 },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/4a025a342_puzzle2.JPG', label: '台灣美食', emoji: '🧋', diffKey: 'easy',   cols: 3 },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/573ae4c35_puzzle3.jpg', label: '公園遊樂', emoji: '🌳', diffKey: 'medium', cols: 4 },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/c0477494c_puzzle4.JPG', label: '女王頭岩', emoji: '🪨', diffKey: 'medium', cols: 4 },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/9912d1a82_puzzle5.JPG', label: '阿里山火車', emoji: '🚂', diffKey: 'hard',   cols: 5 },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/82a3437a7_puzzle6.JPG', label: '自由廣場', emoji: '🏛️', diffKey: 'hard',   cols: 5 },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/c6089defd_puzzle7.JPG', label: '平溪天燈', emoji: '🏮', diffKey: 'expert', cols: 6 },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/144b00e03_puzzle8.JPG', label: '台北101',  emoji: '🏙️', diffKey: 'expert', cols: 6 },
];

const DIFF_INFO = {
  easy:   { label: '😊 簡單', color: 'from-[#A0D9C5] to-[#6BCB77]' },
  medium: { label: '🤔 中等', color: 'from-[#FCC190] to-[#FF9F43]' },
  hard:   { label: '😤 困難', color: 'from-[#F3A8A8] to-[#FF6B6B]' },
  expert: { label: '🤯 高手', color: 'from-[#E8C1F4] to-[#9B59B6]' },
};

export default function PuzzleGame() {
  const [allPuzzles, setAllPuzzles] = useState(BUILTIN);
  const [phase, setPhase] = useState('home'); // home | playing | win
  const [selected, setSelected] = useState(null);
  const fileInputRef = useRef(null);
  const [board, setBoard] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [dragSrc, setDragSrc] = useState(null);
  const [touchSrc, setTouchSrc] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef(null);
  const boardRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newItem = { src: url, label: '我的圖片', emoji: '🖼️', diffKey: 'medium', cols: 4 };
    setAllPuzzles(prev => {
      const filtered = prev.filter(p => p.label !== '我的圖片');
      return [...filtered, newItem];
    });
    startGame(newItem);
    e.target.value = '';
  };

  // Timer
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startGame = (item) => {
    const cols = item.cols;
    const total = cols * cols;
    const arr = Array.from({ length: total }, (_, i) => i);
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setBoard(arr);
    setMoves(0);
    setSeconds(0);
    setSelected(item);
    setPhase('playing');
  };

  const swap = (posA, posB) => {
    if (posA === posB) return;
    setBoard(prev => {
      const next = [...prev];
      [next[posA], next[posB]] = [next[posB], next[posA]];
      return next;
    });
    setMoves(m => m + 1);
  };

  // Check win after board changes
  useEffect(() => {
    if (phase !== 'playing' || board.length === 0) return;
    if (board.every((v, i) => v === i)) {
      setTimeout(() => setPhase('win'), 400);
    }
  }, [board]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const correct = board.filter((v, i) => v === i).length;
  const total = board.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  // Piece size
  const pieceSize = selected ? Math.min(Math.floor((Math.min(typeof window !== 'undefined' ? window.innerWidth - 80 : 320, 480)) / selected.cols), 90) : 60;

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #D4EEFF 0%, #C8F0E8 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/80 shadow-md w-10 h-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-fredoka text-xl font-bold" style={{ color: '#5B9EC9' }}>
          🧩 拼圖挑戰
        </h1>
        <div className="w-10" />
      </div>

      {/* HOME */}
      {phase === 'home' && (
        <div className="flex-1 px-4 pb-8">
          <p className="font-fredoka text-center text-muted-foreground mb-4">選一張圖片開始拼圖吧！🌟</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Upload card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/85 rounded-3xl p-2 shadow-md cursor-pointer overflow-hidden border-2 border-dashed border-blue-300 flex flex-col items-center justify-center gap-2 aspect-square"
            >
              <span className="text-4xl">📁</span>
              <div className="font-fredoka text-sm font-semibold text-blue-500 text-center">上傳自己的圖片</div>
            </motion.div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            {allPuzzles.map((item, i) => {
              const diff = DIFF_INFO[item.diffKey];
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startGame(item)}
                  className="bg-white/85 rounded-3xl p-2 shadow-md cursor-pointer overflow-hidden"
                >
                  <div className="relative">
                    <img src={item.src} alt={item.label} className="w-full aspect-square object-cover rounded-2xl" />
                    <div className={`absolute top-2 left-2 bg-gradient-to-r ${diff.color} text-white font-fredoka text-xs px-2 py-0.5 rounded-full shadow`}>
                      {diff.label}
                    </div>
                  </div>
                  <div className="text-center mt-2 font-fredoka text-sm font-semibold text-foreground">
                    {item.emoji} {item.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* PLAYING */}
      {phase === 'playing' && selected && (
        <div className="flex-1 flex flex-col items-center gap-3 px-4 pb-6">
          {/* Stats bar */}
          <div className="flex gap-3 items-center w-full max-w-lg">
            <button
              onClick={() => setPhase('home')}
              className="font-fredoka text-sm bg-white/80 rounded-2xl px-3 py-1.5 shadow hover:bg-white transition-all"
            >
              ← 回選擇
            </button>
            <div className="flex-1 bg-white/60 rounded-2xl px-3 py-1.5 text-center">
              <span className="font-fredoka text-sm">移動 <b style={{ color: '#FF9F43' }}>{moves}</b></span>
            </div>
            <div className="bg-white/60 rounded-2xl px-3 py-1.5">
              <span className="font-fredoka text-sm">⏱️ <b style={{ color: '#4ECDC4' }}>{fmt(seconds)}</b></span>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full max-w-lg">
            <div className="h-3 rounded-full bg-white/50 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #A0D9C5, #FFD93D)' }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="font-fredoka text-xs text-center text-white/80 mt-0.5">進度 {pct}%</div>
          </div>

          {/* Board + hint */}
          <div className="relative">
            <div
              ref={boardRef}
              className="grid gap-0.5 p-1.5 rounded-2xl shadow-xl"
              style={{
                gridTemplateColumns: `repeat(${selected.cols}, ${pieceSize}px)`,
                background: 'rgba(255,255,255,0.3)',
                border: '3px solid rgba(255,255,255,0.5)',
              }}
            >
              {board.map((tileIdx, pos) => {
                const col = tileIdx % selected.cols;
                const row = Math.floor(tileIdx / selected.cols);
                const totalPx = pieceSize * selected.cols;
                const isCorrect = tileIdx === pos;
                return (
                  <div
                    key={pos}
                    draggable
                    onDragStart={() => setDragSrc(pos)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => { swap(dragSrc, pos); setDragSrc(null); }}
                    onTouchStart={() => setTouchSrc(pos)}
                    onTouchEnd={e => {
                      const touch = e.changedTouches[0];
                      const el = document.elementFromPoint(touch.clientX, touch.clientY);
                      const idx = el?.dataset?.pos;
                      if (idx !== undefined) swap(touchSrc, parseInt(idx));
                      setTouchSrc(null);
                    }}
                    data-pos={pos}
                    style={{
                      width: pieceSize,
                      height: pieceSize,
                      backgroundImage: `url('${selected.src}')`,
                      backgroundSize: `${totalPx}px ${totalPx}px`,
                      backgroundPosition: `-${col * pieceSize}px -${row * pieceSize}px`,
                      borderRadius: 6,
                      border: isCorrect ? '2px solid rgba(107,203,119,0.9)' : '2px solid rgba(255,255,255,0.2)',
                      cursor: 'grab',
                      boxShadow: isCorrect ? '0 0 8px rgba(107,203,119,0.5)' : 'none',
                      transition: 'border-color 0.2s',
                    }}
                  />
                );
              })}
            </div>

            {/* Hint overlay */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    backgroundImage: `url('${selected.src}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Hint button */}
          <button
            onMouseDown={() => setShowHint(true)}
            onMouseUp={() => setShowHint(false)}
            onTouchStart={() => setShowHint(true)}
            onTouchEnd={() => setShowHint(false)}
            className="font-fredoka text-sm bg-white/80 rounded-2xl px-4 py-2 shadow hover:bg-white transition-all"
          >
            💡 按住看提示
          </button>
        </div>
      )}

      {/* WIN */}
      <AnimatePresence>
        {phase === 'win' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.4, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.6 }}
                className="text-6xl mb-3"
              >
                🏆
              </motion.div>
              <h2 className="font-fredoka text-2xl font-bold text-foreground mb-1">太厲害了！</h2>
              <p className="font-fredoka text-muted-foreground mb-4">你完成了《{selected?.label}》！🎉</p>
              <div className="flex gap-3 justify-center mb-6">
                <div className="bg-pink-50 rounded-2xl px-4 py-2">
                  <div className="font-fredoka text-xs text-muted-foreground">移動次數</div>
                  <div className="font-fredoka text-xl font-bold" style={{ color: '#FF9F43' }}>{moves}</div>
                </div>
                <div className="bg-teal-50 rounded-2xl px-4 py-2">
                  <div className="font-fredoka text-xs text-muted-foreground">完成時間</div>
                  <div className="font-fredoka text-xl font-bold" style={{ color: '#4ECDC4' }}>{fmt(seconds)}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setPhase('home')} variant="outline" className="flex-1 rounded-2xl font-fredoka">
                  🏠 選其他圖
                </Button>
                <Button
                  onClick={() => startGame(selected)}
                  className="flex-1 rounded-2xl font-fredoka text-white"
                  style={{ background: 'linear-gradient(135deg, #F3A8A8, #E8C1F4)' }}
                >
                  🔄 再玩
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}