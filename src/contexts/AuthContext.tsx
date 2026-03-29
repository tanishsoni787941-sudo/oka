import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'student';
  status: 'active' | 'blocked';
  created_at: number;
  completed_videos?: string[];
  progress_percentage?: number;
  sessionId?: string;
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
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as UserProfile;
            
            // Check for block status
            if (userData.status === 'blocked') {
              setAuthError("Your account has been blocked by admin.");
              try {
                await signOut(auth);
              } catch (error) {
                console.error("Error signing out:", error);
              }
              setUser(null);
              setProfile(null);
              return;
            }

            // Check for multi-device login
            let localSessionId = localStorage.getItem('sessionId');
            
            if (!localSessionId && userData.sessionId) {
              // If localSessionId is missing but exists in DB (e.g., cleared localStorage), sync it
              localSessionId = userData.sessionId;
              localStorage.setItem('sessionId', localSessionId);
            } else if (!userData.sessionId && localSessionId) {
              // If missing in DB but exists locally, update DB
              try {
                await setDoc(userDocRef, { sessionId: localSessionId }, { merge: true });
              } catch (error) {
                console.error("Error updating session ID:", error);
              }
            } else if (!localSessionId && !userData.sessionId) {
               // If missing in both, generate and set
               localSessionId = uuidv4();
               localStorage.setItem('sessionId', localSessionId);
               try {
                 await setDoc(userDocRef, { sessionId: localSessionId }, { merge: true });
               } catch (error) {
                 console.error("Error updating session ID:", error);
               }
            }

            if (userData.sessionId && localSessionId && userData.sessionId !== localSessionId) {
              setMultipleDeviceError(true);
              setAuthError("You have been logged out because your account was accessed from another device.");
              try {
                await signOut(auth);
              } catch (error) {
                console.error("Error signing out:", error);
              }
              setUser(null);
              setProfile(null);
              return;
            }

            setProfile(userData);
            setAuthError(null);
          } else {
            // If user doc doesn't exist, create it (fallback)
            let localSessionId = localStorage.getItem('sessionId');
            if (!localSessionId) {
              localSessionId = uuidv4();
              localStorage.setItem('sessionId', localSessionId);
            }
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: 'user',
              status: 'active',
              created_at: Date.now(),
              completed_videos: [],
              progress_percentage: 0,
              sessionId: localSessionId
            };
            try {
              await setDoc(userDocRef, newProfile);
            } catch (error) {
              handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}`);
              throw error;
            }
            setProfile(newProfile);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        });
      } else {
        setProfile(null);
        setLoading(false);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('sessionId');
      setAuthError(null);
      setMultipleDeviceError(false);
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
