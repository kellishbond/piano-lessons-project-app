import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { pianoAudio, generateKeys, PianoKeyInfo, KEYBOARD_KEY_MAP } from '../utils/audio.js';
import { Volume2, VolumeX, Music, HelpCircle, Radio } from 'lucide-react';

interface PianoKeyboardProps {
  highlightKeys?: string[]; // e.g. ['C4', 'E4', 'G4']
  fingerGuides?: Record<string, number>; // e.g. { 'C4': 1, 'E4': 3, 'G4': 5 }
  onNotePlay?: (note: string) => void;
  startOctave?: number; // default 3
  endOctave?: number; // default 5
  interactive?: boolean;
  compact?: boolean;
  showLabels?: 'notes' | 'fingers' | 'keys' | 'none';
  customActiveNotes?: string[];
  heightClass?: string;
  id?: string;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  highlightKeys = [],
  fingerGuides = {},
  onNotePlay,
  startOctave = 3,
  endOctave = 5,
  interactive = true,
  compact = false,
  showLabels: initialShowLabels = 'notes',
  customActiveNotes = [],
  heightClass = 'h-48 md:h-56',
  id = 'piano-keyboard',
}) => {
  const [pressedNotes, setPressedNotes] = useState<Set<string>>(new Set());
  const [labelMode, setLabelMode] = useState<'notes' | 'fingers' | 'keys' | 'none'>(initialShowLabels);
  const [midiConnected, setMidiConnected] = useState<boolean>(false);
  const [lastPlayedNote, setLastPlayedNote] = useState<string | null>(null);

  const keys = useMemo(() => generateKeys(startOctave, endOctave), [startOctave, endOctave]);

  // Combine internally pressed notes with custom external active notes
  const activeNotesSet = useMemo(() => {
    const set = new Set(pressedNotes);
    customActiveNotes.forEach(n => set.add(n));
    return set;
  }, [pressedNotes, customActiveNotes]);

  const highlightSet = useMemo(() => new Set(highlightKeys), [highlightKeys]);

  const triggerNote = useCallback((note: string) => {
    if (!interactive) return;
    pianoAudio.playNote(note, 1.4, 0.85);
    setLastPlayedNote(note);
    setPressedNotes(prev => {
      const next = new Set(prev);
      next.add(note);
      return next;
    });

    if (onNotePlay) {
      onNotePlay(note);
    }

    setTimeout(() => {
      setPressedNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }, 280);
  }, [interactive, onNotePlay]);

  // Handle QWERTY keyboard shortcuts
  useEffect(() => {
    if (!interactive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      const key = e.key.toLowerCase();
      const mappedNote = KEYBOARD_KEY_MAP[key];
      if (mappedNote && !e.repeat) {
        triggerNote(mappedNote);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactive, triggerNote]);

  // MIDI input integration
  useEffect(() => {
    if (typeof navigator === 'undefined' || !(navigator as unknown as { requestMIDIAccess?: () => Promise<unknown> }).requestMIDIAccess) {
      return;
    }

    type MIDIMessageEvent = { data: Uint8Array };
    type MIDIInput = { onmidimessage: ((event: MIDIMessageEvent) => void) | null; name?: string };
    type MIDIAccess = { inputs: { values: () => IterableIterator<MIDIInput> } };

    let midiAccessObj: MIDIAccess | null = null;

    const notesNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const onMIDIMessage = (event: MIDIMessageEvent) => {
      const [status, noteNumber, velocity] = event.data;
      const command = status >> 4;
      if (command === 9 && velocity > 0) {
        // Note On
        const noteIndex = noteNumber % 12;
        const octave = Math.floor(noteNumber / 12) - 1;
        const noteName = `${notesNames[noteIndex]}${octave}`;
        triggerNote(noteName);
      }
    };

    const nav = navigator as unknown as { requestMIDIAccess: () => Promise<MIDIAccess> };
    nav.requestMIDIAccess()
      .then(access => {
        midiAccessObj = access;
        let count = 0;
        const inputs = access.inputs.values();
        for (const input of inputs) {
          input.onmidimessage = onMIDIMessage;
          count++;
        }
        if (count > 0) {
          setMidiConnected(true);
        }
      })
      .catch(() => {
        // MIDI access optional or denied
      });

    return () => {
      if (midiAccessObj) {
        const inputs = midiAccessObj.inputs.values();
        for (const input of inputs) {
          input.onmidimessage = null;
        }
      }
    };
  }, [triggerNote]);

  // Separate white and black keys for proper piano layout positioning
  const whiteKeys = keys.filter(k => !k.isBlack);

  return (
    <div id={id} className="flex flex-col items-center select-none w-full">
      {/* Keyboard Controls Bar */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-4xl px-2 py-1.5 mb-2 bg-stone-100 rounded-lg text-xs text-stone-600 border border-stone-200 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-800 flex items-center gap-1">
            <Music className="w-3.5 h-3.5 text-amber-700" />
            Virtual Piano
          </span>
          {lastPlayedNote && (
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold">
              {lastPlayedNote}
            </span>
          )}
          {midiConnected && (
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
              MIDI Connected
            </span>
          )}
        </div>

        {/* Labels Display Toggle */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-stone-200 shadow-2xs">
            <span className="px-1.5 text-stone-400 font-medium text-[10px] uppercase tracking-wider">Labels:</span>
            {(['notes', 'fingers', 'keys', 'none'] as const).map(mode => (
              <button
                key={mode}
                id={`label-mode-${mode}`}
                onClick={() => setLabelMode(mode)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  labelMode === mode
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {mode === 'notes' ? 'Notes' : mode === 'fingers' ? 'Fingers' : mode === 'keys' ? 'PC Keys' : 'Off'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Octave Quick Jump Bar */}
      <div className="flex md:hidden items-center justify-between w-full max-w-4xl px-2 py-1 mb-1 text-[11px] text-stone-500">
        <span className="italic">Swipe keys horizontally to play all 3 octaves:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const el = document.getElementById('key-C3');
              el?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
            }}
            className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 rounded font-bold text-stone-700 text-[10px]"
          >
            Octave 3
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('key-C4');
              el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }}
            className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 rounded font-bold text-amber-900 text-[10px]"
          >
            Middle C (Oct 4)
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('key-C5');
              el?.scrollIntoView({ behavior: 'smooth', inline: 'end', block: 'nearest' });
            }}
            className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 rounded font-bold text-stone-700 text-[10px]"
          >
            Octave 5
          </button>
        </div>
      </div>

      {/* Piano Bed Container */}
      <div className="relative w-full max-w-4xl bg-stone-900 p-2 sm:p-3 rounded-xl shadow-xl border-t-4 border-amber-900 overflow-hidden">
        {/* Wood grain strip top header */}
        <div className="h-3 w-full bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-t mb-1 border-b border-amber-950/60 shadow-inner flex items-center justify-center">
          <div className="w-16 h-0.5 bg-amber-400/30 rounded"></div>
        </div>

        {/* Piano Keys Wrapper with responsive horizontal touch scroll */}
        <div className="w-full overflow-x-auto overflow-y-hidden pb-1 scrollbar-thin scrollbar-thumb-stone-700">
          <div className={`relative flex justify-center min-w-[620px] sm:min-w-0 w-full ${heightClass} rounded-b`}>
            {whiteKeys.map((k) => {
              const isHighlighted = highlightSet.has(k.note);
              const isActive = activeNotesSet.has(k.note);
              const fingerNum = fingerGuides[k.note];

              return (
                <div
                  key={k.note}
                  id={`key-${k.note}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    triggerNote(k.note);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    triggerNote(k.note);
                  }}
                  className={`relative flex-1 min-w-[28px] max-w-[56px] h-full border-r border-stone-300 rounded-b-md cursor-pointer transition-all duration-75 flex flex-col justify-end items-center pb-2 touch-manipulation ${
                    isActive
                      ? 'bg-amber-200 border-amber-400 shadow-inner transform translate-y-0.5'
                      : isHighlighted
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-inset ring-amber-500/80 shadow-md'
                      : 'bg-white hover:bg-amber-50/50 shadow-sm active:bg-amber-100'
                  }`}
                >
                {/* Finger Guide Indicator */}
                {fingerNum !== undefined && (
                  <div className="absolute top-3 w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {fingerNum}
                  </div>
                )}

                {/* Highlight Indicator Pin */}
                {isHighlighted && !fingerNum && (
                  <div className="absolute top-2.5 w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse"></div>
                )}

                {/* Key Labels */}
                <div className="flex flex-col items-center pointer-events-none">
                  {labelMode === 'notes' && (
                    <span className={`text-xs font-bold ${isHighlighted ? 'text-amber-900' : 'text-stone-700'}`}>
                      {k.label}
                      <span className="text-[10px] font-normal text-stone-400 ml-0.5">{k.octave}</span>
                    </span>
                  )}
                  {labelMode === 'fingers' && fingerNum && (
                    <span className="text-xs font-extrabold text-amber-800">
                      Finger {fingerNum}
                    </span>
                  )}
                  {labelMode === 'keys' && k.keyboardShortcut && (
                    <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-600 px-1 py-0.5 rounded border border-stone-200">
                      {k.keyboardShortcut}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Black Keys Positioned Absolutely */}
          {keys.map((k) => {
            if (!k.isBlack) return null;
            const isHighlighted = highlightSet.has(k.note);
            const isActive = activeNotesSet.has(k.note);
            const fingerNum = fingerGuides[k.note];

            // Calculate horizontal offset relative to neighboring white keys
            const naturalPitch = k.label.replace('#', '');
            const whiteIndex = whiteKeys.findIndex(w => w.label === naturalPitch && w.octave === k.octave);
            if (whiteIndex === -1) return null;

            const totalWhite = whiteKeys.length;
            const leftPercent = ((whiteIndex + 1) / totalWhite) * 100;

            return (
              <div
                key={k.note}
                id={`black-key-${k.note}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerNote(k.note);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerNote(k.note);
                }}
                style={{
                  left: `calc(${leftPercent}% - 14px)`,
                  width: '28px',
                }}
                className={`absolute top-0 h-[62%] rounded-b-md z-20 cursor-pointer transition-all duration-75 flex flex-col justify-end items-center pb-2 border-x border-b border-black ${
                  isActive
                    ? 'bg-amber-500 border-amber-600 shadow-inner translate-y-0.5'
                    : isHighlighted
                    ? 'bg-amber-700 ring-2 ring-amber-400 shadow-lg'
                    : 'bg-gradient-to-b from-stone-800 to-stone-950 hover:from-stone-700 hover:to-stone-900 shadow-md'
                }`}
              >
                {/* Finger Guide for Black Key */}
                {fingerNum !== undefined && (
                  <div className="absolute top-2 w-5 h-5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                    {fingerNum}
                  </div>
                )}

                {/* Highlight Pin */}
                {isHighlighted && !fingerNum && (
                  <div className="absolute top-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                )}

                <div className="flex flex-col items-center pointer-events-none">
                  {labelMode === 'notes' && (
                    <span className="text-[10px] font-bold text-stone-200">
                      {k.label}
                    </span>
                  )}
                  {labelMode === 'keys' && k.keyboardShortcut && (
                    <span className="text-[9px] font-mono font-bold text-amber-200 bg-stone-800 px-1 rounded">
                      {k.keyboardShortcut}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

      {/* Shortcut hints banner */}
      <div className="mt-2 text-center text-xs text-stone-500 flex items-center gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
        <span>Click keys with your mouse or type using computer keys (Q for Middle C, W for D, E for E...)</span>
      </div>
    </div>
  );
};
