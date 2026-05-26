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

const panelStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 16,
};

// A single canvas stack — used in both desktop and mobile layouts
function CanvasArea({ baseRef, drawRef, imgRef, eventRef, tool, startDraw, onDraw, stopDraw }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
      <div className="absolute inset-0 rounded-xl overflow-hidden"
        style={{ border: '2px solid rgba(255,217,61,0.4)' }}>
        <canvas ref={baseRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1 }} />
        <canvas ref={drawRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:2 }} />
        <canvas ref={imgRef}  style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:3, pointerEvents:'none' }} />
        <canvas ref={eventRef}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:4,
            cursor: tool === 'sticker' ? 'cell' : 'crosshair' }}
          onMouseDown={startDraw} onMouseMove={onDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={onDraw} onTouchEnd={stopDraw}
        />
      </div>
    </div>
  );
}

function ColorPalette({ currentColor, setCurrentColor, setTool }) {
  return (
    <div className="flex flex-wrap gap-1">
      {COLORS.map(c => (
        <button key={c}
          onClick={() => { setCurrentColor(c); setTool('brush'); }}
          className="rounded-full shrink-0 transition-transform"
          style={{
            background: c,
            width: 26, height: 26,
            border: currentColor === c ? '3px solid #FFD93D' : '2px solid rgba(255,255,255,0.2)',
            transform: currentColor === c ? 'scale(1.15)' : 'scale(1)',
            outline: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.4)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

function BrushTools({ brushSize, setBrushSize, tool, setTool, undo, clearAll }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {BRUSH_SIZES.map(s => (
        <button key={s}
          onClick={() => setBrushSize(s)}
          className="flex items-center justify-center rounded-full border-2 shrink-0 transition-all"
          style={{
            width: 18 + s, height: 18 + s,
            borderColor: brushSize === s ? '#FFD93D' : 'rgba(255,255,255,0.2)',
            background: brushSize === s ? 'rgba(255,217,61,0.18)' : 'rgba(255,255,255,0.08)',
          }}
        >
          <div className="rounded-full bg-white" style={{ width: Math.max(4, s * 0.5), height: Math.max(4, s * 0.5), opacity: 0.85 }} />
        </button>
      ))}
      <div className="flex gap-1 ml-1">
        {[{ id:'brush', label:'✏️' }, { id:'eraser', label:'🧹' }].map(t => (
          <button key={t.id} onClick={() => setTool(t.id)}
            className="text-lg p-1 rounded-xl border-2 transition-all"
            style={{
              borderColor: tool === t.id ? '#FFD93D' : 'rgba(255,255,255,0.1)',
              background: tool === t.id ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.07)',
            }}>{t.label}</button>
        ))}
        <button onClick={undo} className="text-lg p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>↩️</button>
        <button onClick={clearAll} className="text-lg p-1 rounded-xl" style={{ background: 'rgba(220,60,60,0.2)' }}>🗑️</button>
      </div>
    </div>
  );
}

function StickerPanel({ currentSticker, setCurrentSticker, tool, setTool }) {
  return (
    <div className="flex flex-wrap gap-1">
      {STICKERS.map(s => (
        <button key={s}
          onClick={() => { setCurrentSticker(s); setTool('sticker'); }}
          className="flex items-center justify-center rounded-lg transition-all"
          style={{
            width: 34, height: 34, fontSize: 20,
            background: tool === 'sticker' && currentSticker === s ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.06)',
            border: tool === 'sticker' && currentSticker === s ? '1.5px solid #FFD93D' : '1px solid transparent',
          }}
        >{s}</button>
      ))}
    </div>
  );
}

export default function ColoringGame() {
  const [currentScene, setCurrentScene] = useState(BUILTIN_SCENES[0]);
  const [currentColor, setCurrentColor] = useState('#CC2222');
  const [brushSize, setBrushSize] = useState(12);
  const [tool, setTool] = useState('brush');
  const [currentSticker, setCurrentSticker] = useState('⭐');

  // We need separate refs for each layout (desktop vs mobile) because only one is mounted at a time
  const baseRefD  = useRef(null); const drawRefD  = useRef(null);
  const imgRefD   = useRef(null); const eventRefD = useRef(null);
  const baseRefM  = useRef(null); const drawRefM  = useRef(null);
  const imgRefM   = useRef(null); const eventRefM = useRef(null);

  const isDrawing = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });
  const history   = useRef([]);
  const currentSceneRef = useRef(BUILTIN_SCENES[0]);

  const loadSceneOnCanvas = useCallback((scene, baseRef, drawRef, imgRef) => {
    const b = baseRef.current; const d = drawRef.current; const im = imgRef.current;
    if (!b || !d || !im) return;
    const w = b.width; const h = b.height;
    b.getContext('2d').clearRect(0, 0, w, h);
    d.getContext('2d').clearRect(0, 0, w, h);
    im.getContext('2d').clearRect(0, 0, w, h);
    b.getContext('2d').fillStyle = '#FFFFFF';
    b.getContext('2d').fillRect(0, 0, w, h);
    history.current = [];
    if (!scene.img) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => im.getContext('2d').drawImage(img, 0, 0, w, h);
    img.src = scene.img;
  }, []);

  const resizeCanvas = useCallback((scene, wrapEl, baseRef, drawRef, imgRef, eventRef) => {
    if (!wrapEl) return;
    const size = wrapEl.clientWidth;
    if (size < 10) return;
    [baseRef, drawRef, imgRef, eventRef].forEach(r => {
      if (r.current) { r.current.width = size; r.current.height = size; }
    });
    loadSceneOnCanvas(scene, baseRef, drawRef, imgRef);
  }, [loadSceneOnCanvas]);

  // Wrapper refs for measuring size
  const wrapDesktopRef = useRef(null);
  const wrapMobileRef  = useRef(null);

  const resizeAll = useCallback((scene) => {
    resizeCanvas(scene, wrapDesktopRef.current, baseRefD, drawRefD, imgRefD, eventRefD);
    resizeCanvas(scene, wrapMobileRef.current,  baseRefM, drawRefM, imgRefM, eventRefM);
  }, [resizeCanvas]);

  useEffect(() => {
    const timer = setTimeout(() => resizeAll(BUILTIN_SCENES[0]), 80);
    const handler = () => resizeAll(currentSceneRef.current);
    window.addEventListener('resize', handler);
    return () => { clearTimeout(timer); window.removeEventListener('resize', handler); };
  }, [resizeAll]);

  const handleSelectScene = (scene) => {
    setCurrentScene(scene);
    currentSceneRef.current = scene;
    resizeAll(scene);
  };

  const getPos = (e, eventRef, drawRef) => {
    const rect = eventRef.current.getBoundingClientRect();
    const sx = drawRef.current.width / rect.width;
    const sy = drawRef.current.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  // Returns the currently active draw canvas (whichever is visible)
  const getActiveRefs = () => {
    // desktop visible if wrapDesktopRef has size
    if (wrapDesktopRef.current && wrapDesktopRef.current.clientWidth > 10) {
      return { base: baseRefD, draw: drawRefD, img: imgRefD, event: eventRefD };
    }
    return { base: baseRefM, draw: drawRefM, img: imgRefM, event: eventRefM };
  };

  const makeDrawHandlers = (eRef, dRef) => {
    const saveHistory = () => {
      const d = dRef.current; if (!d) return;
      if (history.current.length > 20) history.current.shift();
      history.current.push(d.getContext('2d').getImageData(0, 0, d.width, d.height));
    };
    const startDraw = (e) => {
      e.preventDefault();
      const { x, y } = getPos(e, eRef, dRef);
      const dCtx = dRef.current.getContext('2d');
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
      const { x, y } = getPos(e, eRef, dRef);
      const dCtx = dRef.current.getContext('2d');
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
    return { startDraw, onDraw, stopDraw };
  };

  const desktopHandlers = makeDrawHandlers(eventRefD, drawRefD);
  const mobileHandlers  = makeDrawHandlers(eventRefM, drawRefM);

  const undo = () => {
    if (!history.current.length) return;
    const snap = history.current.pop();
    [drawRefD, drawRefM].forEach(r => {
      if (r.current && r.current.width > 0) r.current.getContext('2d').putImageData(snap, 0, 0);
    });
  };
  const clearAll = () => {
    [drawRefD, drawRefM].forEach(r => {
      if (r.current && r.current.width > 0) {
        const d = r.current.getContext('2d');
        d.clearRect(0, 0, r.current.width, r.current.height);
      }
    });
  };

  return (
    <div className="flex flex-col select-none"
      style={{ position:'fixed', inset:0, overflowY:'auto', WebkitOverflowScrolling:'touch', background: 'linear-gradient(160deg, #1a0b40 0%, #2d1b6e 35%, #1e3a8a 70%, #0f2b5c 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <Link to="/">
          <button className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center"
            style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)' }}>
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>
        </Link>
        <h1 className="font-fredoka text-lg md:text-2xl lg:text-3xl font-bold text-white drop-shadow">🎨 畫畫</h1>
        <div className="w-9 md:w-11" />
      </div>

      {/* Scene strip — horizontal scroll */}
      <div className="px-3 pb-2 shrink-0">
        <div className="flex flex-wrap gap-1.5 pb-1">
          {BUILTIN_SCENES.map(scene => (
            <motion.button key={scene.id} whileTap={{ scale: 0.92 }}
              onClick={() => handleSelectScene(scene)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl font-fredoka font-semibold shrink-0 transition-all text-xs md:text-sm"
              style={currentScene.id === scene.id
                ? { background:'rgba(255,217,61,0.3)', border:'1.5px solid #FFD93D', color:'#FFD93D' }
                : { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.75)' }
              }
            >
              <span className="text-base md:text-lg">{scene.emoji}</span>
              <span className="whitespace-nowrap">{scene.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (md+): sidebar left, canvas+stickers center ── */}
      <div className="hidden md:flex flex-1 gap-3 px-3 pb-4">

        {/* Left sidebar */}
        <div className="shrink-0 w-36 lg:w-44 flex flex-col gap-3 overflow-y-auto rounded-2xl p-3"
          style={panelStyle}>
          <div className="font-fredoka text-xs text-white/50 text-center">🎨 顏色</div>
          <ColorPalette currentColor={currentColor} setCurrentColor={setCurrentColor} setTool={setTool} />
          <div className="h-px" style={{ background:'rgba(255,255,255,0.1)' }} />
          <div className="font-fredoka text-xs text-white/50 text-center">🖌️ 筆刷 / 工具</div>
          <div className="flex flex-col gap-2 items-center">
            {BRUSH_SIZES.map(s => (
              <button key={s} onClick={() => setBrushSize(s)}
                className="flex items-center justify-center rounded-full border-2 transition-all"
                style={{
                  width: 22 + s, height: 22 + s,
                  borderColor: brushSize === s ? '#FFD93D' : 'rgba(255,255,255,0.2)',
                  background: brushSize === s ? 'rgba(255,217,61,0.18)' : 'rgba(255,255,255,0.08)',
                }}>
                <div className="rounded-full bg-white" style={{ width: Math.max(4, s * 0.5), height: Math.max(4, s * 0.5), opacity: 0.85 }} />
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1 items-center">
            {[{ id:'brush', label:'✏️' }, { id:'eraser', label:'🧹' }].map(t => (
              <button key={t.id} onClick={() => setTool(t.id)}
                className="text-xl p-2 rounded-xl border-2 transition-all"
                style={{
                  borderColor: tool === t.id ? '#FFD93D' : 'rgba(255,255,255,0.1)',
                  background: tool === t.id ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.07)',
                }}>{t.label}</button>
            ))}
            <button onClick={undo} className="text-xl p-2 rounded-xl" style={{ background:'rgba(255,255,255,0.1)' }}>↩️</button>
            <button onClick={clearAll} className="text-xl p-2 rounded-xl" style={{ background:'rgba(220,60,60,0.2)' }}>🗑️</button>
          </div>
        </div>

        {/* Center: canvas + stickers stacked */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Canvas — capped so it never taller than viewport */}
          <div className="flex justify-center">
            <div ref={wrapDesktopRef} className="rounded-xl overflow-hidden"
              style={{ aspectRatio:'1/1', width:'100%', maxWidth:'calc(100vh - 180px)', border:'2px solid rgba(255,217,61,0.4)', position:'relative' }}>
              <canvas ref={baseRefD}  style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1 }} />
              <canvas ref={drawRefD}  style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:2 }} />
              <canvas ref={imgRefD}   style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:3, pointerEvents:'none' }} />
              <canvas ref={eventRefD}
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:4, cursor: tool==='sticker'?'cell':'crosshair' }}
                onMouseDown={desktopHandlers.startDraw} onMouseMove={desktopHandlers.onDraw}
                onMouseUp={desktopHandlers.stopDraw} onMouseLeave={desktopHandlers.stopDraw}
                onTouchStart={desktopHandlers.startDraw} onTouchMove={desktopHandlers.onDraw} onTouchEnd={desktopHandlers.stopDraw}
              />
            </div>
          </div>

          {/* Stickers */}
          <div className="rounded-2xl px-3 py-2 shrink-0" style={panelStyle}>
            <div className="font-fredoka text-xs md:text-sm text-white/50 mb-2 text-center">🎀 印章貼紙</div>
            <StickerPanel currentSticker={currentSticker} setCurrentSticker={setCurrentSticker} tool={tool} setTool={setTool} />
          </div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT (< md): fully stacked, all scrollable ── */}
      <div className="flex md:hidden flex-col gap-2 px-2 pb-6">

        {/* Colors + tools */}
        <div className="rounded-2xl p-2.5" style={panelStyle}>
          <div className="font-fredoka text-xs text-white/50 text-center mb-1.5">🎨 顏色</div>
          <ColorPalette currentColor={currentColor} setCurrentColor={setCurrentColor} setTool={setTool} />
          <div className="mt-2">
            <div className="font-fredoka text-xs text-white/50 mb-1.5">🖌️ 筆刷 / 工具</div>
            <BrushTools brushSize={brushSize} setBrushSize={setBrushSize} tool={tool} setTool={setTool} undo={undo} clearAll={clearAll} />
          </div>
        </div>

        {/* Canvas */}
        <div ref={wrapMobileRef} className="w-full rounded-xl overflow-hidden" style={{ aspectRatio:'1/1', border:'2px solid rgba(255,217,61,0.4)', position:'relative' }}>
          <canvas ref={baseRefM}  style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1 }} />
          <canvas ref={drawRefM}  style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:2 }} />
          <canvas ref={imgRefM}   style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:3, pointerEvents:'none' }} />
          <canvas ref={eventRefM}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:4, cursor: tool==='sticker'?'cell':'crosshair' }}
            onMouseDown={mobileHandlers.startDraw} onMouseMove={mobileHandlers.onDraw}
            onMouseUp={mobileHandlers.stopDraw} onMouseLeave={mobileHandlers.stopDraw}
            onTouchStart={mobileHandlers.startDraw} onTouchMove={mobileHandlers.onDraw} onTouchEnd={mobileHandlers.stopDraw}
          />
        </div>

        {/* Stickers */}
        <div className="rounded-2xl px-3 py-2" style={panelStyle}>
          <div className="font-fredoka text-xs text-white/50 mb-1.5 text-center">🎀 印章貼紙</div>
          <StickerPanel currentSticker={currentSticker} setCurrentSticker={setCurrentSticker} tool={tool} setTool={setTool} />
        </div>
      </div>
    </div>
  );
}