import { NOTES_3OCT } from '@/lib/audioEngine';
import PianoKey from './PianoKey';

// Oct5 = high (top, lightest), Oct3 = low (bottom, darkest)
const OCTAVES = [5, 4, 3];
const LETTERS = ['C','D','E','F','G','A','B'];

export default function PianoKeyboard({ highlightedNote, onPlay, instrument = 'piano' }) {
  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-4xl mx-auto px-2">
      {OCTAVES.map((oct) => (
        <div key={oct} className="flex gap-1 md:gap-2 flex-1">
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
      ))}
    </div>
  );
}