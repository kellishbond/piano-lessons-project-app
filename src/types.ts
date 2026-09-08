export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  learningGoal?: string;
  bio?: string;
  createdAt: string;
}

export interface StudentProfile {
  userId: string;
  currentCourseId: string;
  currentModuleId: string;
  currentLessonId: string;
  overallProgress: number; // 0 to 100
  practiceStreakDays: number;
  totalPracticeMinutes: number;
  weakAreas: string[];
  lastPracticeDate?: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  learningGoal?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: string[]; // module ids
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: string[]; // lesson ids
}

export interface LessonSection {
  learn: {
    heading: string;
    text: string;
    keyPoints: string[];
  };
  watch: {
    title: string;
    description: string;
    animationType: 'keyboard_hand' | 'rhythm_meter' | 'scale_run' | 'chord_builder';
    handPositionHint?: string;
  };
  listen: {
    title: string;
    description: string;
    notesToPlay: string[]; // e.g. ['C4', 'E4', 'G4']
    bpm: number;
  };
  see: {
    title: string;
    highlightKeys: string[]; // e.g. ['C4', 'E4', 'G4']
    fingerGuides?: Record<string, number>; // e.g. {'C4': 1, 'E4': 3, 'G4': 5}
    description: string;
  };
  practice: {
    instructions: string;
    targetNotes: string[];
    tempoBpm?: number;
  };
  testYourself: {
    exerciseId: string;
  };
  assignment: {
    task: string;
    recommendedMinutes: number;
    checkpoints: string[];
  };
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  difficulty: 'Beginner' | 'Intermediate';
  sections: LessonSection;
  status?: 'COMPLETED' | 'CURRENT' | 'LOCKED';
}

export type ExerciseType = 'FIND_NOTE' | 'FOLLOW_NOTES' | 'CHORD_IDENTIFICATION' | 'RHYTHM';

export interface Exercise {
  id: string;
  lessonId?: string;
  type: ExerciseType;
  title: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  sequence?: string[];
  targetKeys?: string[];
  rhythmBeats?: number[];
  explanation?: string;
}

export interface Assignment {
  id: string;
  lessonId?: string;
  studentId: string;
  title: string;
  description: string;
  requirements: string[];
  playCountTarget: number;
  practiceMinutesTarget: number;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface PracticeSession {
  id: string;
  studentId: string;
  exerciseTitle?: string;
  durationMinutes: number;
  accuracy: number; // 0-100%
  notesPlayed: number;
  completedAt: string;
}

export interface LessonProgress {
  id: string;
  studentId: string;
  lessonId: string;
  completionPercentage: number;
  score?: number;
  completedAt?: string;
  status: 'COMPLETED' | 'CURRENT' | 'LOCKED';
}

export interface InstructorFeedback {
  id: string;
  studentId: string;
  instructorId: string;
  instructorName: string;
  lessonTitle?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Achievement {
  id: string;
  studentId?: string;
  type?: string;
  title: string;
  description: string;
  icon: string;
  category?: 'Practice' | 'Technique' | 'Theory' | 'Repertoire';
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  unlocked?: boolean;
  unlockedAt?: string;
}

export interface Song {
  id: string;
  title: string;
  composer?: string;
  difficulty: 'Beginner' | 'Intermediate';
  requiredSkills: string[];
  notes: Array<{ note: string; duration: number; time: number }>;
  chords: string[];
  bpm: number;
  practiceBpmOptions: number[];
  description: string;
}
