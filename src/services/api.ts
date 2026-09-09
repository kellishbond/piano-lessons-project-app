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

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 0, code = 'REQUEST_FAILED') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message = typeof payload === 'object' && payload?.error
        ? payload.error
        : `Request failed (${response.status})`;
      const code = typeof payload === 'object' && payload?.code
        ? payload.code
        : 'REQUEST_FAILED';
      throw new ApiError(message, response.status, code);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('The request took too long. Check your connection and try again.', 408, 'TIMEOUT');
    }
    throw new ApiError('We could not reach the piano studio. Check your connection and try again.', 0, 'NETWORK_ERROR');
  } finally {
    window.clearTimeout(timeout);
  }
}

export const api = {
  // Auth
  async getMe(): Promise<{ user: User | null; profile?: StudentProfile | null }> {
    return request('/api/auth/me');
  },

  async logout(): Promise<void> {
    await request('/api/auth/logout', { method: 'POST' });
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
    return request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, email: usernameOrEmail, password, role }),
    });
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

    return request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
    return request(url);
  },

  async getLesson(lessonId: string): Promise<Lesson & { exercise?: Exercise | null }> {
    return request(`/api/lessons/${lessonId}`);
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
    return request(`/api/exercises/${exerciseId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    });
  },

  // Practice
  async recordPractice(session: {
    studentId: string;
    exerciseTitle: string;
    durationMinutes: number;
    accuracy: number;
    notesPlayed: number;
  }): Promise<PracticeSession> {
    return request('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
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
