import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, ArrowRight, Sprout } from 'lucide-react';
import { motion } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import MushroomModel from '../components/MushroomModel';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check Firestore users collection
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.status === 'blocked') {
          throw new Error("Your account has been blocked by admin.");
        }
      }

      navigate('/');
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col lg:flex-row overflow-hidden relative">
      {/* Decorative 3D Elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"
      />

      {/* Left Side: Hero Section */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <div className="inline-flex items-center space-x-2 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/20 dark:border-white/10">
            <Sprout className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Next-Gen Farming</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="text-gradient">Organic</span><br />
            Mushroom Farming
          </h1>
          
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-10 max-w-lg leading-relaxed">
            Join our immersive training platform. Learn sustainable techniques, track your progress, and build your own organic farm from scratch.
          </p>

          {/* 3D Mushroom Model */}
          <div className="relative h-80 w-full max-w-md hidden sm:block">
            <div className="absolute inset-0 z-20">
              <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <MushroomModel />
              </Canvas>
            </div>
            
            <motion.div 
              animate={{ y: [0, -15, 0], rotateZ: [-5, -5, -5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-48 h-32 glass-card rounded-2xl p-4 z-10 opacity-50"
            >
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-3">
                <Leaf className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="h-2 w-24 bg-stone-200 dark:bg-stone-700 rounded mb-2"></div>
              <div className="h-2 w-16 bg-stone-200 dark:bg-stone-700 rounded"></div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="lg:w-1/2 p-4 sm:p-8 lg:p-16 flex items-center justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="glass-card rounded-3xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-2">
                Welcome back
              </h2>
              <p className="text-stone-500 dark:text-stone-400">
                Enter your details to access your courses.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleAuth}>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none dark:text-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50">
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full button-3d text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center group"
              >
                {loading ? 'Please wait...' : 'Sign In'}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="text-center mt-6">
                <p className="text-stone-600 dark:text-stone-400">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
