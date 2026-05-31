import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import PianoKeyboard from '@/components/piano/PianoKeyboard';
import SongCard from '@/components/piano/SongCard';
import ScoreDisplay from '@/components/piano/ScoreDisplay';
import CompletionModal from '@/components/piano/CompletionModal';
import InstrumentSelector from '@/components/piano/InstrumentSelector';
import { SONGS, playNote } from '@/lib/audioEngine';
import BackgroundBubbles from '@/components/piano/BackgroundBubbles';

export default function SongMode() {
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const [instrument, setInstrument] = useState('piano');


  const currentNote = selectedSong ? selectedSong.notes[currentNoteIndex] : null;



  const handleSelectSong = (song) => {
    setSelectedSong(song);
    setCurrentNoteIndex(0);
    setScore(0);
    setCombo(0);
    setIsPlaying(true);
    setShowComplete(false);
  };

  const handleNotePlay = useCallback((note) => {
    if (!isPlaying || !selectedSong) return;
    if (note === currentNote) {
      const newCombo = combo + 1;
      const points = 10 + (newCombo > 1 ? newCombo * 2 : 0);
      setScore(prev => prev + points);
      setCombo(newCombo);
      const nextIndex = currentNoteIndex + 1;
      if (nextIndex >= selectedSong.notes.length) {
        setIsPlaying(false);
        const finalScore = Math.min(100, Math.round(((score + points) / (selectedSong.notes.length * 14)) * 100));
        setScore(finalScore);
        setTimeout(() => setShowComplete(true), 500);
      } else {
        setCurrentNoteIndex(nextIndex);
      }
    } else {
      setCombo(0);
    }
  }, [isPlaying, selectedSong, currentNote, currentNoteIndex, combo, score]);

  const handleReplay = () => {
    setCurrentNoteIndex(0);
    setScore(0);
    setCombo(0);
    setIsPlaying(true);
    setShowComplete(false);
  };

  const currentNoteLetter = currentNote ? currentNote.replace(/\d/, '') : null;

  return (
    <div className="relative flex flex-col"
      style={{ position:'fixed', inset:0, overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
      <BackgroundBubbles />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <Link to="/piano">
          <button className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-white/60 backdrop-blur-sm shadow-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-fredoka text-xl md:text-2xl lg:text-3xl font-bold text-foreground"
        >
          🎵 歌曲跟彈
        </motion.h1>
        <div className="w-10 md:w-12" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col gap-3 pb-4">
        {/* Song Selection */}
        <div className="px-4">
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
            {SONGS.map(song => (
              <SongCard
                key={song.id}
                song={song}
                isActive={selectedSong?.id === song.id}
                onClick={() => handleSelectSong(song)}
              />
            ))}
          </div>
        </div>

        {/* Instrument selector */}
        <div className="px-4">
          <InstrumentSelector instrument={instrument} onChange={setInstrument} />
        </div>

        {/* Play area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          {!selectedSong ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-4">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl md:text-6xl lg:text-7xl mb-3"
              >
                🎶
              </motion.div>
              <p className="font-fredoka text-base md:text-lg text-muted-foreground">選擇一首歌曲開始吧！</p>
            </motion.div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-2">
                <ScoreDisplay
                  score={score}
                  combo={combo}
                  totalNotes={selectedSong.notes.length}
                  currentIndex={currentNoteIndex}
                />

              </div>

              <AnimatePresence mode="wait">
                {isPlaying && currentNote && (
                  <motion.div
                    key={currentNoteIndex}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="font-fredoka text-2xl md:text-3xl font-bold"
                    style={{ color: '#FFD93D' }}
                  >
                    按下 <span className="text-3xl md:text-4xl">{currentNoteLetter}</span>
                    <span className="text-base text-white/50 ml-1">({currentNote})</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-full px-2"
          >
            <PianoKeyboard
              highlightedNote={isPlaying ? currentNote : null}
              onPlay={handleNotePlay}
              instrument={instrument}
            />
          </motion.div>
        </div>
      </div>

      <CompletionModal
        isOpen={showComplete}
        score={score}
        songName={selectedSong?.name || ''}
        onReplay={handleReplay}
        onHome={() => { setSelectedSong(null); setShowComplete(false); }}
      />
    </div>
  );
}