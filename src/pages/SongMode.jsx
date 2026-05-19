import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import PianoKeyboard from '@/components/piano/PianoKeyboard';
import SongCard from '@/components/piano/SongCard';
import ScoreDisplay from '@/components/piano/ScoreDisplay';
import CompletionModal from '@/components/piano/CompletionModal';
import InstrumentSelector from '@/components/piano/InstrumentSelector';
import { SONGS, playNote } from '@/lib/audioEngine';

const STARS = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 47 + 5) % 100, y: (i * 61 + 11) % 100,
  r: i % 3 === 0 ? 2.5 : 1.5, delay: (i * 0.22) % 2.5,
}));

export default function SongMode() {
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [instrument, setInstrument] = useState('piano');
  const autoPlayRef = useRef(null);

  const currentNote = selectedSong ? selectedSong.notes[currentNoteIndex] : null;

  useEffect(() => {
    return () => { if (autoPlayRef.current) clearTimeout(autoPlayRef.current); };
  }, []);

  const handleSelectSong = (song) => {
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    setSelectedSong(song);
    setCurrentNoteIndex(0);
    setScore(0);
    setCombo(0);
    setIsPlaying(true);
    setShowComplete(false);
    setIsAutoPlaying(false);
  };

  const handleNotePlay = useCallback((note) => {
    if (!isPlaying || !selectedSong || isAutoPlaying) return;
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
  }, [isPlaying, selectedSong, currentNote, currentNoteIndex, combo, score, isAutoPlaying]);

  const handleAutoPlay = () => {
    if (!selectedSong || isAutoPlaying) return;
    setIsAutoPlaying(true);
    setCurrentNoteIndex(0);
    let i = 0;
    const playNext = () => {
      if (i >= selectedSong.notes.length) { setIsAutoPlaying(false); setCurrentNoteIndex(0); return; }
      const note = selectedSong.notes[i];
      setCurrentNoteIndex(i);
      playNote(note, instrument);
      i++;
      autoPlayRef.current = setTimeout(playNext, selectedSong.tempo);
    };
    playNext();
  };

  const handleReplay = () => {
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    setCurrentNoteIndex(0);
    setScore(0);
    setCombo(0);
    setIsPlaying(true);
    setShowComplete(false);
    setIsAutoPlaying(false);
  };

  const currentNoteLetter = currentNote ? currentNote.replace(/\d/, '') : null;

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
        {[{x:'8%',y:'15%'},{x:'88%',y:'10%'},{x:'92%',y:'75%'}].map((sp,i)=>(
          <motion.span key={i} className="absolute select-none"
            style={{ left:sp.x, top:sp.y, fontSize:13, color:'#FFD93D', opacity:0.5 }}
            animate={{ scale:[1,1.3,1], opacity:[0.3,0.8,0.3] }}
            transition={{ duration:2, delay:i*0.5, repeat:Infinity }}>✦</motion.span>
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
          🎵 歌曲跟彈
        </motion.h1>
        <div className="w-10" />
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
                className="text-6xl md:text-7xl mb-3"
              >
                🎶
              </motion.div>
              <p className="font-fredoka text-lg text-white/60">選擇一首歌曲開始吧！</p>
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
                <div className="flex gap-2">
                  <button
                    onClick={handleAutoPlay}
                    disabled={isAutoPlaying}
                    className="flex items-center gap-1.5 font-fredoka text-sm px-4 py-2 rounded-full disabled:opacity-50 transition-all"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    <Play className="w-4 h-4" />
                    示範
                  </button>
                  <button
                    onClick={handleReplay}
                    className="flex items-center gap-1.5 font-fredoka text-sm px-4 py-2 rounded-full transition-all"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    重來
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isPlaying && !isAutoPlaying && currentNote && (
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
              highlightedNote={isPlaying || isAutoPlaying ? currentNote : null}
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