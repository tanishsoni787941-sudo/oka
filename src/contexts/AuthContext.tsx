import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  profile_photo: string;
  active_device_id: string;
  created_at: number; // timestamp
  role: 'admin' | 'user' | 'student';
  is_blocked: boolean;
  completed_videos: string[];
  progress_percentage: number;
}

interface AuthContextType {
  user: { uid: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  deviceId: string;
  multipleDeviceError: boolean;
  authError: string | null;
  login: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [multipleDeviceError, setMultipleDeviceError] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('omf_device_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('omf_device_id', id);
    }
    return id;
  });

  // Initialize mock admin if not exists
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    if (users.length === 0) {
      const adminUser: UserProfile = {
        id: 'admin-123',
        full_name: 'Admin User',
        email: 'admin@example.com',
        student_id: 'ADMIN001',
        profile_photo: '',
        active_device_id: '',
        created_at: Date.now(),
        role: 'admin',
        is_blocked: false,
        completed_videos: [],
        progress_percentage: 0
      };
      const normalUser: UserProfile = {
        id: 'user-456',
        full_name: 'Test User',
        email: 'user@example.com',
        student_id: 'USER001',
        profile_photo: '',
        active_device_id: '',
        created_at: Date.now(),
        role: 'user',
        is_blocked: false,
        completed_videos: [],
        progress_percentage: 0
      };
      localStorage.setItem('mock_users', JSON.stringify([adminUser, normalUser]));
    }
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const storedUserId = localStorage.getItem('auth_user_id');
      if (!storedUserId) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const users: UserProfile[] = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const foundUser = users.find(u => u.id === storedUserId);

      if (foundUser) {
        if (foundUser.is_blocked) {
          setAuthError("Your account has been blocked by admin.");
          localStorage.removeItem('auth_user_id');
          setUser(null);
          setProfile(null);
        } else {
          setUser({ uid: foundUser.id, email: foundUser.email });
          setProfile(foundUser);
          setAuthError(null);
        }
      } else {
        localStorage.removeItem('auth_user_id');
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    checkAuth();
    // Listen for storage changes to sync across tabs
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const login = async (email: string) => {
    const users: UserProfile[] = JSON.parse(localStorage.getItem('mock_users') || '[]');
    let foundUser = users.find(u => u.email === email);
    
    if (!foundUser) {
      // Auto-create user for seamless prototype experience
      foundUser = {
        id: uuidv4(),
        full_name: email.split('@')[0],
        email: email,
        role: 'student',
        created_at: Date.now(),
        active_device_id: deviceId,
        completed_videos: [],
        progress_percentage: 0,
        is_blocked: false,
        student_id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        profile_photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      users.push(foundUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
    }

    if (foundUser.is_blocked) {
      throw new Error("Your account has been blocked by admin.");
    }
    localStorage.setItem('auth_user_id', foundUser.id);
    setUser({ uid: foundUser.id, email: foundUser.email });
    setProfile(foundUser);
    setAuthError(null);
  };

  const logout = async () => {
    localStorage.removeItem('auth_user_id');
    setUser(null);
    setProfile(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, login, deviceId, multipleDeviceError, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
