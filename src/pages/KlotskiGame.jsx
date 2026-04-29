import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// ─── Puzzle definitions ───────────────────────────────────────────────
// Each piece: { id, label, emoji, w, h, row, col, color }
// Board: COLS x ROWS grid; goal: piece id=0 (曹操) reaches exit

const LEVELS = {
  easy: {
    label: '😊 簡單',
    cols: 4, rows: 5,
    pieces: [
      { id: 0, label: '曹操', emoji: '👑', w: 2, h: 2, row: 0, col: 1, color: '#FF8C69' },
      { id: 1, label: '關羽', emoji: '🔴', w: 2, h: 1, row: 2, col: 1, color: '#FF6B9D' },
      { id: 2, label: '張飛', emoji: '🟣', w: 1, h: 2, row: 0, col: 0, color: '#C39BD3' },
      { id: 3, label: '趙雲', emoji: '🔵', w: 1, h: 2, row: 0, col: 3, color: '#9FC2DD' },
      { id: 4, label: '兵1',  emoji: '⬜', w: 1, h: 1, row: 2, col: 0, color: '#A0D9A8' },
      { id: 5, label: '兵2',  emoji: '⬜', w: 1, h: 1, row: 2, col: 3, color: '#A0D9A8' },
      { id: 6, label: '兵3',  emoji: '⬜', w: 1, h: 1, row: 3, col: 0, color: '#A0D9A8' },
      { id: 7, label: '兵4',  emoji: '⬜', w: 1, h: 1, row: 3, col: 3, color: '#A0D9A8' },
      { id: 8, label: '兵5',  emoji: '⬜', w: 1, h: 1, row: 4, col: 0, color: '#A0D9A8' },
      { id: 9, label: '兵6',  emoji: '⬜', w: 1, h: 1, row: 4, col: 3, color: '#A0D9A8' },
    ],
    goalPiece: 0, goalRow: 3, goalCol: 1,
    hint: '先把關羽往左移，再把兵往旁邊讓路，最後曹操往下走！',
  },
  medium: {
    label: '🤔 中等',
    cols: 4, rows: 5,
    pieces: [
      { id: 0, label: '曹操', emoji: '👑', w: 2, h: 2, row: 0, col: 1, color: '#FF8C69' },
      { id: 1, label: '關羽', emoji: '🔴', w: 2, h: 1, row: 2, col: 1, color: '#FF6B9D' },
      { id: 2, label: '張飛', emoji: '🟣', w: 1, h: 2, row: 0, col: 0, color: '#C39BD3' },
      { id: 3, label: '趙雲', emoji: '🔵', w: 1, h: 2, row: 0, col: 3, color: '#9FC2DD' },
      { id: 4, label: '馬超', emoji: '🟡', w: 1, h: 2, row: 2, col: 0, color: '#F9DC7A' },
      { id: 5, label: '黃忠', emoji: '🟢', w: 1, h: 2, row: 2, col: 3, color: '#A0D9A8' },
      { id: 6, label: '兵1',  emoji: '⬜', w: 1, h: 1, row: 3, col: 1, color: '#FADADD' },
      { id: 7, label: '兵2',  emoji: '⬜', w: 1, h: 1, row: 3, col: 2, color: '#FADADD' },
      { id: 8, label: '兵3',  emoji: '⬜', w: 1, h: 1, row: 4, col: 1, color: '#FADADD' },
      { id: 9, label: '兵4',  emoji: '⬜', w: 1, h: 1, row: 4, col: 2, color: '#FADADD' },
    ],
    goalPiece: 0, goalRow: 3, goalCol: 1,
    hint: '把關羽移走，讓中間的兵讓路，再把馬超黃忠往下移！',
  },
  hard: {
    label: '😤 困難',
    cols: 4, rows: 5,
    pieces: [
      { id: 0,  label: '曹操', emoji: '👑', w: 2, h: 2, row: 0, col: 1, color: '#FF8C69' },
      { id: 1,  label: '關羽', emoji: '🔴', w: 2, h: 1, row: 2, col: 1, color: '#FF6B9D' },
      { id: 2,  label: '張飛', emoji: '🟣', w: 1, h: 2, row: 0, col: 0, color: '#C39BD3' },
      { id: 3,  label: '趙雲', emoji: '🔵', w: 1, h: 2, row: 0, col: 3, color: '#9FC2DD' },
      { id: 4,  label: '馬超', emoji: '🟡', w: 1, h: 2, row: 2, col: 0, color: '#F9DC7A' },
      { id: 5,  label: '黃忠', emoji: '🟢', w: 1, h: 2, row: 2, col: 3, color: '#A0D9A8' },
      { id: 6,  label: '兵1',  emoji: '⬜', w: 1, h: 1, row: 3, col: 1, color: '#FADADD' },
      { id: 7,  label: '兵2',  emoji: '⬜', w: 1, h: 1, row: 3, col: 2, color: '#FADADD' },
      { id: 8,  label: '兵3',  emoji: '⬜', w: 1, h: 1, row: 4, col: 0, color: '#FADADD' },
      { id: 9,  label: '兵4',  emoji: '⬜', w: 1, h: 1, row: 4, col: 1, color: '#FADADD' },
      { id: 10, label: '兵5',  emoji: '⬜', w: 1, h: 1, row: 4, col: 2, color: '#FADADD' },
      { id: 11, label: '兵6',  emoji: '⬜', w: 1, h: 1, row: 4, col: 3, color: '#FADADD' },
    ],
    goalPiece: 0, goalRow: 3, goalCol: 1,
    hint: '先移動關羽，再把兵的位置重新排列，讓中間出現空隙，曹操才能通過！',
  },
};

const DIFF_ORDER = ['easy', 'medium', 'hard'];

function buildGrid(pieces, cols, rows) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(-1));
  pieces.forEach(p => {
    for (let r = p.row; r < p.row + p.h; r++)
      for (let c = p.col; c < p.col + p.w; c++)
        if (r < rows && c < cols) grid[r][c] = p.id;
  });
  return grid;
}

function canMove(piece, dr, dc, pieces, cols, rows) {
  const grid = buildGrid(pieces, cols, rows);
  const nr = piece.row + dr, nc = piece.col + dc;
  if (nr < 0 || nc < 0 || nr + piece.h > rows || nc + piece.w > cols) return false;
  for (let r = nr; r < nr + piece.h; r++)
    for (let c = nc; c < nc + piece.w; c++)
      if (grid[r][c] !== -1 && grid[r][c] !== piece.id) return false;
  return true;
}

export default function KlotskiGame() {
  const [phase, setPhase] = useState('home'); // home | playing
  const [difficulty, setDifficulty] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const level = difficulty ? LEVELS[difficulty] : null;
  const CELL = 72;

  const startGame = (diff) => {
    setDifficulty(diff);
    setPieces(LEVELS[diff].pieces.map(p => ({ ...p })));
    setSelected(null);
    setMoves(0);
    setWon(false);
    setShowHint(false);
    setPhase('playing');
  };

  const reset = () => startGame(difficulty);

  const checkWin = useCallback((pcs, lvl) => {
    const goal = pcs.find(p => p.id === lvl.goalPiece);
    if (goal && goal.row === lvl.goalRow && goal.col === lvl.goalCol) setWon(true);
  }, []);

  const handleCellClick = (row, col) => {
    if (won || !level) return;
    const grid = buildGrid(pieces, level.cols, level.rows);
    const clickedId = grid[row]?.[col];

    if (selected === null) {
      if (clickedId !== -1) setSelected(clickedId);
      return;
    }

    const selPiece = pieces.find(p => p.id === selected);
    if (!selPiece) { setSelected(null); return; }

    if (clickedId === selected) { setSelected(null); return; }

    // Try to move selected piece toward click
    const dr = Math.sign(row - selPiece.row);
    const dc = Math.sign(col - selPiece.col);
    const dirs = [];
    if (dr !== 0 || dc !== 0) dirs.push([dr, dc]);
    if (dr !== 0) dirs.push([dr, 0]);
    if (dc !== 0) dirs.push([0, dc]);

    let moved = false;
    for (const [tryDr, tryDc] of dirs) {
      if (canMove(selPiece, tryDr, tryDc, pieces, level.cols, level.rows)) {
        const next = pieces.map(p =>
          p.id === selected ? { ...p, row: p.row + tryDr, col: p.col + tryDc } : p
        );
        setPieces(next);
        setMoves(m => m + 1);
        checkWin(next, level);
        moved = true;
        break;
      }
    }
    if (!moved && clickedId !== -1) setSelected(clickedId);
    else if (!moved) setSelected(null);
  };

  return (
    <div className="min-h-screen flex flex-col select-none"
      style={{ background: 'linear-gradient(135deg, #FFF8EC 0%, #FFF0FA 50%, #EEF8FF 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Link to="/">
          <motion.button whileTap={{ scale: 0.9 }}
            className="bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        </Link>
        <div className="text-center">
          <h1 className="font-fredoka text-2xl font-bold"
            style={{ background: 'linear-gradient(90deg,#FF8C69,#C39BD3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            🏯 華容道
          </h1>
          {phase === 'playing' && (
            <p className="font-fredoka text-xs text-muted-foreground">移動 <b style={{ color: '#FF8C69' }}>{moves}</b> 步 · {level?.label}</p>
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* HOME */}
      {phase === 'home' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 pb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-3">🏯</div>
            <h2 className="font-fredoka text-xl font-bold text-foreground mb-1">幫曹操逃出包圍！</h2>
            <p className="font-fredoka text-muted-foreground text-sm max-w-xs mx-auto">
              移動其他英雄，讓大大的曹操 👑 從底部缺口逃走！
            </p>
          </motion.div>

          <div className="flex flex-col gap-3 w-full max-w-sm">
            {DIFF_ORDER.map((diff, i) => {
              const lvl = LEVELS[diff];
              const colors = {
                easy:   { grad: 'from-[#A0D9C5] to-[#6BCB77]', emoji: '😊' },
                medium: { grad: 'from-[#FCC190] to-[#FF9F43]', emoji: '🤔' },
                hard:   { grad: 'from-[#F3A8A8] to-[#FF6B6B]', emoji: '😤' },
              }[diff];
              return (
                <motion.button
                  key={diff}
                  initial={{ x: i % 2 === 0 ? -60 : 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.12, type: 'spring' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startGame(diff)}
                  className={`bg-gradient-to-r ${colors.grad} rounded-3xl p-5 shadow-lg text-white flex items-center gap-4`}
                >
                  <span className="text-4xl">{colors.emoji}</span>
                  <div className="text-left">
                    <div className="font-fredoka text-xl font-bold">{lvl.label.split(' ')[1]}</div>
                    <div className="font-fredoka text-sm text-white/80">
                      {diff === 'easy' ? '10 個方塊，適合初學者' : diff === 'medium' ? '10 個方塊，需要多想幾步' : '12 個方塊，考驗大腦！'}
                    </div>
                  </div>
                  <span className="ml-auto text-2xl">▶</span>
                </motion.button>
              );
            })}
          </div>

          <div className="font-fredoka text-xs text-muted-foreground text-center max-w-xs">
            💡 點選方塊，再點目標位置來移動！讓 👑 曹操從底部中間逃出就算贏！
          </div>
        </div>
      )}

      {/* PLAYING */}
      {phase === 'playing' && level && (
        <div className="flex-1 flex flex-col items-center gap-3 px-4 pb-6">
          {/* Toolbar */}
          <div className="flex gap-2 items-center w-full max-w-sm">
            <button onClick={() => setPhase('home')}
              className="font-fredoka text-sm bg-white/80 rounded-2xl px-3 py-2 shadow hover:bg-white"
            >← 選難度</button>
            <button onClick={reset}
              className="font-fredoka text-sm bg-white/80 rounded-2xl px-3 py-2 shadow hover:bg-white"
            >🔄 重來</button>
            <button
              onClick={() => setShowHint(h => !h)}
              className={`font-fredoka text-sm rounded-2xl px-3 py-2 shadow transition-all ${showHint ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white/80 hover:bg-white'}`}
            >💡 提示</button>
          </div>

          {/* Hint */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl px-4 py-2 max-w-sm w-full"
              >
                <p className="font-fredoka text-sm text-yellow-800">💡 {level.hint}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Board */}
          <div className="relative"
            style={{
              width: level.cols * CELL + 8,
              height: level.rows * CELL + 8,
              background: 'rgba(255,255,255,0.4)',
              borderRadius: 20,
              border: '3px solid rgba(255,255,255,0.7)',
              boxShadow: '0 8px 32px rgba(200,150,200,0.25)',
            }}
          >
            {/* Grid dots */}
            {Array.from({ length: level.rows }).map((_, r) =>
              Array.from({ length: level.cols }).map((_, c) => (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    position: 'absolute',
                    left: c * CELL + 4,
                    top: r * CELL + 4,
                    width: CELL - 2,
                    height: CELL - 2,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    zIndex: 1,
                  }}
                />
              ))
            )}

            {/* Exit indicator */}
            <div style={{
              position: 'absolute',
              left: level.goalCol * CELL + 4,
              top: level.rows * CELL - 2,
              width: 2 * CELL - 2,
              height: 8,
              background: 'linear-gradient(90deg, #FF8C69, #FFD700)',
              borderRadius: 4,
              zIndex: 2,
            }} />
            <div style={{
              position: 'absolute',
              left: level.goalCol * CELL + 4 + CELL * 0.25,
              top: level.rows * CELL - 18,
              zIndex: 2,
              fontSize: 14,
              fontFamily: 'var(--font-fredoka)',
            }}>出口 ↓</div>

            {/* Pieces */}
            {pieces.map(piece => {
              const isSelected = selected === piece.id;
              const isGoalPiece = piece.id === level.goalPiece;
              return (
                <motion.div
                  key={piece.id}
                  animate={{
                    left: piece.col * CELL + 6,
                    top: piece.row * CELL + 6,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  onClick={() => {
                    const grid = buildGrid(pieces, level.cols, level.rows);
                    // find a cell of this piece and click it
                    handleCellClick(piece.row, piece.col);
                  }}
                  style={{
                    position: 'absolute',
                    width: piece.w * CELL - 8,
                    height: piece.h * CELL - 8,
                    background: piece.color,
                    borderRadius: 14,
                    zIndex: 10,
                    cursor: 'pointer',
                    border: isSelected ? '3px solid #FFD700' : isGoalPiece ? '3px solid #FF6B35' : '2px solid rgba(255,255,255,0.6)',
                    boxShadow: isSelected
                      ? '0 0 20px rgba(255,215,0,0.6), 0 4px 12px rgba(0,0,0,0.1)'
                      : '0 3px 10px rgba(0,0,0,0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: isGoalPiece ? 28 : 18 }}>{isGoalPiece ? '👑' : piece.emoji}</span>
                  <span style={{
                    fontFamily: 'var(--font-fredoka)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(0,0,0,0.6)',
                    marginTop: 2,
                  }}>{piece.label}</span>
                </motion.div>
              );
            })}
          </div>

          <p className="font-fredoka text-sm text-muted-foreground text-center">
            點選方塊選取，再點空格或方向來移動
          </p>
        </div>
      )}

      {/* WIN Modal */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8 }}
                className="text-6xl mb-3"
              >🏆</motion.div>
              <h2 className="font-fredoka text-2xl font-bold mb-1">曹操逃出去了！</h2>
              <p className="font-fredoka text-muted-foreground mb-4">太聰明了！共走了 <b style={{ color: '#FF8C69' }}>{moves}</b> 步 🎉</p>
              <div className="flex gap-3">
                <button onClick={() => { setPhase('home'); setWon(false); }}
                  className="flex-1 font-fredoka bg-gray-100 rounded-2xl py-2.5 hover:bg-gray-200"
                >🏠 選難度</button>
                <button onClick={reset}
                  className="flex-1 font-fredoka text-white rounded-2xl py-2.5"
                  style={{ background: 'linear-gradient(135deg,#FF8C69,#C39BD3)' }}
                >🔄 再玩</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}