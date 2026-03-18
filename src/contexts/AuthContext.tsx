import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
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
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  deviceId: string;
  multipleDeviceError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Listen to user profile changes
      const profileRef = doc(db, 'users', currentUser.uid);
      const unsubProfile = onSnapshot(profileRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          
          // Check for multiple device login
          if (data.active_device_id && data.active_device_id !== deviceId) {
            setMultipleDeviceError(true);
            signOut(auth);
          } else {
            setMultipleDeviceError(false);
          }
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
      });

      return () => unsubProfile();
    });

    return () => unsubscribe();
  }, [deviceId]);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, deviceId, multipleDeviceError }}>
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
