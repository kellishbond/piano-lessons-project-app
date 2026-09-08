import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Plus, Minus, Activity } from 'lucide-react';
import { pianoAudio } from '../utils/audio.js';

interface MetronomeProps {
  initialBpm?: number;
  onTick?: (beat: number) => void;
  id?: string;
}

export const Metronome: React.FC<MetronomeProps> = ({
  initialBpm = 60,
  onTick,
  id = 'metronome-widget'
}) => {
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const timerRef = useRef<number | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (60 / bpm) * 1000;
      timerRef.current = window.setInterval(() => {
        setCurrentBeat(prev => {
          const next = prev === 4 ? 1 : prev + 1;
          pianoAudio.playMetronomeTick(next === 1);
          if (onTick) onTick(next);
          return next;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, onTick]);

  const handleTap = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    taps.push(now);
    if (taps.length > 4) taps.shift();

    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 220) {
        setBpm(calculatedBpm);
      }
    }
  };

  return (
    <div id={id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-700" />
          <span className="font-bold text-stone-800 text-sm">Metronome</span>
        </div>
        <button
          id="tap-tempo-btn"
          onClick={handleTap}
          className="px-2 py-0.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded border border-stone-200 transition-colors"
        >
          Tap Tempo
        </button>
      </div>

      {/* BPM display & adjustments */}
      <div className="flex items-center justify-center gap-4 my-2">
        <button
          id="bpm-decrease-btn"
          onClick={() => setBpm(b => Math.max(40, b - 5))}
          className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
          aria-label="Decrease BPM"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-3xl font-extrabold text-stone-900 tracking-tight">{bpm}</span>
          <span className="text-xs text-stone-500 font-medium ml-1">BPM</span>
        </div>

        <button
          id="bpm-increase-btn"
          onClick={() => setBpm(b => Math.min(220, b + 5))}
          className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
          aria-label="Increase BPM"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Slider */}
      <input
        id="bpm-slider"
        type="range"
        min={40}
        max={200}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
        className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-800 my-2"
      />

      {/* 4-Beat visual dots */}
      <div className="flex items-center justify-center gap-3 my-2">
        {[1, 2, 3, 4].map((beat) => (
          <div
            key={beat}
            className={`w-3 h-3 rounded-full transition-all duration-100 ${
              isPlaying && currentBeat === beat
                ? beat === 1
                  ? 'bg-amber-600 scale-125 ring-2 ring-amber-300'
                  : 'bg-amber-800 scale-110'
                : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      {/* Start / Stop */}
      <button
        id="metronome-toggle-btn"
        onClick={() => setIsPlaying(!isPlaying)}
        className={`mt-2 w-full py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition ${
          isPlaying
            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
            : 'bg-amber-800 text-white hover:bg-amber-900 shadow-sm'
        }`}
      >
        {isPlaying ? (
          <>
            <Square className="w-4 h-4 fill-current" />
            Stop Metronome
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            Start Metronome
          </>
        )}
      </button>
    </div>
  );
};
