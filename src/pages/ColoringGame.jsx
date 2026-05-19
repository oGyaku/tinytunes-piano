import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BUILTIN_SCENES = [
  { id: 'blank',   emoji: '⬜', name: '空白畫布',    img: null },
  { id: 'train',   emoji: '🚂', name: '阿里山小火車', img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/ca34f92fe_Train.png' },
  { id: 'zongzi',  emoji: '🍙', name: '肉粽',         img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/eecc9413b_Zongzi.png' },
  { id: 'bear',    emoji: '🐻', name: '台灣黑熊',     img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/f62f21068_Bear.png' },
  { id: 'bubble',  emoji: '🧋', name: '珍珠奶茶',     img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/43eea3741_Bubble.png' },
  { id: 'cooker',  emoji: '🍲', name: '大同電鍋',     img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/0f325b698_Cooker.png' },
  { id: 'lantern', emoji: '🏮', name: '燈籠',         img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/b07c203e0_Lanterns.png' },
  { id: 'magpie',  emoji: '🐦', name: '台灣藍鵲',     img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/8642354c4_Magpie.png' },
  { id: 'taipei',  emoji: '🏙️', name: '臺北101',      img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/36c1e1c5a_Taipei101.png' },
  { id: 'tiles',   emoji: '🌸', name: '古早花磚',     img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/87a9ca6e6_Tiles-1.png' },
];

const COLORS = [
  '#CC2222','#FF5555','#FF9999',
  '#BB5500','#FF8822','#FFBB77',
  '#AA8800','#FFD700','#FFEE99',
  '#226622','#44BB44','#99DD99',
  '#006688','#22AACC','#99DDEE',
  '#1144AA','#4477FF','#99BBFF',
  '#660099','#AA44CC','#DD99EE',
  '#BB1166','#EE4499','#FFAACC',
  '#664422','#AA7744','#DDBB99',
  '#111111','#777777','#FFFFFF',
];

const STICKERS = [
  '⭐','🌙','☀️','🌈','❄️','⛅',
  '🌸','🌺','🌻','🍀','🌿','🍁',
  '🦋','🐝','🐞','🐠','🦜','🦊',
  '🍭','🍩','🎂','🍓','🍊','🍕',
  '❤️','💜','💛','🎵','🎀','💎',
  '🏮','🧧','🥢','🍵','🎋','🐉',
];

const BRUSH_SIZES = [5, 12, 24];

export default function ColoringGame() {
  const [currentScene, setCurrentScene] = useState(BUILTIN_SCENES[0]);
  const [currentColor, setCurrentColor] = useState('#CC2222');
  const [brushSize, setBrushSize] = useState(12);
  const [tool, setTool] = useState('brush');
  const [currentSticker, setCurrentSticker] = useState('⭐');

  const baseRef  = useRef(null);
  const drawRef  = useRef(null);
  const imgRef   = useRef(null);
  const eventRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });
  const history   = useRef([]);
  const currentSceneRef = useRef(BUILTIN_SCENES[0]);

  const loadScene = useCallback((scene, w, h) => {
    const bCtx = baseRef.current?.getContext('2d');
    const dCtx = drawRef.current?.getContext('2d');
    const iCtx = imgRef.current?.getContext('2d');
    if (!bCtx || !dCtx || !iCtx) return;
    bCtx.clearRect(0, 0, w, h); dCtx.clearRect(0, 0, w, h); iCtx.clearRect(0, 0, w, h);
    bCtx.fillStyle = '#FFFFFF'; bCtx.fillRect(0, 0, w, h);
    history.current = [];
    if (!scene.img) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => iCtx.drawImage(img, 0, 0, w, h);
    img.src = scene.img;
  }, []);

  const resize = useCallback((scene) => {
    const wrap = baseRef.current?.parentElement;
    if (!wrap) return;
    const size = wrap.clientWidth - 6;
    [baseRef, drawRef, imgRef, eventRef].forEach(r => {
      if (r.current) { r.current.width = size; r.current.height = size; }
    });
    loadScene(scene, size, size);
  }, [loadScene]);

  useEffect(() => {
    setTimeout(() => resize(BUILTIN_SCENES[0]), 50);
    const handler = () => resize(currentSceneRef.current);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [resize]);

  const handleSelectScene = (scene) => {
    setCurrentScene(scene);
    currentSceneRef.current = scene;
    resize(scene);
  };

  const getPos = (e) => {
    const rect = eventRef.current.getBoundingClientRect();
    const sx = drawRef.current.width / rect.width;
    const sy = drawRef.current.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  const saveHistory = () => {
    const dCtx = drawRef.current.getContext('2d');
    if (history.current.length > 20) history.current.shift();
    history.current.push(dCtx.getImageData(0, 0, drawRef.current.width, drawRef.current.height));
  };

  const startDraw = (e) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    const dCtx = drawRef.current.getContext('2d');
    if (tool === 'sticker') {
      saveHistory();
      dCtx.font = `${brushSize * 2 + 18}px serif`;
      dCtx.textAlign = 'center'; dCtx.textBaseline = 'middle';
      dCtx.fillText(currentSticker, x, y);
      return;
    }
    saveHistory();
    isDrawing.current = true;
    lastPos.current = { x, y };
    dCtx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    dCtx.beginPath();
    dCtx.arc(x, y, (tool === 'eraser' ? brushSize * 2 : brushSize) / 2, 0, Math.PI * 2);
    dCtx.fillStyle = currentColor; dCtx.fill();
  };

  const onDraw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const { x, y } = getPos(e);
    const dCtx = drawRef.current.getContext('2d');
    dCtx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    dCtx.beginPath();
    dCtx.moveTo(lastPos.current.x, lastPos.current.y);
    dCtx.lineTo(x, y);
    dCtx.strokeStyle = currentColor;
    dCtx.lineWidth = tool === 'eraser' ? brushSize * 2 : brushSize;
    dCtx.lineCap = 'round'; dCtx.lineJoin = 'round'; dCtx.stroke();
    lastPos.current = { x, y };
  };

  const stopDraw = () => { isDrawing.current = false; };

  const undo = () => {
    if (!history.current.length) return;
    drawRef.current.getContext('2d').putImageData(history.current.pop(), 0, 0);
  };

  const clearAll = () => {
    saveHistory();
    drawRef.current.getContext('2d').clearRect(0, 0, drawRef.current.width, drawRef.current.height);
  };

  const panelStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 16,
  };

  return (
    <div className="min-h-screen flex flex-col select-none overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #1a0b40 0%, #2d1b6e 35%, #1e3a8a 70%, #0f2b5c 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <Link to="/">
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
        </Link>
        <h1 className="font-fredoka text-lg font-bold text-white drop-shadow">🎨 畫畫</h1>
        <div className="w-9" />
      </div>

      {/* Scene strip — always horizontal scroll, no wrapping */}
      <div className="px-3 pb-2 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {BUILTIN_SCENES.map(scene => (
            <motion.button
              key={scene.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleSelectScene(scene)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl font-fredoka text-[11px] font-semibold shrink-0 transition-all"
              style={currentScene.id === scene.id
                ? { background: 'rgba(255,217,61,0.3)', border: '1.5px solid #FFD93D', color: '#FFD93D' }
                : { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)' }
              }
            >
              <span className="text-base">{scene.emoji}</span>
              <span className="whitespace-nowrap">{scene.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* DESKTOP LAYOUT: side-by-side */}
      <div className="hidden md:flex flex-1 gap-2 px-2 pb-3 min-h-0">

        {/* Left sidebar: colors + tools */}
        <div className="shrink-0 w-32 flex flex-col gap-2 overflow-y-auto" style={{ ...panelStyle, padding: 10 }}>
          <div className="font-fredoka text-[10px] text-white/50 text-center">🎨 顏色</div>
          <div className="flex flex-wrap gap-1 justify-center">
            {COLORS.map(c => (
              <button key={c} onClick={() => { setCurrentColor(c); setTool('brush'); }}
                className="rounded-full transition-all hover:scale-110 shrink-0"
                style={{
                  background: c, width: 20, height: 20,
                  border: currentColor === c ? '3px solid #FFD93D' : '2px solid rgba(255,255,255,0.2)',
                  transform: currentColor === c ? 'scale(1.2)' : '',
                  outline: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.4)' : 'none',
                }}
              />
            ))}
          </div>
          <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="font-fredoka text-[10px] text-white/50 text-center">🖌️ 筆刷</div>
          <div className="flex flex-col gap-1 items-center">
            {BRUSH_SIZES.map(s => (
              <button key={s} onClick={() => setBrushSize(s)}
                className="flex items-center justify-center rounded-full border-2 transition-all"
                style={{
                  width: 26 + s, height: 26 + s,
                  borderColor: brushSize === s ? '#FFD93D' : 'rgba(255,255,255,0.15)',
                  background: brushSize === s ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="rounded-full bg-white" style={{ width: s * 0.5 + 2, height: s * 0.5 + 2, opacity: 0.8 }} />
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1 items-center">
            {[{ id: 'brush', label: '✏️' }, { id: 'eraser', label: '🧹' }].map(t => (
              <button key={t.id} onClick={() => setTool(t.id)}
                className="text-lg p-1.5 rounded-xl border-2 transition-all"
                style={{
                  borderColor: tool === t.id ? '#FFD93D' : 'rgba(255,255,255,0.1)',
                  background: tool === t.id ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.07)',
                }}>{t.label}</button>
            ))}
            <button onClick={undo} className="text-lg p-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>↩️</button>
            <button onClick={clearAll} className="text-lg p-1.5 rounded-xl" style={{ background: 'rgba(220,60,60,0.2)' }}>🗑️</button>
          </div>
        </div>

        {/* Center: canvas */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex-1 rounded-2xl p-1.5 flex items-center justify-center" style={panelStyle}>
            <div className="relative w-full" style={{ maxWidth: 520 }}>
              <div className="relative rounded-xl overflow-hidden" style={{ border: '2px solid rgba(255,217,61,0.4)', aspectRatio: '1 / 1' }}>
                <canvas ref={baseRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }} />
                <canvas ref={drawRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }} />
                <canvas ref={imgRef}  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 3, pointerEvents: 'none' }} />
                <canvas ref={eventRef}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 4, cursor: tool === 'sticker' ? 'cell' : 'crosshair' }}
                  onMouseDown={startDraw} onMouseMove={onDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={onDraw} onTouchEnd={stopDraw}
                />
              </div>
            </div>
          </div>

          {/* Stickers below canvas on desktop */}
          <div className="shrink-0 rounded-2xl px-3 py-2" style={panelStyle}>
            <div className="font-fredoka text-[10px] text-white/50 mb-1.5 text-center">🎀 印章貼紙</div>
            <div className="flex flex-wrap gap-1">
              {STICKERS.map(s => (
                <button key={s} onClick={() => { setCurrentSticker(s); setTool('sticker'); }}
                  className="flex items-center justify-center rounded-lg transition-all hover:scale-125"
                  style={{
                    width: 32, height: 32, fontSize: 20,
                    background: tool === 'sticker' && currentSticker === s ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.05)',
                    border: tool === 'sticker' && currentSticker === s ? '1.5px solid #FFD93D' : '1px solid transparent',
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT: stacked vertically, all scrollable */}
      <div className="flex md:hidden flex-col gap-2 px-2 pb-4">

        {/* Colors + tools in one horizontal row */}
        <div className="shrink-0 rounded-2xl p-2" style={panelStyle}>
          {/* Color row */}
          <div className="font-fredoka text-[10px] text-white/50 text-center mb-1">🎨 顏色</div>
          <div className="flex flex-wrap gap-1 mb-2">
            {COLORS.map(c => (
              <button key={c} onClick={() => { setCurrentColor(c); setTool('brush'); }}
                className="rounded-full transition-all shrink-0"
                style={{
                  background: c, width: 24, height: 24,
                  border: currentColor === c ? '3px solid #FFD93D' : '2px solid rgba(255,255,255,0.2)',
                  transform: currentColor === c ? 'scale(1.2)' : '',
                  outline: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.4)' : 'none',
                }}
              />
            ))}
          </div>
          {/* Tools row */}
          <div className="flex gap-2 items-center flex-wrap">
            <div className="font-fredoka text-[10px] text-white/50">🖌️</div>
            {BRUSH_SIZES.map(s => (
              <button key={s} onClick={() => setBrushSize(s)}
                className="flex items-center justify-center rounded-full border-2 transition-all shrink-0"
                style={{
                  width: 22 + s, height: 22 + s,
                  borderColor: brushSize === s ? '#FFD93D' : 'rgba(255,255,255,0.15)',
                  background: brushSize === s ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="rounded-full bg-white" style={{ width: s * 0.45 + 2, height: s * 0.45 + 2, opacity: 0.8 }} />
              </button>
            ))}
            <div className="ml-1 flex gap-1">
              {[{ id: 'brush', label: '✏️' }, { id: 'eraser', label: '🧹' }].map(t => (
                <button key={t.id} onClick={() => setTool(t.id)}
                  className="text-base p-1 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: tool === t.id ? '#FFD93D' : 'rgba(255,255,255,0.1)',
                    background: tool === t.id ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.07)',
                  }}>{t.label}</button>
              ))}
              <button onClick={undo} className="text-base p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>↩️</button>
              <button onClick={clearAll} className="text-base p-1 rounded-xl" style={{ background: 'rgba(220,60,60,0.2)' }}>🗑️</button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="rounded-2xl p-1.5" style={panelStyle}>
          <div className="relative w-full">
            <div className="relative rounded-xl overflow-hidden" style={{ border: '2px solid rgba(255,217,61,0.4)', aspectRatio: '1 / 1' }}>
              <canvas ref={baseRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }} />
              <canvas ref={drawRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }} />
              <canvas ref={imgRef}  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 3, pointerEvents: 'none' }} />
              <canvas ref={eventRef}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 4, cursor: tool === 'sticker' ? 'cell' : 'crosshair' }}
                onMouseDown={startDraw} onMouseMove={onDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={onDraw} onTouchEnd={stopDraw}
              />
            </div>
          </div>
        </div>

        {/* Stickers */}
        <div className="rounded-2xl px-3 py-2" style={panelStyle}>
          <div className="font-fredoka text-[10px] text-white/50 mb-1.5 text-center">🎀 印章貼紙</div>
          <div className="flex flex-wrap gap-1">
            {STICKERS.map(s => (
              <button key={s} onClick={() => { setCurrentSticker(s); setTool('sticker'); }}
                className="flex items-center justify-center rounded-lg transition-all"
                style={{
                  width: 36, height: 36, fontSize: 22,
                  background: tool === 'sticker' && currentSticker === s ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.05)',
                  border: tool === 'sticker' && currentSticker === s ? '1.5px solid #FFD93D' : '1px solid transparent',
                }}
              >{s}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}