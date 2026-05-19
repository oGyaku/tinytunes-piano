import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PianoKeyboard from '@/components/piano/PianoKeyboard';
import InstrumentSelector from '@/components/piano/InstrumentSelector';

const STARS = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 43 + 9) % 100, y: (i * 59 + 17) % 100,
  r: i % 3 === 0 ? 2.5 : 1.5, delay: (i * 0.2) % 2.5,
}));

export default function FreePlay() {
  const [instrument, setInstrument] = useState('piano');

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(160deg, #1a0b40 0%, #2d1b6e 35%, #1e3a8a 70%, #0f2b5c 100%)' }}>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none">
        {STARS.map((s, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r }}
            animate={{ opacity: [0.1, 0.7, 0.1] }}
            transition={{ duration: 2 + s.delay, repeat: Infinity, delay: s.delay }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <Link to="/">
          <button className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </Link>
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-fredoka text-xl md:text-2xl font-bold text-white drop-shadow"
        >
          🎹 自由彈奏
        </motion.h1>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center gap-4 pb-6">
        {/* Character */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl md:text-6xl mb-1"
          >
            🐬
          </motion.div>
          <p className="font-fredoka text-white/60 text-sm">
            點按琴鍵，盡情演奏吧！
          </p>
        </motion.div>

        {/* Instrument Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full px-4"
        >
          <InstrumentSelector instrument={instrument} onChange={setInstrument} />
        </motion.div>

        {/* Piano */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="w-full px-2 flex-1 flex items-center"
        >
          <PianoKeyboard instrument={instrument} />
        </motion.div>
      </div>
    </div>
  );
}