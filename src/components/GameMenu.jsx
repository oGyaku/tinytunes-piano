import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GAMES = [
  { to: '/',         emoji: '🏠', title: '首頁' },
  { to: '/piano',    emoji: '🎹', title: '演奏' },
  { to: '/coloring', emoji: '🎨', title: '畫畫' },
  { to: '/puzzle',   emoji: '🧩', title: '拼圖' },
  { to: '/spotit',   emoji: '🔍', title: '尋找' },
  { to: '/marble',   emoji: '🕹️', title: '彈珠' },
];

export default function GameMenu({ currentPath }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-50">
      {/* Hamburger button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 rounded-full flex flex-col items-center justify-center gap-1.5"
        style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)' }}
      >
        <motion.span
          animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className="block rounded-full bg-white"
          style={{ width: 16, height: 2 }}
        />
        <motion.span
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="block rounded-full bg-white"
          style={{ width: 16, height: 2 }}
        />
        <motion.span
          animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className="block rounded-full bg-white"
          style={{ width: 16, height: 2 }}
        />
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute right-0 top-12 z-50 rounded-2xl overflow-hidden"
              style={{
                minWidth: 160,
                background: 'linear-gradient(135deg, rgba(45,27,110,0.97), rgba(30,58,138,0.97))',
                border: '1.5px solid rgba(255,255,255,0.2)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="p-2 flex flex-col gap-1">
                {GAMES.filter(g => g.to !== currentPath).map((g, i) => (
                  <motion.div
                    key={g.to}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link to={g.to} onClick={() => setOpen(false)}>
                      <motion.div
                        whileHover={{ x: 4, background: 'rgba(255,255,255,0.12)' }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
                        style={{ background: 'transparent' }}
                      >
                        <span style={{ fontSize: 20 }}>{g.emoji}</span>
                        <span className="font-fredoka text-base font-bold text-white">{g.title}</span>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}