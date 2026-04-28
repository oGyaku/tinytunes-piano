import { NOTES } from '@/lib/audioEngine';
import PianoKey from './PianoKey';

export default function PianoKeyboard({ highlightedNote, onPlay }) {
  return (
    <div className="flex gap-2 md:gap-3 px-2 md:px-6 w-full max-w-3xl mx-auto">
      {NOTES.map(note => (
        <PianoKey
          key={note}
          note={note}
          isHighlighted={highlightedNote === note}
          onPlay={onPlay}
        />
      ))}
    </div>
  );
}