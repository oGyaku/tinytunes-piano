import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BUILTIN = [
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/0fc37d2e1_puzzle1.jpg', label: '彩虹雲朵', emoji: '🌈' },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/4a025a342_puzzle2.JPG', label: '台灣美食', emoji: '🧋' },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/573ae4c35_puzzle3.jpg', label: '公園遊樂', emoji: '🌳' },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/c0477494c_puzzle4.JPG', label: '女王頭岩', emoji: '🪨' },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/9912d1a82_puzzle5.JPG', label: '阿里山火車', emoji: '🚂' },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/82a3437a7_puzzle6.JPG', label: '自由廣場', emoji: '🏛️' },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/c6089defd_puzzle7.JPG', label: '平溪天燈', emoji: '🏮' },
  { src: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/144b00e03_puzzle8.JPG', label: '台北101', emoji: '🏙️' },
];

const DIFFICULTIES = [
  { key: 'easy',   label: '😊 簡單', cols: 3, desc: '3×3 = 9片' },
  { key: 'medium', label: '🤔 中等', cols: 4, desc: '4×4 = 16片' },
  { key: 'hard',   label: '😤 困難', cols: 5, desc: '5×5 = 25片' },
  { key: 'expert', label: '🤯 高手', cols: 6, desc: '6×6 = 36片' },
];

// Crop image to centre square, return a data URL
function cropToSquare(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 600, 600);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = url;
  });
}

export default function PuzzleGame() {
  // phase: 'home' | 'setup' | 'playing' | 'win'
  const [phase, setPhase] = useState('home');
  const [uploadedImg, setUploadedImg] = useState(null); // { src, label, emoji }
  const [selected, setSelected] = useState(null);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  const [board, setBoard] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [dragSrc, setDragSrc] = useState(null);
  const [touchSrc, setTouchSrc] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await cropToSquare(file);
    const img = { src: dataUrl, label: '我的圖片', emoji: '🖼️' };
    setUploadedImg(img);
    e.target.value = '';
  };

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startGame = (item, diff) => {
    const cols = diff.cols;
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
    if (posA === null || posA === undefined || posA === posB) return;
    setBoard(prev => {
      const next = [...prev];
      [next[posA], next[posB]] = [next[posB], next[posA]];
      return next;
    });
    setMoves(m => m + 1);
  };

  useEffect(() => {
    if (phase !== 'playing' || board.length === 0) return;
    if (board.every((v, i) => v === i)) {
      setTimeout(() => setPhase('win'), 400);
    }
  }, [board]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const correct = board.filter((v, i) => v === i).length;
  const pct = board.length ? Math.round((correct / board.length) * 100) : 0;
  const pieceSize = selected
    ? Math.min(Math.floor((Math.min(typeof window !== 'undefined' ? window.innerWidth - 80 : 320, 480)) / difficulty.cols), 88)
    : 60;

  const allImages = uploadedImg ? [uploadedImg, ...BUILTIN] : BUILTIN;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0d3d6e 0%, #0e5a94 25%, #1278b8 55%, #28a8d8 80%, #4dd4e8 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to="/">
          <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </Link>
        <h1 className="font-fredoka text-xl font-bold text-white drop-shadow">🧩 拼圖</h1>
        <div className="w-10" />
      </div>

      {/* HOME */}
      {phase === 'home' && (
        <div className="flex-1 px-4 pb-8 flex flex-col gap-6 max-w-2xl mx-auto w-full">

          {/* Upload section */}
          <div className="rounded-3xl p-4 shadow-md" style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)' }}>
            <h2 className="font-fredoka text-base font-bold mb-3 text-white">📤 上傳圖片</h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-2xl p-4 cursor-pointer flex items-center gap-4 transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' }}
            >
              {uploadedImg ? (
                <>
                  <img src={uploadedImg.src} className="w-16 h-16 rounded-xl object-cover shadow" alt="uploaded" />
                  <div>
                    <div className="font-fredoka font-semibold text-sm text-green-300">✅ 圖片已上傳！</div>
                    <div className="font-fredoka text-xs text-white/60 mt-0.5">點擊可重新上傳</div>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-4xl">📁</span>
                  <div>
                    <div className="font-fredoka font-semibold text-sm text-white/90">點擊上傳圖片</div>
                    <div className="font-fredoka text-xs text-white/60 mt-0.5">自動裁切正中心正方形</div>
                  </div>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>

          {/* Difficulty section */}
          <div className="rounded-3xl p-4 shadow-md" style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)' }}>
            <h2 className="font-fredoka text-base font-bold mb-3 text-white">🎯 難度</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.key}
                  onClick={() => setDifficulty(d)}
                  className={`rounded-2xl p-3 font-fredoka text-sm font-semibold transition-all border-2 ${
                    difficulty.key === d.key
                      ? 'scale-105'
                      : ''
                  }`}
                  style={difficulty.key === d.key
                    ? { background: 'rgba(255,255,255,0.95)', color: '#1278b8', borderColor: 'rgba(255,255,255,0.9)' }
                    : { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.2)' }
                  }
                >
                  <div>{d.label}</div>
                  <div className="text-xs font-normal opacity-70 mt-0.5">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Image grid */}
          <div>
            <h2 className="font-fredoka text-base font-bold mb-3 px-1 text-white">🖼️ 選圖片</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allImages.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startGame(item, difficulty)}
                  className="bg-white/85 rounded-3xl p-2 shadow-md cursor-pointer overflow-hidden"
                >
                  <img src={item.src} alt={item.label} className="w-full aspect-square object-cover rounded-2xl" />
                  <div className="text-center mt-2 font-fredoka text-sm font-semibold text-foreground">
                    {item.emoji} {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PLAYING */}
      {phase === 'playing' && selected && (
        <div className="flex-1 flex flex-col items-center gap-3 px-4 pb-6">
          <div className="flex gap-3 items-center w-full max-w-lg">
            <button onClick={() => setPhase('home')} className="font-fredoka text-sm bg-white/80 rounded-2xl px-3 py-1.5 shadow hover:bg-white transition-all">
              ← 回選擇
            </button>
            <div className="flex-1 bg-white/60 rounded-2xl px-3 py-1.5 text-center">
              <span className="font-fredoka text-sm">移動 <b style={{ color: '#FF9F43' }}>{moves}</b></span>
            </div>
            <div className="bg-white/60 rounded-2xl px-3 py-1.5">
              <span className="font-fredoka text-sm">⏱️ <b style={{ color: '#4ECDC4' }}>{fmt(seconds)}</b></span>
            </div>
          </div>

          <div className="w-full max-w-lg">
            <div className="h-3 rounded-full bg-white/50 overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #A0D9C5, #FFD93D)' }} animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }} />
            </div>
            <div className="font-fredoka text-xs text-center text-white/80 mt-0.5">進度 {pct}%</div>
          </div>

          <div className="relative">
            <div
              className="grid gap-0.5 p-1.5 rounded-2xl shadow-xl"
              style={{
                gridTemplateColumns: `repeat(${difficulty.cols}, ${pieceSize}px)`,
                background: 'rgba(255,255,255,0.3)',
                border: '3px solid rgba(255,255,255,0.5)',
              }}
            >
              {board.map((tileIdx, pos) => {
                const col = tileIdx % difficulty.cols;
                const row = Math.floor(tileIdx / difficulty.cols);
                const totalPx = pieceSize * difficulty.cols;
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
                      width: pieceSize, height: pieceSize,
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
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ backgroundImage: `url('${selected.src}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
              )}
            </AnimatePresence>
          </div>

          <button
            onMouseDown={() => setShowHint(true)} onMouseUp={() => setShowHint(false)}
            onTouchStart={() => setShowHint(true)} onTouchEnd={() => setShowHint(false)}
            className="font-fredoka text-sm bg-white/80 rounded-2xl px-4 py-2 shadow hover:bg-white transition-all"
          >
            💡 按住看提示
          </button>
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
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6 }} className="text-6xl mb-3">🏆</motion.div>
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
                <Button onClick={() => setPhase('home')} variant="outline" className="flex-1 rounded-2xl font-fredoka">🏠 選其他圖</Button>
                <Button onClick={() => startGame(selected, difficulty)} className="flex-1 rounded-2xl font-fredoka text-white" style={{ background: 'linear-gradient(135deg, #F3A8A8, #E8C1F4)' }}>🔄 再玩</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}