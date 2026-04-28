import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SCENES = [
  { id: 'train',   emoji: '🚂', name: '阿里山小火車', img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/587a35d34_Train.png' },
  { id: 'zongzi',  emoji: '🍙', name: '肉粽',         img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/4fade2242_Zongzi.png' },
  { id: 'bear',    emoji: '🐻', name: '台灣黑熊',     img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/a846f31ae_Bear.png' },
  { id: 'bubble',  emoji: '🧋', name: '珍珠奶茶',     img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/c845c5729_Bubble.png' },
  { id: 'cooker',  emoji: '🍲', name: '大同電鍋',     img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/e64937674_Cooker.png' },
  { id: 'lantern', emoji: '🏮', name: '燈籠',         img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/ab88e86d1_Lanterns.png' },
  { id: 'magpie',  emoji: '🐦', name: '台灣藍鵲',     img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/46edad605_Magpie.png' },
  { id: 'taipei',  emoji: '🏙️', name: '臺北101',      img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/8dad06fa5_Taipei101.png' },
  { id: 'tiles',   emoji: '🌸', name: '古早花磚',     img: 'https://media.base44.com/images/public/69f06f0c3b22568cfa2d4c92/67ba003b6_Tiles.png' },
];

const COLORS = [
  '#FF9999','#FF6B6B','#CC3333',
  '#FFBB77','#FF9F43','#E07830',
  '#FFEE99','#FFD93D','#CCAA00',
  '#AAEEBB','#6BCB77','#339944',
  '#AADDEE','#4ECDC4','#2299AA',
  '#AABBFF','#4D96FF','#2255CC',
  '#DDAAEE','#C39BD3','#9B59B6',
  '#FFB3D1','#FF6B9D','#CC2266',
  '#DDBB99','#CC9966','#885522',
  '#FFFFFF','#AAAAAA','#333333',
];

const STICKERS = ['⭐','🌟','💫','✨','🎉','❤️','💕','🌈','🌸','🍀','🦋','🐶','🐱','🐻','🦄','🍭','🍦','🎂'];
const BRUSH_SIZES = [6, 14, 26];

export default function ColoringGame() {
  const [currentScene, setCurrentScene] = useState(SCENES[0]);
  const [currentColor, setCurrentColor] = useState('#FF9999');
  const [brushSize, setBrushSize] = useState(6);
  const [tool, setTool] = useState('brush'); // brush | eraser | sticker
  const [currentSticker, setCurrentSticker] = useState('⭐');
  const [saved, setSaved] = useState(false);

  const baseRef  = useRef(null);
  const drawRef  = useRef(null);
  const imgRef   = useRef(null);
  const eventRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });
  const history   = useRef([]);

  // Resize all canvases
  const resize = (scene) => {
    const container = eventRef.current?.parentElement;
    if (!container) return;
    const parentW = container.parentElement?.clientWidth - 32 || 300;
    const size = Math.min(parentW, 480);
    const w = size, h = Math.round(size * 0.85);
    [baseRef.current, drawRef.current, imgRef.current, eventRef.current].forEach(c => {
      if (!c) return;
      c.width = w; c.height = h;
    });
    loadScene(scene || currentScene, w, h);
    history.current = [];
  };

  const loadScene = (scene, w, h) => {
    const bCtx = baseRef.current?.getContext('2d');
    const dCtx = drawRef.current?.getContext('2d');
    const iCtx = imgRef.current?.getContext('2d');
    if (!bCtx || !dCtx || !iCtx) return;
    const cw = w || baseRef.current.width;
    const ch = h || baseRef.current.height;
    bCtx.clearRect(0, 0, cw, ch);
    dCtx.clearRect(0, 0, cw, ch);
    iCtx.clearRect(0, 0, cw, ch);
    bCtx.fillStyle = '#FFFFFF';
    bCtx.fillRect(0, 0, cw, ch);
    history.current = [];

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(cw / img.width, ch / img.height) * 0.9;
      const iw = img.width * scale, ih = img.height * scale;
      const ix = (cw - iw) / 2, iy = (ch - ih) / 2;
      iCtx.drawImage(img, ix, iy, iw, ih);
    };
    img.src = scene.img;
  };

  useEffect(() => {
    resize(SCENES[0]);
    window.addEventListener('resize', () => resize());
    return () => window.removeEventListener('resize', () => resize());
  }, []);

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
      dCtx.font = `${brushSize * 3 + 20}px serif`;
      dCtx.textAlign = 'center';
      dCtx.textBaseline = 'middle';
      dCtx.fillText(currentSticker, x, y);
      return;
    }
    saveHistory();
    isDrawing.current = true;
    lastPos.current = { x, y };
    dCtx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    dCtx.beginPath();
    dCtx.arc(x, y, (tool === 'eraser' ? brushSize * 2 : brushSize) / 2, 0, Math.PI * 2);
    dCtx.fillStyle = currentColor;
    dCtx.fill();
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
    dCtx.lineCap = 'round';
    dCtx.lineJoin = 'round';
    dCtx.stroke();
    lastPos.current = { x, y };
  };

  const stopDraw = () => {
    isDrawing.current = false;
    drawRef.current?.getContext('2d').then?.(() => {});
  };

  const undo = () => {
    if (!history.current.length) return;
    const dCtx = drawRef.current.getContext('2d');
    dCtx.putImageData(history.current.pop(), 0, 0);
  };

  const clearAll = () => {
    saveHistory();
    drawRef.current.getContext('2d').clearRect(0, 0, drawRef.current.width, drawRef.current.height);
  };

  const handleSelectScene = (scene) => {
    setCurrentScene(scene);
    resize(scene);
  };

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF9E6 50%, #F0FFFE 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/80 shadow-md w-10 h-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-fredoka text-xl font-bold" style={{ color: '#E07890' }}>
          🎨 台灣塗鴉樂園
        </h1>
        <div className="w-10" />
      </div>

      {/* Scene selector */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SCENES.map(scene => (
            <motion.button
              key={scene.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleSelectScene(scene)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl font-fredoka text-xs font-semibold shrink-0 transition-all shadow-sm
                ${currentScene.id === scene.id
                  ? 'text-white scale-105 shadow-md'
                  : 'bg-white/80 text-foreground'}`}
              style={currentScene.id === scene.id ? { background: 'linear-gradient(135deg, #F3A8A8, #E8C1F4)' } : {}}
            >
              <span className="text-lg">{scene.emoji}</span>
              <span className="whitespace-nowrap">{scene.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 gap-3 px-3 pb-4 flex-wrap md:flex-nowrap">
        {/* Left tools */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-3 shadow-md flex flex-row md:flex-col gap-3 w-full md:w-32 md:shrink-0 flex-wrap justify-center md:justify-start">
          {/* Colors */}
          <div>
            <div className="font-fredoka text-xs text-muted-foreground text-center mb-1">🎨 顏色</div>
            <div className="grid grid-cols-3 gap-1">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => { setCurrentColor(c); setTool('brush'); }}
                  className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                  style={{ background: c, borderColor: currentColor === c ? '#333' : 'transparent', transform: currentColor === c ? 'scale(1.2)' : '' }}
                />
              ))}
            </div>
          </div>
          {/* Brush sizes */}
          <div>
            <div className="font-fredoka text-xs text-muted-foreground text-center mb-1">🖌️ 筆刷</div>
            <div className="flex md:flex-col gap-1 items-center justify-center">
              {BRUSH_SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => setBrushSize(s)}
                  className={`flex items-center justify-center rounded-full border-2 transition-all ${brushSize === s ? 'border-primary bg-pink-50' : 'border-transparent bg-gray-100'}`}
                  style={{ width: 36 + (s/26)*10, height: 36 + (s/26)*10 }}
                >
                  <div className="rounded-full bg-foreground" style={{ width: s * 0.6, height: s * 0.6 }} />
                </button>
              ))}
            </div>
          </div>
          {/* Tools */}
          <div className="flex md:flex-col gap-1">
            {[
              { id: 'brush', label: '✏️ 畫筆' },
              { id: 'eraser', label: '🧹 橡皮擦' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`font-fredoka text-xs px-2 py-1.5 rounded-xl border-2 transition-all ${tool === t.id ? 'border-primary bg-pink-50' : 'border-transparent bg-gray-100'}`}
              >
                {t.label}
              </button>
            ))}
            <button
              onClick={undo}
              className="font-fredoka text-xs px-2 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
            >
              ↩️ 上一步
            </button>
            <button
              onClick={clearAll}
              className="font-fredoka text-xs px-2 py-1.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-all"
            >
              🗑️ 清除
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-3 shadow-md w-full flex justify-center">
            <div className="relative rounded-2xl overflow-hidden" style={{ border: '3px dashed #F3A8A8' }}>
              <canvas ref={baseRef} style={{ display: 'block', position: 'relative', zIndex: 1 }} />
              <canvas ref={drawRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }} />
              <canvas ref={imgRef}  style={{ position: 'absolute', top: 0, left: 0, zIndex: 3, pointerEvents: 'none' }} />
              <canvas ref={eventRef}
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 4, cursor: tool === 'sticker' ? 'cell' : 'crosshair' }}
                onMouseDown={startDraw}
                onMouseMove={onDraw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={onDraw}
                onTouchEnd={stopDraw}
              />
            </div>
          </div>

          {/* Stickers */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-3 shadow-md w-full">
            <div className="font-fredoka text-xs text-muted-foreground mb-2 text-center">⭐ 貼紙</div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {STICKERS.map(s => (
                <button
                  key={s}
                  onClick={() => { setCurrentSticker(s); setTool('sticker'); }}
                  className={`text-xl p-1.5 rounded-xl border-2 transition-all hover:scale-125
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