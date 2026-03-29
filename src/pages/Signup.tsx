import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { Leaf, ArrowRight, Sprout, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import MushroomModel from '../components/MushroomModel';
import { v4 as uuidv4 } from 'uuid';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { deviceId, login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const users: UserProfile[] = JSON.parse(localStorage.getItem('mock_users') || '[]');
      
      if (users.find(u => u.email === email)) {
        setError('This email is already in use. Try logging in.');
        setLoading(false);
        return;
      }

      const newUser: UserProfile = {
        id: uuidv4(),
        full_name: name,
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

      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));

      await login(email);
      navigate('/');
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || 'Signup failed. Please try again.');
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
            <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Join the Community</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="text-gradient">Start Your</span><br />
            Farming Journey
          </h1>
          
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-10 max-w-lg leading-relaxed">
            Create your account today and gain access to our comprehensive organic mushroom farming training.
          </p>

          {/* 3D Mushroom Model */}
          <div className="relative h-80 w-full max-w-md hidden sm:block">
            <div className="absolute inset-0 z-20">
              <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <MushroomModel />
              </Canvas>
            </div>
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
                Create Account
              </h2>
              <p className="text-stone-500 dark:text-stone-400">
                Join thousands of students learning today.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSignup}>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>

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
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="text-center mt-6">
                <p className="text-stone-600 dark:text-stone-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
                    Sign In
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
