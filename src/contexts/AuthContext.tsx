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
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  deviceId: string;
  multipleDeviceError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [multipleDeviceError, setMultipleDeviceError] = useState(false);
  
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('omf_device_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('omf_device_id', id);
    }
    return id;
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setProfile(data.user);
          
          if (data.user.active_device_id && data.user.active_device_id !== deviceId) {
            setMultipleDeviceError(true);
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            setProfile(null);
          } else {
            setMultipleDeviceError(false);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [deviceId]);

  const login = (userData: UserProfile) => {
    setUser(userData);
    setProfile(userData);
    setMultipleDeviceError(false);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, deviceId, multipleDeviceError }}>
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
