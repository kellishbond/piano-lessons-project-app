import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '../types.js';
import { api } from '../services/api.js';

interface RegisterParams {
  name: string;
  email?: string;
  password?: string;
  role?: string;
  avatar?: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  learningGoal?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  allUsers: Array<User & { profile?: StudentProfile | null }>;
  loading: boolean;
  switchUser: (userId: string) => Promise<void>;
  login: (usernameOrEmail: string, password?: string, role?: 'STUDENT' | 'INSTRUCTOR') => Promise<void>;
  logout: () => Promise<void>;
  register: (nameOrData: string | RegisterParams, email?: string, role?: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAllUsers: () => Promise<void>;
  isInstructor: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [allUsers, setAllUsers] = useState<Array<User & { profile?: StudentProfile | null }>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshAllUsers = async () => {
    try {
      const usersList = await api.getUsers();
      setAllUsers(usersList);
    } catch (e) {
      console.error('Failed to load users list', e);
    }
  };

  const refreshUser = async () => {
    try {
      const [userData, usersList] = await Promise.all([
        api.getMe(),
        api.getUsers().catch(() => []),
      ]);
      setUser(userData.user);
      setProfile(userData.profile || null);
      if (usersList.length > 0) {
        setAllUsers(usersList);
      }
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    refreshAllUsers();
  }, []);

  const switchUser = async (userId: string) => {
    setLoading(true);
    try {
      const data = await api.switchUser(userId);
      setUser(data.user);
      setProfile(data.profile || null);
      await refreshAllUsers();
    } catch (e) {
      console.error('Failed to switch user', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (usernameOrEmail: string, password?: string, role?: 'STUDENT' | 'INSTRUCTOR') => {
    setLoading(true);
    try {
      const data = await api.login(usernameOrEmail, password, role);
      setUser(data.user);
      setProfile(data.profile || null);
      await refreshAllUsers();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
      setProfile(null);
    } catch (e) {
      console.error('Logout error', e);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (nameOrData: string | RegisterParams, email?: string, role?: string) => {
    setLoading(true);
    try {
      const payload = typeof nameOrData === 'string'
        ? { name: nameOrData, email: email || '', role: role || 'STUDENT' }
        : nameOrData;

      const data = await api.register(payload);
      setUser(data.user);
      setProfile(data.profile || null);
      await refreshAllUsers();
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await api.updateUser(user.id, data);
      setUser(updated.user);
      if (updated.profile) setProfile(updated.profile);
      await refreshAllUsers();
    } catch (e) {
      console.error('Failed to update profile', e);
      throw e;
    }
  };

  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        allUsers,
        loading,
        switchUser,
        login,
        logout,
        register,
        updateProfile,
        refreshUser,
        refreshAllUsers,
        isInstructor,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
