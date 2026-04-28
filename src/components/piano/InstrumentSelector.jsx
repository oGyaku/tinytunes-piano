import { motion } from 'framer-motion';
import { INSTRUMENTS } from '@/lib/audioEngine';

export default function InstrumentSelector({ instrument, onChange }) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {INSTRUMENTS.map((inst) => {
        const isActive = instrument === inst.id;
        return (
          <motion.button
            key={inst.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => onChange(inst.id)}
            className={`
              flex flex-col items-center gap-1 px-3 py-2 rounded-2xl font-fredoka text-xs md:text-sm font-semibold
              transition-all shadow-md select-none
              ${isActive
                ? 'bg-primary text-primary-foreground scale-105 shadow-lg'
                : 'bg-white/70 backdrop-blur-sm text-foreground hover:bg-white/90'}
            `}
          >
            <span className="text-xl md:text-2xl">{inst.emoji}</span>
            <span>{inst.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}