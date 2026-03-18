import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, runTransaction } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Leaf } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { deviceId } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        // Update active device ID
        await setDoc(doc(db, 'users', userCred.user.uid), {
          active_device_id: deviceId
        }, { merge: true });
        navigate('/');
      } else {
        // Signup
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        // Generate Student ID OMF-0001
        let studentId = 'OMF-0001';
        try {
          await runTransaction(db, async (transaction) => {
            const counterRef = doc(db, 'metadata', 'counters');
            const counterDoc = await transaction.get(counterRef);
            let nextCount = 1;
            if (counterDoc.exists()) {
              nextCount = (counterDoc.data().student_count || 0) + 1;
            }
            transaction.set(counterRef, { student_count: nextCount }, { merge: true });
            studentId = `OMF-${String(nextCount).padStart(4, '0')}`;
          });
        } catch (err) {
          console.error("Error generating student ID", err);
          // Fallback if transaction fails
          studentId = `OMF-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        }

        const now = Date.now();
        await setDoc(doc(db, 'users', userCred.user.uid), {
          id: userCred.user.uid,
          full_name: fullName,
          email: email,
          student_id: studentId,
          profile_photo: profilePhoto || '',
          active_device_id: deviceId,
          created_at: now
        });
        
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center">
            <Leaf className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900 dark:text-white">
          Organic Mushroom Farm
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
          {isLogin ? 'Sign in to your account' : 'Register for the training'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-stone-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-stone-200 dark:border-stone-700">
          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-stone-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Profile Photo URL (Optional)
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-stone-700 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-stone-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-stone-700 dark:text-white"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Register')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-300 dark:border-stone-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-stone-800 text-stone-500">
                  {isLogin ? 'New to the platform?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full flex justify-center py-2 px-4 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
