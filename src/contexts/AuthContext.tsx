import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'student';
  status: 'active' | 'blocked';
  created_at: number;
  completed_videos?: string[];
  progress_percentage?: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  authError: string | null;
  multipleDeviceError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [multipleDeviceError, setMultipleDeviceError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            if (userData.status === 'blocked') {
              setAuthError("Your account has been blocked by admin.");
              await signOut(auth);
              setUser(null);
              setProfile(null);
            } else {
              setProfile(userData);
              setAuthError(null);
            }
          } else {
            // If user doc doesn't exist, create it (fallback)
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: 'user',
              status: 'active',
              created_at: Date.now(),
              completed_videos: [],
              progress_percentage: 0
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setAuthError("Failed to load user profile.");
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthError(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, authError, multipleDeviceError }}>
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
