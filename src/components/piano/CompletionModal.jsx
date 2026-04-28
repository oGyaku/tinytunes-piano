import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Star, RotateCcw, Home } from 'lucide-react';

export default function CompletionModal({ isOpen, score, songName, onReplay, onHome }) {
  const stars = score >= 90 ? 3 : score >= 60 ? 2 : 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
          >
            {/* Celebration emoji */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-6xl mb-4"
            >
              {stars === 3 ? '🎉' : stars === 2 ? '👏' : '💪'}
            </motion.div>

            <h2 className="font-fredoka text-2xl font-bold text-foreground mb-2">
              {stars === 3 ? '太棒了！' : stars === 2 ? '很不錯！' : '繼續加油！'}
            </h2>

            <p className="font-fredoka text-muted-foreground mb-4">
              你完成了《{songName}》
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
                >
                  <Star
                    className={`w-12 h-12 ${
                      i <= stars
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            <p className="font-fredoka text-lg font-bold text-primary mb-6">
              得分：{score} 分
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={onHome}
                variant="outline"
                className="flex-1 rounded-xl h-12 font-fredoka text-base"
              >
                <Home className="w-5 h-5 mr-2" />
                主頁
              </Button>
              <Button
                onClick={onReplay}
                className="flex-1 rounded-xl h-12 font-fredoka text-base bg-gradient-to-r from-primary to-accent text-white"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                再玩
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}