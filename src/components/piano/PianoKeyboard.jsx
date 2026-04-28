import { NOTES_3OCT } from '@/lib/audioEngine';
import PianoKey from './PianoKey';

// Group into octaves for visual separation
const OCTAVES = [3, 4, 5];
const LETTERS = ['C','D','E','F','G','A','B'];

export default function PianoKeyboard({ highlightedNote, onPlay, instrument = 'piano' }) {
  return (
    <div className="flex flex-col gap-1 md:gap-2 w-full max-w-4xl mx-auto px-2">
      {OCTAVES.map((oct) => (
        <div key={oct} className="flex items-center gap-1 md:gap-1.5">
          {/* Octave label */}
          <div className="font-fredoka text-xs text-muted-foreground w-5 shrink-0 text-center">
            {oct}
          </div>
          {/* 7 keys */}
          <div className="flex gap-1 md:gap-1.5 flex-1">
            {LETTERS.map(letter => {
              const fullNote = `${letter}${oct}`;
              return (
                <PianoKey
                  key={fullNote}
                  note={fullNote}
                  octave={oct}
                  isHighlighted={highlightedNote === fullNote}
                  onPlay={onPlay}
                  instrument={instrument}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}