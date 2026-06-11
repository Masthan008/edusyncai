import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'Admin' | 'Principal' | 'HOD' | 'Teacher' | 'Student' | 'Parent' | 'Accountant';
}

export interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  roll_number?: string;
  class_id?: string;
  section_id?: string;
  class_name?: string;
  section_name?: string;
  dob?: string;
  gender?: string;
  address?: string;
  status?: string;
}

export interface TeacherProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  department_id?: string;
  department_name?: string;
  qualification?: string;
  status?: string;
}

export interface ParentProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  children?: Array<{ id: string; first_name: string; last_name: string; admission_number: string }>;
}

export interface UserProfile {
  id?: string;
  first_name?: string;
  last_name?: string;
  admission_number?: string;
  roll_number?: string;
  class_id?: string;
  section_id?: string;
  class_name?: string;
  section_name?: string;
  dob?: string;
  gender?: string;
  address?: string;
  status?: string;
  phone?: string;
  department_id?: string;
  department_name?: string;
  qualification?: string;
  occupation?: string;
  children?: Array<{ id: string; first_name: string; last_name: string; admission_number: string }>;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, user: User, profile: UserProfile) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load initial auth state from localStorage
  const savedToken = localStorage.getItem('edusync_token');
  const savedUser = localStorage.getItem('edusync_user');
  const savedProfile = localStorage.getItem('edusync_profile');

  let parsedUser: User | null = null;
  let parsedProfile: UserProfile | null = null;

  try {
    if (savedUser) parsedUser = JSON.parse(savedUser);
    if (savedProfile) parsedProfile = JSON.parse(savedProfile);
  } catch (e) {
    console.error('Failed to parse saved session:', e);
  }

  return {
    token: savedToken,
    user: parsedUser,
    profile: parsedProfile,
    isAuthenticated: !!savedToken,
    login: (token, user, profile) => {
      localStorage.setItem('edusync_token', token);
      localStorage.setItem('edusync_user', JSON.stringify(user));
      localStorage.setItem('edusync_profile', JSON.stringify(profile));
      set({ token, user, profile, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('edusync_token');
      localStorage.removeItem('edusync_user');
      localStorage.removeItem('edusync_profile');
      set({ token: null, user: null, profile: null, isAuthenticated: false });
    },
    updateProfile: (profile) => {
      localStorage.setItem('edusync_profile', JSON.stringify(profile));
      set({ profile });
    },
  };
});
