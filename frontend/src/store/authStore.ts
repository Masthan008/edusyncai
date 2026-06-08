import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'Admin' | 'Principal' | 'HOD' | 'Teacher' | 'Student' | 'Parent' | 'Accountant';
}

interface AuthState {
  token: string | null;
  user: User | null;
  profile: any | null;
  isAuthenticated: boolean;
  login: (token: string, user: User, profile: any) => void;
  logout: () => void;
  updateProfile: (profile: any) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load initial auth state from localStorage
  const savedToken = localStorage.getItem('edusync_token');
  const savedUser = localStorage.getItem('edusync_user');
  const savedProfile = localStorage.getItem('edusync_profile');

  let parsedUser: User | null = null;
  let parsedProfile: any | null = null;

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
