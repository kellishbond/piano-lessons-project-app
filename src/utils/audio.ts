// Realistic Web Audio Piano Synthesizer

class PianoAudioEngine {
  private ctx: AudioContext | null = null;
  private activeVoices: Map<string, { oscs: OscillatorNode[]; gain: GainNode }> = new Map();
  private isMuted: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Convert note name (e.g. "C4", "F#4", "Bb3") to frequency in Hz
  public noteToFreq(note: string): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const regex = /^([A-G][#b]?)([0-8])$/;
    const match = note.match(regex);
    if (!match) return 440;

    let [, pitch, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);

    // Normalize flats to sharps
    const flatMap: Record<string, string> = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    if (flatMap[pitch]) pitch = flatMap[pitch];

    const noteIndex = notes.indexOf(pitch);
    if (noteIndex === -1) return 440;

    // A4 is 440 Hz, MIDI note 69 (A4: octave 4, note index 9)
    const midiNumber = (octave + 1) * 12 + noteIndex;
    return 440 * Math.pow(2, (midiNumber - 69) / 12);
  }

  public playNote(note: string, durationSeconds: number = 1.6, velocity: number = 0.8): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const freq = this.noteToFreq(note);
      const now = ctx.currentTime;

      // Stop previous voice of same note if currently ringing
      this.stopNote(note);

      // Create primary oscillator (fundamental tone)
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);

      // Create secondary oscillator (warm overtone)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now); // 2nd harmonic

      // Third oscillator (sparkle/presence)
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 3, now); // 3rd harmonic

      // Attack transient (felt hammer thump)
      const oscThump = ctx.createOscillator();
      oscThump.type = 'sine';
      oscThump.frequency.setValueAtTime(freq * 0.5, now);

      // Gain envelopes
      const masterGain = ctx.createGain();
      const osc2Gain = ctx.createGain();
      const osc3Gain = ctx.createGain();
      const thumpGain = ctx.createGain();

      osc2Gain.gain.setValueAtTime(0.28, now);
      osc3Gain.gain.setValueAtTime(0.08, now);
      thumpGain.gain.setValueAtTime(0.18, now);

      // Main ADSR envelope: Fast attack, exponential decay for realistic acoustic piano
      masterGain.gain.setValueAtTime(0.0001, now);
      // Attack: 0.005s to peak velocity
      masterGain.gain.linearRampToValueAtTime(velocity, now + 0.006);
      // Initial decay to warm sustain
      masterGain.gain.exponentialRampToValueAtTime(velocity * 0.55, now + 0.18);
      // Gentle natural string ring-out decay
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

      // Quick decay for hammer transient
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      // Connections
      osc1.connect(masterGain);
      osc2.connect(osc2Gain);
      osc2Gain.connect(masterGain);
      osc3.connect(osc3Gain);
      osc3Gain.connect(masterGain);
      oscThump.connect(thumpGain);
      thumpGain.connect(masterGain);

      // Low-pass filter for piano warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(freq * 6, 8000), now);
      filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 2, 2500), now + durationSeconds);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      oscThump.start(now);

      const stopTime = now + durationSeconds;
      osc1.stop(stopTime);
      osc2.stop(stopTime);
      osc3.stop(stopTime);
      oscThump.stop(stopTime);

      this.activeVoices.set(note, {
        oscs: [osc1, osc2, osc3, oscThump],
        gain: masterGain
      });

      // Cleanup
      setTimeout(() => {
        if (this.activeVoices.get(note)?.gain === masterGain) {
          this.activeVoices.delete(note);
        }
      }, durationSeconds * 1000);

    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  public stopNote(note: string): void {
    const voice = this.activeVoices.get(note);
    if (voice && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        voice.gain.gain.cancelScheduledValues(now);
        voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
        voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        setTimeout(() => {
          voice.oscs.forEach(o => {
            try { o.stop(); } catch {}
          });
        }, 80);
      } catch {}
      this.activeVoices.delete(note);
    }
  }

  public playSuccessChime(): void {
    const notes = ['C5', 'E5', 'G5', 'C6'];
    notes.forEach((note, idx) => {
      setTimeout(() => {
        this.playNote(note, 0.8, 0.6);
      }, idx * 90);
    });
  }

  public playErrorChime(): void {
    const notes = ['Eb4', 'D4'];
    notes.forEach((note, idx) => {
      setTimeout(() => {
        this.playNote(note, 0.5, 0.4);
      }, idx * 120);
    });
  }

  public playMetronomeTick(isAccent: boolean = false): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 1400 : 900, now);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const pianoAudio = new PianoAudioEngine();

// Piano Key mapping for QWERTY keyboard
export const KEYBOARD_KEY_MAP: Record<string, string> = {
  // Lower octave (C3 to B3)
  'z': 'C3',
  's': 'C#3',
  'x': 'D3',
  'd': 'D#3',
  'c': 'E3',
  'v': 'F3',
  'g': 'F#3',
  'b': 'G3',
  'h': 'G#3',
  'n': 'A3',
  'j': 'A#3',
  'm': 'B3',

  // Middle octave (C4 to B4) - Most prominent
  'q': 'C4',
  '2': 'C#4',
  'w': 'D4',
  '3': 'D#4',
  'e': 'E4',
  'r': 'F4',
  '5': 'F#4',
  't': 'G4',
  '6': 'G#4',
  'y': 'A4',
  '7': 'A#4',
  'u': 'B4',

  // High octave (C5 to E5)
  'i': 'C5',
  '9': 'C#5',
  'o': 'D5',
  '0': 'D#5',
  'p': 'E5',
  '[': 'F5',
  '=': 'F#5',
  ']': 'G5',
};

// Standard notes definition for 2-3 octaves
export interface PianoKeyInfo {
  note: string;
  isBlack: boolean;
  label: string;
  octave: number;
  keyboardShortcut?: string;
}

export function generateKeys(startOctave: number = 3, endOctave: number = 5): PianoKeyInfo[] {
  const notesOrder = [
    { pitch: 'C', isBlack: false },
    { pitch: 'C#', isBlack: true },
    { pitch: 'D', isBlack: false },
    { pitch: 'D#', isBlack: true },
    { pitch: 'E', isBlack: false },
    { pitch: 'F', isBlack: false },
    { pitch: 'F#', isBlack: true },
    { pitch: 'G', isBlack: false },
    { pitch: 'G#', isBlack: true },
    { pitch: 'A', isBlack: false },
    { pitch: 'A#', isBlack: true },
    { pitch: 'B', isBlack: false },
  ];

  // Inverted map for shortcuts
  const noteToShortcut: Record<string, string> = {};
  Object.entries(KEYBOARD_KEY_MAP).forEach(([key, note]) => {
    noteToShortcut[note] = key.toUpperCase();
  });

  const keys: PianoKeyInfo[] = [];

  for (let oct = startOctave; oct <= endOctave; oct++) {
    for (const item of notesOrder) {
      const note = `${item.pitch}${oct}`;
      // Stop after C5 or E5 depending on range
      if (oct === endOctave && item.pitch === 'C') {
        keys.push({
          note,
          isBlack: item.isBlack,
          label: item.pitch,
          octave: oct,
          keyboardShortcut: noteToShortcut[note],
        });
        break;
      }
      keys.push({
        note,
        isBlack: item.isBlack,
        label: item.pitch,
        octave: oct,
        keyboardShortcut: noteToShortcut[note],
      });
    }
  }

  return keys;
}
