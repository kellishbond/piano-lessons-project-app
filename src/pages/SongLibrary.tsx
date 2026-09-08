import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Song } from '../types.js';
import { PianoKeyboard } from '../components/PianoKeyboard.js';
import { pianoAudio } from '../utils/audio.js';
import confetti from 'canvas-confetti';
import {
  Music,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Gauge,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const SongLibrary: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [activeBpm, setActiveBpm] = useState<number>(75);
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);
  const [activeDemonstrationNote, setActiveDemonstrationNote] = useState<string | null>(null);

  // Interactive play-along state
  const [playAlongIndex, setPlayAlongIndex] = useState<number>(0);
  const [isPlayAlongActive, setIsPlayAlongActive] = useState<boolean>(false);
  const [songFinished, setSongFinished] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSongs();
        setSongs(data);
        if (data.length > 0) {
          setSelectedSong(data[0]);
          setActiveBpm(data[0].bpm);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // Demo playback
  const handlePlayDemo = () => {
    if (!selectedSong || isPlayingDemo) return;
    setIsPlayingDemo(true);
    setIsPlayAlongActive(false);

    const notes = selectedSong.notes;
    const beatDurationMs = (60 / activeBpm) * 1000;

    notes.forEach((item, idx) => {
      setTimeout(() => {
        pianoAudio.playNote(item.note, item.duration * 1.2, 0.85);
        setActiveDemonstrationNote(item.note);

        if (idx === notes.length - 1) {
          setTimeout(() => {
            setIsPlayingDemo(false);
            setActiveDemonstrationNote(null);
          }, item.duration * beatDurationMs);
        }
      }, item.time * beatDurationMs);
    });
  };

  // Play-Along note handling
  const handlePlayAlongKey = (note: string) => {
    if (!selectedSong || !isPlayAlongActive || songFinished) return;

    const currentExpected = selectedSong.notes[playAlongIndex]?.note;
    if (note === currentExpected) {
      // Advance to next note
      if (playAlongIndex + 1 < selectedSong.notes.length) {
        setPlayAlongIndex(i => i + 1);
      } else {
        setSongFinished(true);
        pianoAudio.playSuccessChime();
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      }
    }
  };

  const handleStartPlayAlong = () => {
    setIsPlayingDemo(false);
    setIsPlayAlongActive(true);
    setPlayAlongIndex(0);
    setSongFinished(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Music className="w-3.5 h-3.5 text-amber-700" />
          Repertoire & Pieces
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          Song Learning System
        </h1>
        <p className="text-stone-600 text-sm mt-1">
          Play real musical masterpieces. Adjust your tempo gradually from slow practice to performance speed.
        </p>

        {/* Song Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-stone-100">
          {songs.map((song) => (
            <button
              key={song.id}
              id={`song-select-${song.id}`}
              onClick={() => {
                setSelectedSong(song);
                setActiveBpm(song.bpm);
                setIsPlayingDemo(false);
                setIsPlayAlongActive(false);
                setPlayAlongIndex(0);
                setSongFinished(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition whitespace-nowrap ${
                selectedSong?.id === song.id
                  ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              {song.title}
            </button>
          ))}
        </div>
      </div>

      {selectedSong && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          {/* Active Song Info Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <span>{selectedSong.composer || 'Traditional'}</span>
                <span>•</span>
                <span className="bg-amber-50 px-2 py-0.5 rounded text-amber-900">
                  {selectedSong.difficulty}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
                {selectedSong.title}
              </h2>
              <p className="text-stone-600 text-xs mt-1">{selectedSong.description}</p>
            </div>

            {/* Tempo Selector (50, 75, 100 BPM) */}
            <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200 self-start md:self-auto">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-700" />
                Tempo:
              </span>
              {selectedSong.practiceBpmOptions.map((bpmOpt) => (
                <button
                  key={bpmOpt}
                  id={`bpm-opt-${bpmOpt}`}
                  onClick={() => setActiveBpm(bpmOpt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    activeBpm === bpmOpt
                      ? 'bg-amber-800 text-white shadow-2xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {bpmOpt} BPM
                </button>
              ))}
            </div>
          </div>

          {/* Required Skills Checklist */}
          <div>
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Prerequisite Skills:
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {selectedSong.requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-full flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Demonstration & Interactive Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="song-listen-demo-btn"
              onClick={handlePlayDemo}
              disabled={isPlayingDemo}
              className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm flex items-center gap-2 transition shadow-2xs disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-current" />
              {isPlayingDemo ? 'Demonstrating...' : 'Listen to Demonstration'}
            </button>

            <button
              id="song-start-playalong-btn"
              onClick={handleStartPlayAlong}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border transition ${
                isPlayAlongActive
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              {isPlayAlongActive ? 'Play-Along Active' : 'Start Interactive Play-Along'}
            </button>
          </div>

          {/* Visual Note Strip / Score */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              <span>Melodic Note Sequence</span>
              {isPlayAlongActive && (
                <span className="text-amber-800">
                  Note {playAlongIndex + 1} of {selectedSong.notes.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {selectedSong.notes.map((item, idx) => {
                const isCurrentInPlayAlong = isPlayAlongActive && idx === playAlongIndex;
                const wasPassedInPlayAlong = isPlayAlongActive && idx < playAlongIndex;
                const isCurrentInDemo = isPlayingDemo && item.note === activeDemonstrationNote;

                return (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-xl font-mono font-bold text-sm border shrink-0 transition ${
                      isCurrentInPlayAlong
                        ? 'bg-amber-500 text-white border-amber-600 scale-110 shadow-md ring-2 ring-amber-300'
                        : wasPassedInPlayAlong
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : isCurrentInDemo
                        ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                        : 'bg-white text-stone-800 border-stone-200'
                    }`}
                  >
                    <div>{item.note}</div>
                  </div>
                );
              })}
            </div>

            {songFinished && (
              <div className="mt-3 p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-300 font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Song completed! Excellent finger control and rhythm.
              </div>
            )}
          </div>

          {/* Interactive Keyboard */}
          <div>
            <PianoKeyboard
              onNotePlay={handlePlayAlongKey}
              customActiveNotes={
                activeDemonstrationNote
                  ? [activeDemonstrationNote]
                  : isPlayAlongActive
                  ? [selectedSong.notes[playAlongIndex]?.note]
                  : []
              }
              interactive={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
