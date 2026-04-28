import { motion } from 'framer-motion';
import { Star, Music } from 'lucide-react';

export default function ScoreDisplay({ score, combo, totalNotes, currentIndex }) {
  return (
    <div className="flex items-center justify-center gap-4 md:gap-8 font-fredoka">
      {/* Score */}
      <motion.div
        key={score}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
      >
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <span className="text-lg md:text-xl font-bold text-foreground">{score}</span>
      </motion.div>

      {/* Combo */}
      {combo > 1 && (
        <motion.div
          key={combo}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          className="flex items-center gap-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full px-4 py-2 shadow-lg"
        >
          <span className="text-white font-bold text-sm md:text-base">
            🔥 x{combo}
          </span>
        </motion.div>
      )}

      {/* Progress */}
      {totalNotes > 0 && (
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <Music className="w-4 h-4 text-primary" />
          <span className="text-sm md:text-base font-semibold text-foreground">
            {currentIndex}/{totalNotes}
          </span>
        </div>
      )}
    </div>
  );
}