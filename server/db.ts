import {
  User,
  StudentProfile,
  Course,
  Module,
  Lesson,
  Exercise,
  Assignment,
  PracticeSession,
  LessonProgress,
  InstructorFeedback,
  Achievement,
  Song
} from '../src/types.js';

class InMemoryDatabase {
  public users: User[] = [];
  public studentProfiles: Map<string, StudentProfile> = new Map();
  public courses: Course[] = [];
  public modules: Module[] = [];
  public lessons: Lesson[] = [];
  public exercises: Exercise[] = [];
  public assignments: Assignment[] = [];
  public practiceSessions: PracticeSession[] = [];
  public lessonProgress: LessonProgress[] = [];
  public feedback: InstructorFeedback[] = [];
  public achievements: Achievement[] = [];
  public songs: Song[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Users: Only Instructor Kellish (no demo students)
    const instructor: User = {
      id: 'inst-kellish',
      name: 'Kellish',
      email: 'kellish@pianolearning.edu',
      username: 'Kellish',
      password: 'piano',
      role: 'INSTRUCTOR',
      avatar: '🎹',
      bio: 'Master Piano Instructor & Studio Director',
      createdAt: '2026-03-01T00:00:00Z',
    };

    this.users = [instructor];

    // 2. Student Profiles: Clean slate, registered students create their own
    this.studentProfiles = new Map();

    // 3. Course
    const mainCourse: Course = {
      id: 'course-1',
      title: 'Beginner Piano: The Classical & Modern Journey',
      description: 'A complete foundational curriculum taking young pianists from basic keyboard orientation to two-handed repertoire.',
      level: 'Beginner',
      modules: ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'mod-6', 'mod-7', 'mod-8', 'mod-9', 'mod-10'],
    };
    this.courses = [mainCourse];

    // 4. Modules
    this.modules = [
      {
        id: 'mod-1',
        courseId: 'course-1',
        title: 'Module 1 — Getting Started',
        description: 'Proper posture, hand shape, and keyboard seating.',
        order: 1,
        lessons: ['les-1-1'],
      },
      {
        id: 'mod-2',
        courseId: 'course-1',
        title: 'Module 2 — Understanding the Keyboard',
        description: 'Black keys, white keys, groups of 2 and 3, and Middle C.',
        order: 2,
        lessons: ['les-2-1', 'les-2-2'],
      },
      {
        id: 'mod-3',
        courseId: 'course-1',
        title: 'Module 3 — Finger Numbers',
        description: 'Fingers 1 to 5, curved hands, and relaxed wrists.',
        order: 3,
        lessons: ['les-3-1'],
      },
      {
        id: 'mod-4',
        courseId: 'course-1',
        title: 'Module 4 — Basic Notes',
        description: 'The Musical Alphabet: C, D, E, F, G, A, B on the keyboard.',
        order: 4,
        lessons: ['les-4-1', 'les-4-2'],
      },
      {
        id: 'mod-5',
        courseId: 'course-1',
        title: 'Module 5 — Scales',
        description: 'The C Major 5-finger pattern and the one-octave scale.',
        order: 5,
        lessons: ['les-5-1'],
      },
      {
        id: 'mod-6',
        courseId: 'course-1',
        title: 'Module 6 — Chords',
        description: 'Triads, root notes, the C Major and G Major chords.',
        order: 6,
        lessons: ['les-6-1'],
      },
      {
        id: 'mod-7',
        courseId: 'course-1',
        title: 'Module 7 — Rhythm & Meter',
        description: 'Quarter notes, half notes, whole notes, and 4/4 time.',
        order: 7,
        lessons: ['les-7-1'],
      },
      {
        id: 'mod-8',
        courseId: 'course-1',
        title: 'Module 8 — Simple Songs',
        description: 'Putting it all together with Ode to Joy and Amazing Grace.',
        order: 8,
        lessons: ['les-8-1'],
      },
      {
        id: 'mod-9',
        courseId: 'course-1',
        title: 'Module 9 — Playing With Both Hands',
        description: 'Coordinating left hand chord foundations with right hand melody.',
        order: 9,
        lessons: ['les-9-1'],
      },
      {
        id: 'mod-10',
        courseId: 'course-1',
        title: 'Module 10 — Advanced Beginner Skills',
        description: 'Dynamic expression (piano, forte) and tempo phrasing.',
        order: 10,
        lessons: ['les-10-1'],
      },
    ];

    // 5. Lessons with exact 8-section structure
    this.lessons = [
      {
        id: 'les-1-1',
        moduleId: 'mod-1',
        title: 'Piano Posture & Relaxed Hands',
        description: 'Sit tall like a royal pianist with naturally curved fingers holding an imaginary bubble.',
        order: 1,
        difficulty: 'Beginner',
        sections: {
          learn: {
            heading: 'The Secret to Effortless Piano Playing',
            text: 'Before we play our first key, good posture gives our fingers freedom to move without getting tired. Sit upright with your feet flat on the floor, and curve your fingers gently as if you are holding a fragile, lovely bubble.',
            keyPoints: [
              'Sit on the front half of the piano bench with feet grounded.',
              'Keep your wrists level with the keyboard—never dropping below the keys.',
              'Fingers must be arched softly like a dome, touching keys with fingertips.'
            ]
          },
          watch: {
            title: 'Hand Arch & Posture Animation',
            description: 'Observe how the wrists stay supple while the fingers maintain a natural bridge over the keys.',
            animationType: 'keyboard_hand',
            handPositionHint: 'Arched fingers with thumb playing on its outer edge.',
          },
          listen: {
            title: 'Tone Quality Demonstration',
            description: 'Hear the difference between a firm curved finger strike versus a flat collapse.',
            notesToPlay: ['C4', 'E4', 'G4'],
            bpm: 60,
          },
          see: {
            title: 'Home Position Setup',
            highlightKeys: ['C4'],
            fingerGuides: { 'C4': 1 },
            description: 'Place your right-hand thumb gently over Middle C (C4).',
          },
          practice: {
            instructions: 'Strike Middle C four times with a steady pulse using your thumb (finger 1).',
            targetNotes: ['C4', 'C4', 'C4', 'C4'],
            tempoBpm: 60,
          },
          testYourself: {
            exerciseId: 'ex-posture-1',
          },
          assignment: {
            task: 'Physical posture drill at the piano bench.',
            recommendedMinutes: 5,
            checkpoints: [
              'Adjust bench height so forearms are parallel to the floor.',
              'Hold an imaginary bubble for 30 seconds without collapsing fingers.',
              'Play 10 gentle notes with relaxed breathing.'
            ]
          }
        }
      },
      {
        id: 'les-2-1',
        moduleId: 'mod-2',
        title: 'Finding Middle C & The 2-Black-Key Group',
        description: 'Learn the landmark note Middle C by identifying the friendly pair of black keys.',
        order: 1,
        difficulty: 'Beginner',
        sections: {
          learn: {
            heading: 'The Black Key Landmark Rule',
            text: 'Notice that black keys come in repeating groups of TWO and THREE. Middle C is the white key sitting directly to the left of the group of two black keys right in the center of your piano!',
            keyPoints: [
              'Find the two black keys in the center of your keyboard.',
              'Slide your finger down to the white key immediately to their left: that is C!',
              'Middle C (C4) is the musical home base where most beginner pieces begin.'
            ]
          },
          watch: {
            title: 'Black Key Pairs Landmark Guide',
            description: 'Watch the two black keys illuminate and discover how C hugs their left shoulder.',
            animationType: 'keyboard_hand',
            handPositionHint: 'Two black keys: C# and D#. The white key to their left is C.',
          },
          listen: {
            title: 'Middle C Pitch Check',
            description: 'Listen carefully to Middle C (261.63 Hz). It is the reference pitch for both hands.',
            notesToPlay: ['C4'],
            bpm: 60,
          },
          see: {
            title: 'Visual Key Highlight: Middle C',
            highlightKeys: ['C4', 'C#4', 'D#4'],
            fingerGuides: { 'C4': 1 },
            description: 'Middle C is the white key highlighted in amber next to the two black keys.',
          },
          practice: {
            instructions: 'Find and play Middle C (C4) on the virtual piano three times.',
            targetNotes: ['C4', 'C4', 'C4'],
            tempoBpm: 60,
          },
          testYourself: {
            exerciseId: 'ex-find-c',
          },
          assignment: {
            task: 'Find all C notes across your entire keyboard.',
            recommendedMinutes: 10,
            checkpoints: [
              'Locate Middle C with eyes closed after touching the two black keys.',
              'Find a lower C (C3) and a higher C (C5).',
              'Practice finding C with both right and left hands.'
            ]
          }
        }
      },
      {
        id: 'les-3-1',
        moduleId: 'mod-3',
        title: 'Finger Numbers: 1 to 5',
        description: 'Master the universal piano fingering system: Thumb is 1, Pinky is 5.',
        order: 1,
        difficulty: 'Beginner',
        sections: {
          learn: {
            heading: 'The Universal Piano Hand Code',
            text: 'In piano music, small numbers above or below notes tell you which finger to use! Both hands use the exact same numbering: Thumb is 1, Index is 2, Middle is 3, Ring is 4, and Pinky is 5.',
            keyPoints: [
              '1 = Thumb (strong and agile)',
              '2 = Index (quick pointer)',
              '3 = Middle (the tall anchor)',
              '4 = Ring (needs patience and curved support)',
              '5 = Pinky (the sturdy end post)'
            ]
          },
          watch: {
            title: 'Finger Number Mapping',
            description: 'See the numbers 1, 2, 3, 4, 5 light up over the right hand 5-finger pattern.',
            animationType: 'keyboard_hand',
            handPositionHint: 'C4=1, D4=2, E4=3, F4=4, G4=5.',
          },
          listen: {
            title: '5-Note Ascending March',
            description: 'Listen to the right hand 5-finger march: 1, 2, 3, 4, 5 (C, D, E, F, G).',
            notesToPlay: ['C4', 'D4', 'E4', 'F4', 'G4'],
            bpm: 70,
          },
          see: {
            title: '5-Finger Right Hand Position',
            highlightKeys: ['C4', 'D4', 'E4', 'F4', 'G4'],
            fingerGuides: { 'C4': 1, 'D4': 2, 'E4': 3, 'F4': 4, 'G4': 5 },
            description: 'Rest one finger over each consecutive white key starting on C.',
          },
          practice: {
            instructions: 'Play fingers 1, 2, 3, 4, 5 in order on the keys C4, D4, E4, F4, G4.',
            targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
            tempoBpm: 60,
          },
          testYourself: {
            exerciseId: 'ex-finger-numbers',
          },
          assignment: {
            task: 'Air piano finger tapping.',
            recommendedMinutes: 8,
            checkpoints: [
              'Tap fingers on a tabletop calling out their numbers: 1-2-3-4-5.',
              'Reverse: 5-4-3-2-1 with steady rhythm.',
              'Keep the ring finger (4) lifted cleanly without collapsing.'
            ]
          }
        }
      },
      {
        id: 'les-4-1',
        moduleId: 'mod-4',
        title: 'The Musical Alphabet: C, D, E',
        description: 'Unlock the first three musical notes: C, D, and E.',
        order: 1,
        difficulty: 'Beginner',
        sections: {
          learn: {
            heading: 'Meeting C, D, and E',
            text: 'Music uses only 7 letters: A, B, C, D, E, F, G! We start on C. D sits right in the middle between the two black keys (think "D is in the Doorway"). E sits on the right side of the two black keys.',
            keyPoints: [
              'C is to the left of the two black keys.',
              'D is right between the two black keys.',
              'E is to the right of the two black keys.',
              'Together they form the foundation of our first melodies.'
            ]
          },
          watch: {
            title: 'C-D-E Landmark Explorer',
            description: 'Observe the three white keys surrounding the two black keys.',
            animationType: 'keyboard_hand',
          },
          listen: {
            title: 'Melody: Hot Cross Buns Pattern',
            description: 'Hear E-D-C, the famous opening phrase!',
            notesToPlay: ['E4', 'D4', 'C4'],
            bpm: 75,
          },
          see: {
            title: 'Keyboard View: C - D - E',
            highlightKeys: ['C4', 'D4', 'E4'],
            fingerGuides: { 'C4': 1, 'D4': 2, 'E4': 3 },
            description: 'Use fingers 1 (Thumb), 2 (Index), and 3 (Middle).',
          },
          practice: {
            instructions: 'Play C4, then D4, then E4, and back down to C4.',
            targetNotes: ['C4', 'D4', 'E4', 'C4'],
            tempoBpm: 60,
          },
          testYourself: {
            exerciseId: 'ex-follow-cde',
          },
          assignment: {
            task: 'Play the 3-note chime.',
            recommendedMinutes: 10,
            checkpoints: [
              'Play C-D-E forward 5 times smoothly.',
              'Play E-D-C backward 5 times smoothly.',
              'Memorize where D sits inside the two black keys.'
            ]
          }
        }
      },
      {
        id: 'les-5-1',
        moduleId: 'mod-5',
        title: 'C Major Scale & The Five-Finger Pattern',
        description: 'Explore the full C Major five-finger scale and prepare for the one-octave scale.',
        order: 1,
        difficulty: 'Beginner',
        sections: {
          learn: {
            heading: 'Building The Bright Major Sound',
            text: 'The C Major scale is the most famous scale in all piano music because it uses all white keys! In this lesson, we practice the 5-finger scale: C, D, E, F, G, ascending and descending with uniform tone.',
            keyPoints: [
              'The notes are C, D, E, F, G.',
              'Each finger is assigned one key: 1-2-3-4-5.',
              'Release each key smoothly just as the next note sounds (legato).'
            ]
          },
          watch: {
            title: 'Scale Run Demonstration',
            description: 'Watch the animated hand glide cleanly from C4 up to G4 and back down.',
            animationType: 'scale_run',
          },
          listen: {
            title: 'Ascending and Descending C Scale',
            description: 'Listen to the bright, cheerful C Major scale pattern.',
            notesToPlay: ['C4', 'D4', 'E4', 'F4', 'G4', 'F4', 'E4', 'D4', 'C4'],
            bpm: 80,
          },
          see: {
            title: 'Five Keys Highlighted',
            highlightKeys: ['C4', 'D4', 'E4', 'F4', 'G4'],
            fingerGuides: { 'C4': 1, 'D4': 2, 'E4': 3, 'F4': 4, 'G4': 5 },
            description: 'Notice the whole-whole-half-whole interval spacing.',
          },
          practice: {
            instructions: 'Play C4 → D4 → E4 → F4 → G4 on the virtual keyboard.',
            targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
            tempoBpm: 70,
          },
          testYourself: {
            exerciseId: 'ex-c-scale',
          },
          assignment: {
            task: 'Practice C Major Scale with steady tempo.',
            recommendedMinutes: 10,
            checkpoints: [
              'Play the 5-note scale 5 times in a row without stopping.',
              'Keep the tempo steady at 60-70 BPM.',
              'Listen for equal volume from all 5 fingers.'
            ]
          }
        }
      },
      {
        id: 'les-6-1',
        moduleId: 'mod-6',
        title: 'Introduction to C Major Chord',
        description: 'Learn how to harmonize notes together into the rich, joyful C Major Triad.',
        order: 1,
        difficulty: 'Beginner',
        sections: {
          learn: {
            heading: 'What is a Chord?',
            text: 'A chord is when three or more different musical notes are played together at the exact same time! The C Major chord (C - E - G) is built from the 1st, 3rd, and 5th notes of the C scale. We use fingers 1, 3, and 5 to play it.',
            keyPoints: [
              'C = Root note (anchor, finger 1)',
              'E = Third (gives the happy major color, finger 3)',
              'G = Fifth (adds fullness, finger 5)',
              'Skip D and F! We play note-skip-note-skip-note.'
            ]
          },
          watch: {
            title: 'Chord Triad Builder',
            description: 'Watch the three notes C, E, and G illuminate simultaneously under fingers 1, 3, and 5.',
            animationType: 'chord_builder',
            handPositionHint: 'Hand remains arched, fingers 2 and 4 hover relaxed above their keys.',
          },
          listen: {
            title: 'Broken and Blocked C Major Chord',
            description: 'First hear the notes individually (arpeggiated), then struck together as a full block chord.',
            notesToPlay: ['C4', 'E4', 'G4'],
            bpm: 65,
          },
          see: {
            title: 'C - E - G Chord Shape',
            highlightKeys: ['C4', 'E4', 'G4'],
            fingerGuides: { 'C4': 1, 'E4': 3, 'G4': 5 },
            description: 'Three white keys with one key skipped between each: C [skip D] E [skip F] G.',
          },
          practice: {
            instructions: 'Play the notes of the C Major chord: C4, E4, and G4.',
            targetNotes: ['C4', 'E4', 'G4'],
            tempoBpm: 60,
          },
          testYourself: {
            exerciseId: 'ex-chord-c-major',
          },
          assignment: {
            task: 'Practice C Major Chord firmness.',
            recommendedMinutes: 10,
            checkpoints: [
              'Press C, E, and G together 10 times with firm fingertips.',
              'Release cleanly without letting finger 2 or 4 accidentally touch.',
              'Try playing the chord quietly, then with a bold forte sound.'
            ]
          }
        }
      },
      {
        id: 'les-7-1',
        moduleId: 'mod-7',
        title: 'Rhythm: Quarter & Half Notes',
        description: 'Understand musical time, metronome counting, and note durations.',
        order: 1,
        difficulty: 'Beginner',
        sections: {
          learn: {
            heading: 'Counting The Heartbeat of Music',
            text: 'Music lives in time! Just like our heart beats at a steady tempo, music has a regular pulse. A Quarter Note gets 1 beat (count "1"). A Half Note gets 2 beats (count "1 - 2"). A Whole Note gets 4 beats (count "1 - 2 - 3 - 4").',
            keyPoints: [
              'Quarter Note (♩) = 1 beat (steady step)',
              'Half Note (𝅗𝅥) = 2 beats (hold and listen)',
              'Whole Note (𝅝) = 4 beats (full measure)',
              'Always keep your foot tapping softly to the metronome.'
            ]
          },
          watch: {
            title: 'Visual Metronome & Beat Meter',
            description: 'Follow the 4-beat visual pendulum swinging in 4/4 time.',
            animationType: 'rhythm_meter',
          },
          listen: {
            title: 'Steady Quarter Note Pulse',
            description: 'Listen to four quarter notes on Middle C played exactly on each metronome click.',
            notesToPlay: ['C4', 'C4', 'C4', 'C4'],
            bpm: 60,
          },
          see: {
            title: 'Middle C with Beat Counters',
            highlightKeys: ['C4'],
            fingerGuides: { 'C4': 1 },
            description: 'Middle C played on beat 1, 2, 3, and 4.',
          },
          practice: {
            instructions: 'Play C4 along with the rhythm prompt.',
            targetNotes: ['C4', 'C4', 'C4', 'C4'],
            tempoBpm: 60,
          },
          testYourself: {
            exerciseId: 'ex-rhythm-1',
          },
          assignment: {
            task: 'Clap and count aloud.',
            recommendedMinutes: 8,
            checkpoints: [
              'Clap 4 steady quarter notes: "1, 2, 3, 4".',
              'Clap 2 half notes: "1-2, 3-4".',
              'Play C4 at 60 BPM with the virtual metronome.'
            ]
          }
        }
      },
      {
        id: 'les-8-1',
        moduleId: 'mod-8',
        title: 'Your First Song: Ode to Joy Theme',
        description: 'Play Ludwig van Beethoven famous timeless melody using the 5-finger right hand position!',
        order: 1,
        difficulty: 'Beginner',
        sections: {
          learn: {
            heading: 'Playing Classical Masterpieces',
            text: 'You now possess all the tools needed to play Beethoven legendary Ode to Joy! The opening melody stays right inside the 5-finger pattern you already know: E - E - F - G - G - F - E - D - C - C - D - E - E - D - D.',
            keyPoints: [
              'Start on finger 3 (E4).',
              'Step up to 4 (F4) and 5 (G4).',
              'Step down to 1 (C4).',
              'Keep the tempo steady and celebrate your progress!'
            ]
          },
          watch: {
            title: 'Ode to Joy Phrase Guide',
            description: 'Watch the step-by-step fingering sequence illuminate across the keyboard.',
            animationType: 'scale_run',
          },
          listen: {
            title: 'Ode to Joy Master Demonstration',
            description: 'Listen to the full opening theme played at 75 BPM.',
            notesToPlay: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4'],
            bpm: 75,
          },
          see: {
            title: 'The 5 Keys of Ode to Joy',
            highlightKeys: ['C4', 'D4', 'E4', 'F4', 'G4'],
            fingerGuides: { 'C4': 1, 'D4': 2, 'E4': 3, 'F4': 4, 'G4': 5 },
            description: 'Your right hand rests comfortably in C position.',
          },
          practice: {
            instructions: 'Play the first phrase of Ode to Joy: E4 → E4 → F4 → G4.',
            targetNotes: ['E4', 'E4', 'F4', 'G4'],
            tempoBpm: 75,
          },
          testYourself: {
            exerciseId: 'ex-ode-phrase',
          },
          assignment: {
            task: 'Perform Ode to Joy for a family member or teacher.',
            recommendedMinutes: 15,
            checkpoints: [
              'Play through the opening phrase without stopping.',
              'Maintain relaxed wrists throughout.',
              'Record a practice session in the application.'
            ]
          }
        }
      },
    ];

    // 6. Exercises
    this.exercises = [
      {
        id: 'ex-posture-1',
        lessonId: 'les-1-1',
        type: 'FIND_NOTE',
        title: 'Find Middle C',
        question: 'Click Middle C on the virtual piano keyboard.',
        correctAnswer: 'C4',
        targetKeys: ['C4'],
        explanation: 'Middle C (C4) sits directly to the left of the pair of two black keys near the center of the keyboard.',
      },
      {
        id: 'ex-find-c',
        lessonId: 'les-2-1',
        type: 'FIND_NOTE',
        title: 'Find Middle C',
        question: 'Find Middle C! The keyboard has no hints illuminated—rely on the two black keys.',
        correctAnswer: 'C4',
        targetKeys: ['C4'],
        explanation: 'Correct! 🎉 Middle C is the white key hugging the left side of the two black keys.',
      },
      {
        id: 'ex-finger-numbers',
        lessonId: 'les-3-1',
        type: 'CHORD_IDENTIFICATION',
        title: 'Finger Number Quiz',
        question: 'Which finger number corresponds to your thumb on both hands?',
        options: ['Finger 1', 'Finger 3', 'Finger 5', 'Finger 2'],
        correctAnswer: 'Finger 1',
        explanation: 'In piano music, Finger 1 is always the Thumb, and Finger 5 is the Pinky.',
      },
      {
        id: 'ex-follow-cde',
        lessonId: 'les-4-1',
        type: 'FOLLOW_NOTES',
        title: 'Follow The Notes: C → D → E',
        question: 'Play the sequence: C4 → D4 → E4',
        sequence: ['C4', 'D4', 'E4'],
        correctAnswer: ['C4', 'D4', 'E4'],
        explanation: 'Great job! You played the ascending C, D, and E notes in correct sequence.',
      },
      {
        id: 'ex-c-scale',
        lessonId: 'les-5-1',
        type: 'FOLLOW_NOTES',
        title: 'C Major 5-Finger Pattern',
        question: 'Play the 5-finger ascending scale: C4 → D4 → E4 → F4 → G4',
        sequence: ['C4', 'D4', 'E4', 'F4', 'G4'],
        correctAnswer: ['C4', 'D4', 'E4', 'F4', 'G4'],
        explanation: 'Brilliant! You executed the 5-finger scale with smooth fingering.',
      },
      {
        id: 'ex-chord-c-major',
        lessonId: 'les-6-1',
        type: 'CHORD_IDENTIFICATION',
        title: 'Chord Identification',
        question: 'What chord is made of the notes: C - E - G?',
        options: ['C Major', 'C Minor', 'G Major', 'F Major'],
        correctAnswer: 'C Major',
        explanation: 'C - E - G forms the C Major triad, consisting of root C, major third E, and perfect fifth G.',
      },
      {
        id: 'ex-rhythm-1',
        lessonId: 'les-7-1',
        type: 'RHYTHM',
        title: 'Quarter Note Pulse',
        question: 'Tap the key along with the 4-beat pulse.',
        sequence: ['C4', 'C4', 'C4', 'C4'],
        correctAnswer: ['C4', 'C4', 'C4', 'C4'],
        rhythmBeats: [1, 2, 3, 4],
        explanation: 'Spot on! You kept an even pulse on each of the 4 beats.',
      },
      {
        id: 'ex-ode-phrase',
        lessonId: 'les-8-1',
        type: 'FOLLOW_NOTES',
        title: 'Ode to Joy: Opening Phrase',
        question: 'Play the sequence: E4 → E4 → F4 → G4',
        sequence: ['E4', 'E4', 'F4', 'G4'],
        correctAnswer: ['E4', 'E4', 'F4', 'G4'],
        explanation: 'Magnificent! You performed the opening motive of Beethoven Ode to Joy.',
      },
      // Additional general practice exercises
      {
        id: 'ex-gen-find-g',
        type: 'FIND_NOTE',
        title: 'Find G',
        question: 'Click G4 on the virtual keyboard.',
        correctAnswer: 'G4',
        targetKeys: ['G4'],
        explanation: 'G sits right between the first two black keys in the group of three.',
      },
      {
        id: 'ex-gen-chord-g',
        type: 'CHORD_IDENTIFICATION',
        title: 'Chord Identification: G - B - D',
        question: 'What chord is made of G - B - D?',
        options: ['G Major', 'C Major', 'D Major', 'E Minor'],
        correctAnswer: 'G Major',
        explanation: 'G - B - D is the G Major triad.',
      }
    ];

    // 7. Assignments (clean slate for new students)
    this.assignments = [];

    // 8. Feedback (clean slate)
    this.feedback = [];

    // 9. Achievements (calculated dynamically)
    this.achievements = [];

    // 10. Practice Sessions (clean slate)
    this.practiceSessions = [];

    // 11. Songs
    this.songs = [
      {
        id: 'song-1',
        title: 'Ode to Joy',
        composer: 'Ludwig van Beethoven',
        difficulty: 'Beginner',
        requiredSkills: ['C Major 5-finger position', 'Quarter notes', 'Right hand'],
        bpm: 75,
        practiceBpmOptions: [50, 75, 100],
        chords: ['C Major', 'G Major'],
        description: 'The triumphant melody from Symphony No. 9, ideal for mastering right-hand stepping and repeating notes.',
        notes: [
          { note: 'E4', duration: 1, time: 0 },
          { note: 'E4', duration: 1, time: 1 },
          { note: 'F4', duration: 1, time: 2 },
          { note: 'G4', duration: 1, time: 3 },
          { note: 'G4', duration: 1, time: 4 },
          { note: 'F4', duration: 1, time: 5 },
          { note: 'E4', duration: 1, time: 6 },
          { note: 'D4', duration: 1, time: 7 },
          { note: 'C4', duration: 1, time: 8 },
          { note: 'C4', duration: 1, time: 9 },
          { note: 'D4', duration: 1, time: 10 },
          { note: 'E4', duration: 1, time: 11 },
          { note: 'E4', duration: 1.5, time: 12 },
          { note: 'D4', duration: 0.5, time: 13.5 },
          { note: 'D4', duration: 2, time: 14 },
        ]
      },
      {
        id: 'song-2',
        title: 'Amazing Grace',
        composer: 'Traditional',
        difficulty: 'Beginner',
        requiredSkills: ['C Major', 'Basic rhythm in 3/4', 'Right hand lyrical tone'],
        bpm: 65,
        practiceBpmOptions: [50, 65, 80],
        chords: ['C Major', 'F Major', 'G Major'],
        description: 'A timeless hymn in gentle 3/4 meter that teaches singing through the fingers.',
        notes: [
          { note: 'G3', duration: 1, time: 0 },
          { note: 'C4', duration: 2, time: 1 },
          { note: 'E4', duration: 0.5, time: 3 },
          { note: 'C4', duration: 0.5, time: 3.5 },
          { note: 'E4', duration: 2, time: 4 },
          { note: 'D4', duration: 1, time: 6 },
          { note: 'C4', duration: 2, time: 7 },
          { note: 'A3', duration: 1, time: 9 },
          { note: 'G3', duration: 3, time: 10 },
        ]
      },
      {
        id: 'song-3',
        title: 'Twinkle, Twinkle, Little Star',
        composer: 'Traditional',
        difficulty: 'Beginner',
        requiredSkills: ['5-finger range', 'Even pulsation', 'Melodic leaps'],
        bpm: 70,
        practiceBpmOptions: [50, 70, 90],
        chords: ['C Major', 'F Major', 'G Major'],
        description: 'Beloved classic featuring the 5th interval leap from C up to G.',
        notes: [
          { note: 'C4', duration: 1, time: 0 },
          { note: 'C4', duration: 1, time: 1 },
          { note: 'G4', duration: 1, time: 2 },
          { note: 'G4', duration: 1, time: 3 },
          { note: 'A4', duration: 1, time: 4 },
          { note: 'A4', duration: 1, time: 5 },
          { note: 'G4', duration: 2, time: 6 },
          { note: 'F4', duration: 1, time: 8 },
          { note: 'F4', duration: 1, time: 9 },
          { note: 'E4', duration: 1, time: 10 },
          { note: 'E4', duration: 1, time: 11 },
          { note: 'D4', duration: 1, time: 12 },
          { note: 'D4', duration: 1, time: 13 },
          { note: 'C4', duration: 2, time: 14 },
        ]
      }
    ];

    // 12. Lesson Progress (clean slate for new users)
    this.lessonProgress = [];
  }
}

export const db = new InMemoryDatabase();
