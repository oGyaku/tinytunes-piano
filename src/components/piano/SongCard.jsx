import { motion } from 'framer-motion';

export default function SongCard({ song, isActive, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 p-3 md:p-4 rounded-2xl font-fredoka
        transition-colors select-none cursor-pointer min-w-[80px] md:min-w-[100px]
        ${isActive
          ? 'ring-4 ring-white shadow-xl'
          : 'shadow-lg hover:shadow-xl'
        }
      `}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${song.color}, ${song.color}CC)`
          : `linear-gradient(135deg, ${song.color}40, ${song.color}20)`,
        border: `3px solid ${song.color}${isActive ? '' : '60'}`,
      }}
    >
      <span className="text-2xl md:text-3xl">{song.emoji}</span>
      <span
        className="text-xs md:text-sm font-semibold whitespace-nowrap"
        style={{ color: isActive ? 'white' : song.color }}
      >
        {song.name}
      </span>
    </motion.button>
  );
}