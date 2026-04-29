import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

// 36 stickers in 6 rows of 6 — even grid on all screen sizes
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
  const [scenes, setScenes] = useState(BUILTIN_SCENES);
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
  const fileInputRef = useRef(null);

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

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newScene = { id: `upload_${Date.now()}`, emoji: '🖼️', name: '我的圖片', img: url };
    setScenes(prev => {
      const filtered = prev.filter(s => !s.id.startsWith('upload_'));
      return [...filtered, newScene];
    });
    handleSelectScene(newScene);
    e.target.value = '';
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

  return (
    <div className="min-h-screen flex flex-col select-none"
      style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF9E6 50%, #F0FFFE 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/80 shadow w-9 h-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="font-fredoka text-lg font-bold" style={{ color: '#C05070' }}>
          🎨 台灣塗鴉樂園
        </h1>
        <div className="w-9" />
      </div>

      {/* Scene strip */}
      <div className="px-3 pb-1 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {scenes.map(scene => (
            <motion.button
              key={scene.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleSelectScene(scene)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl font-fredoka text-[11px] font-semibold shrink-0 transition-all
                ${currentScene.id === scene.id ? 'text-white shadow-md' : 'bg-white/80 text-foreground'}`}
              style={currentScene.id === scene.id ? { background: 'linear-gradient(135deg,#F3A8A8,#E8C1F4)' } : {}}
            >
              <span className="text-base">{scene.emoji}</span>
              <span className="whitespace-nowrap">{scene.name}</span>
            </motion.button>
          ))}
          {/* Upload button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl font-fredoka text-[11px] font-semibold shrink-0 bg-white/80 border-2 border-dashed border-pink-300 text-pink-400"
          >
            <span className="text-base">📁</span>
            <span className="whitespace-nowrap">上傳圖片</span>
          </motion.button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row gap-2 px-2 pb-3 min-h-0">

        {/* Color / Tool sidebar — horizontal strip on mobile, vertical on desktop */}
        <div className="bg-white/85 rounded-2xl shadow p-2 shrink-0 md:w-28 overflow-x-auto md:overflow-visible">
          <div className="flex md:flex-col gap-3 md:gap-2 min-w-max md:min-w-0">
            {/* Colors */}
            <div className="shrink-0">
              <div className="font-fredoka text-[10px] text-muted-foreground text-center mb-1">🎨 顏色</div>
              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 22px)' }}
                   /* desktop: 3 cols */ 
              >
                <style>{`@media(min-width:768px){.color-grid{grid-template-columns:repeat(3,22px)!important}}`}</style>
                <div className="color-grid grid gap-1 col-span-10 md:col-span-1"
                  style={{ gridTemplateColumns: 'repeat(10, 22px)' }}
                >
                  {/* This inner div handles responsive columns via inline + className approach */}
                </div>
              </div>
              {/* Simpler approach: just render colors, CSS handles columns */}
              <div className="flex flex-wrap gap-1" style={{ maxWidth: 240 }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCurrentColor(c); setTool('brush'); }}
                    className="rounded-full transition-all hover:scale-110 shrink-0"
                    style={{
                      background: c, width: 22, height: 22,
                      border: currentColor === c ? '3px solid #333' : '2px solid rgba(0,0,0,0.1)',
                      transform: currentColor === c ? 'scale(1.25)' : '',
                      outline: c === '#FFFFFF' ? '1px solid #ccc' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="md:hidden w-px bg-gray-200 self-stretch mx-1 shrink-0" />
            <div className="hidden md:block h-px bg-gray-100 w-full" />

            {/* Brush + tools */}
            <div className="flex md:flex-col gap-2 items-start shrink-0">
              <div>
                <div className="font-fredoka text-[10px] text-muted-foreground text-center mb-1">🖌️ 筆</div>
                <div className="flex md:flex-col gap-1 items-center">
                  {BRUSH_SIZES.map(s => (
                    <button key={s}
                      onClick={() => setBrushSize(s)}
                      className={`flex items-center justify-center rounded-full border-2 transition-all shrink-0 ${brushSize === s ? 'border-pink-400 bg-pink-50' : 'border-transparent bg-gray-100'}`}
                      style={{ width: 26 + s, height: 26 + s }}
                    >
                      <div className="rounded-full bg-gray-700" style={{ width: s * 0.5 + 2, height: s * 0.5 + 2 }} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex md:flex-col gap-1 shrink-0">
                {[{ id: 'brush', label: '✏️' }, { id: 'eraser', label: '🧹' }].map(t => (
                  <button key={t.id} onClick={() => setTool(t.id)} title={t.id === 'brush' ? '畫筆' : '橡皮擦'}
                    className={`text-lg p-1.5 rounded-xl border-2 transition-all ${tool === t.id ? 'border-pink-400 bg-pink-50' : 'border-transparent bg-gray-100'}`}
                  >{t.label}</button>
                ))}
                <button onClick={undo} className="text-lg p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200">↩️</button>
                <button onClick={clearAll} className="text-lg p-1.5 rounded-xl bg-red-50 hover:bg-red-100">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas + Stickers */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 min-h-0">
          {/* Canvas */}
          <div className="flex-1 bg-white/85 rounded-2xl shadow p-1.5 flex items-center justify-center min-h-0">
            <div className="relative w-full" style={{ maxWidth: 560 }}>
              <div className="relative rounded-xl overflow-hidden" style={{ border: '3px dashed #F3A8A8', aspectRatio: '1 / 1' }}>
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

          {/* Stickers — 6 columns, 6 rows = 36 total, always even */}
          <div className="bg-white/85 rounded-2xl shadow px-3 py-2 shrink-0">
            <div className="font-fredoka text-[10px] text-muted-foreground mb-1.5 text-center">🎀 印章貼紙</div>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
              {STICKERS.map(s => (
                <button
                  key={s}
                  onClick={() => { setCurrentSticker(s); setTool('sticker'); }}
                  className={`text-xl aspect-square rounded-xl border-2 transition-all hover:scale-125 flex items-center justify-center
                    ${tool === 'sticker' && currentSticker === s ? 'border-yellow-400 bg-yellow-50 scale-110' : 'border-transparent bg-gray-50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}