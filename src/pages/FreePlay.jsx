import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PianoKeyboard from '@/components/piano/PianoKeyboard';
import BackgroundBubbles from '@/components/piano/BackgroundBubbles';

export default function FreePlay() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <BackgroundBubbles />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/60 backdrop-blur-sm shadow-md w-10 h-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-fredoka text-xl md:text-2xl font-bold text-foreground"
        >
          🎹 自由彈奏
        </motion.h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Character */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 md:gap-10 pb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl md:text-7xl mb-2"
          >
            🐻
          </motion.div>
          <p className="font-fredoka text-muted-foreground text-sm md:text-base">
            點按琴鍵，盡情演奏吧！
          </p>
        </motion.div>

        {/* Piano */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="w-full px-2"
        >
          <PianoKeyboard />
        </motion.div>
      </div>
    </div>
  );
}