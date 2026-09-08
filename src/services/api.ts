import {
  User,
  StudentProfile,
  Course,
  Lesson,
  Exercise,
  Assignment,
  PracticeSession,
  InstructorFeedback,
  Achievement,
  Song
} from '../types.js';

export const api = {
  // Auth
  async getMe(): Promise<{ user: User | null; profile?: StudentProfile | null }> {
    const res = await fetch('/api/auth/me');
    if (!res.ok) throw new Error('Failed to get current user');
    return res.json();
  },

  async logout(): Promise<void> {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to log out');
  },

  async switchUser(userId: string): Promise<{ user: User; profile?: StudentProfile }> {
    const res = await fetch('/api/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to switch user');
    return res.json();
  },

  async login(
    usernameOrEmail: string,
    password?: string,
    role?: 'STUDENT' | 'INSTRUCTOR'
  ): Promise<{ user: User; profile?: StudentProfile; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, email: usernameOrEmail, password, role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(registrationData: {
    name: string;
    email?: string;
    password?: string;
    role?: string;
    avatar?: string;
    skillLevel?: string;
    learningGoal?: string;
    bio?: string;
  } | string, email?: string, role?: string): Promise<{ user: User; profile?: StudentProfile }> {
    const payload = typeof registrationData === 'string'
      ? { name: registrationData, email, role }
      : registrationData;

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  // Dynamic Users
  async getUsers(): Promise<Array<User & { profile?: StudentProfile | null }>> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async updateUser(userId: string, data: Partial<User>): Promise<{ user: User; profile?: StudentProfile }> {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user profile');
    return res.json();
  },

  // Achievements
  async getAchievements(studentId: string): Promise<Achievement[]> {
    const res = await fetch(`/api/achievements/student/${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch achievements');
    return res.json();
  },

  // Students
  async getStudents(): Promise<Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    progress: number;
    currentLesson: string;
    currentModule: string;
    practiceStreak: number;
    totalPracticeMinutes: number;
    lastPractice: string;
    weakAreas: string[];
    recentFeedback: string | null;
    pendingAssignmentsCount: number;
  }>> {
    const res = await fetch('/api/students');
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async getStudentProgress(studentId: string) {
    const res = await fetch(`/api/students/${studentId}/progress`);
    if (!res.ok) throw new Error('Failed to fetch student progress');
    return res.json();
  },

  // Courses & Lessons
  async getCourses(): Promise<Course[]> {
    const res = await fetch('/api/courses');
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
  },

  async getCourseDetails(courseId: string) {
    const res = await fetch(`/api/courses/${courseId}`);
    if (!res.ok) throw new Error('Failed to fetch course details');
    return res.json();
  },

  async getLessons(studentId?: string): Promise<Lesson[]> {
    const url = studentId ? `/api/lessons?studentId=${studentId}` : '/api/lessons';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch lessons');
    return res.json();
  },

  async getLesson(lessonId: string): Promise<Lesson & { exercise?: Exercise | null }> {
    const res = await fetch(`/api/lessons/${lessonId}`);
    if (!res.ok) throw new Error('Failed to fetch lesson');
    return res.json();
  },

  async createLesson(lessonData: Partial<Lesson>): Promise<Lesson> {
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData),
    });
    if (!res.ok) throw new Error('Failed to create lesson');
    return res.json();
  },

  async completeLesson(lessonId: string, studentId: string, score: number = 100) {
    const res = await fetch(`/api/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, score }),
    });
    if (!res.ok) throw new Error('Failed to complete lesson');
    return res.json();
  },

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    const res = await fetch('/api/exercises');
    if (!res.ok) throw new Error('Failed to fetch exercises');
    return res.json();
  },

  async submitExercise(exerciseId: string, answer: string | string[]): Promise<{
    correct: boolean;
    explanation: string;
    correctAnswer: string | string[];
  }> {
    const res = await fetch(`/api/exercises/${exerciseId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    });
    if (!res.ok) throw new Error('Failed to submit exercise');
    return res.json();
  },

  // Practice
  async recordPractice(session: {
    studentId: string;
    exerciseTitle: string;
    durationMinutes: number;
    accuracy: number;
    notesPlayed: number;
  }): Promise<PracticeSession> {
    const res = await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    if (!res.ok) throw new Error('Failed to record practice session');
    return res.json();
  },

  async getStudentPractice(studentId: string): Promise<PracticeSession[]> {
    const res = await fetch(`/api/practice/student/${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch practice sessions');
    return res.json();
  },

  // Assignments
  async getStudentAssignments(studentId: string): Promise<Assignment[]> {
    const res = await fetch(`/api/assignments/student/${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    return res.json();
  },

  async createAssignment(assignmentData: Partial<Assignment>): Promise<Assignment> {
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData),
    });
    if (!res.ok) throw new Error('Failed to create assignment');
    return res.json();
  },

  async toggleAssignment(assignmentId: string): Promise<Assignment> {
    const res = await fetch(`/api/assignments/${assignmentId}/toggle`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to toggle assignment');
    return res.json();
  },

  // Feedback
  async getStudentFeedback(studentId: string): Promise<InstructorFeedback[]> {
    const res = await fetch(`/api/feedback/student/${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch feedback');
    return res.json();
  },

  async sendFeedback(feedbackData: { studentId: string; lessonTitle?: string; message: string }): Promise<InstructorFeedback> {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    if (!res.ok) throw new Error('Failed to send feedback');
    return res.json();
  },

  // Songs
  async getSongs(): Promise<Song[]> {
    const res = await fetch('/api/songs');
    if (!res.ok) throw new Error('Failed to fetch songs');
    return res.json();
  },

  // Instructor Analytics
  async getInstructorAnalytics() {
    const res = await fetch('/api/analytics/instructor');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Studio Updates
  async getUpdates(): Promise<Array<{
    id: string;
    title: string;
    category: 'Curriculum' | 'Studio Feature' | 'Practice Tip' | 'Announcement';
    authorName: string;
    authorRole: string;
    content: string;
    tag?: string;
    createdAt: string;
  }>> {
    const res = await fetch('/api/updates');
    if (!res.ok) throw new Error('Failed to fetch studio updates');
    return res.json();
  },

  async createUpdate(data: {
    title: string;
    category?: string;
    content: string;
    tag?: string;
  }): Promise<{
    id: string;
    title: string;
    category: string;
    authorName: string;
    authorRole: string;
    content: string;
    tag?: string;
    createdAt: string;
  }> {
    const res = await fetch('/api/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to post update');
    return res.json();
  },
};
