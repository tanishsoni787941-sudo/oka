import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { COURSE_LESSONS } from '../data/course';
import { getDaysSinceRegistration, hasReachedUnlockTime, getUnlockTime } from '../lib/utils';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import LessonCard from '../components/LessonCard';
import CountdownTimer from '../components/CountdownTimer';
import { LogOut, Moon, Sun, User as UserIcon, Phone, Mail, Instagram, Facebook, Youtube, Sprout } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  
  useEffect(() => {
    if (!profile) return;
    
    const q = query(collection(db, 'progress'), where('user_id', '==', profile.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const completed = snapshot.docs
        .filter(doc => doc.data().completed)
        .map(doc => doc.data().lesson_id);
      setCompletedLessons(completed);
    });
    
    return () => unsubscribe();
  }, [profile]);

  if (!profile) return null;

  const daysSinceReg = getDaysSinceRegistration(new Date(profile.created_at));
  const reachedTime = hasReachedUnlockTime();
  
  const progressPercentage = Math.round((completedLessons.length / COURSE_LESSONS.length) * 100);
  const allCompleted = completedLessons.length === COURSE_LESSONS.length;

  const nextTimeLockedLesson = COURSE_LESSONS.find(lesson => {
    if (completedLessons.includes(lesson.id)) return false;
    if (lesson.requiresPreviousComplete) return false;
    
    if (daysSinceReg > lesson.unlockDayOffset) return false;
    if (daysSinceReg === lesson.unlockDayOffset && reachedTime) return false;
    
    return true;
  });

  const nextUnlockTime = nextTimeLockedLesson 
    ? getUnlockTime(new Date(profile.created_at), nextTimeLockedLesson.unlockDayOffset)
    : null;

  return (
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
      {/* Decorative 3D Background Elements */}
      <motion.div 
        animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"
      />
      <motion.div 
        animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10"
      />

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Sprout className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-gradient hidden sm:block">
              Organic Mushroom Farm
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={logout} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-stone-500 hover:text-red-500 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Sticky Instructions */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border-purple-200 dark:border-purple-800/50 rounded-2xl p-5 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          <p className="text-sm sm:text-base text-purple-900 dark:text-purple-200 font-medium ml-2">
            Please log in using the same browser where you received the login link on WhatsApp. The class will start at 4:00 PM. After completing the lesson, click 'Mark as Completed'. The next lesson will unlock automatically the next day at 4:00 PM.
          </p>
        </motion.div>

        {/* User Profile & Progress */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-6 sm:p-8 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8"
        >
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center overflow-hidden shrink-0 border-4 border-white/50 dark:border-stone-800/50 shadow-xl z-10 relative">
              {profile.profile_photo ? (
                <img src={profile.profile_photo} alt={profile.full_name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="h-12 w-12 text-stone-400" />
              )}
            </div>
            {/* 3D Ring behind avatar */}
            <div className="absolute inset-0 -m-2 rounded-full border-2 border-purple-500/30 animate-[spin_10s_linear_infinite]"></div>
          </div>
          
          <div className="flex-1 text-center md:text-left w-full">
            <h2 className="text-3xl font-bold mb-2">{profile.full_name}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2 sm:gap-4 text-sm text-stone-600 dark:text-stone-400 mb-6">
              <span>{profile.email}</span>
              <span className="hidden sm:inline">•</span>
              <span className="font-mono bg-black/5 dark:bg-white/10 px-3 py-1 rounded-lg font-medium">
                {profile.student_id}
              </span>
            </div>
            
            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-5">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-semibold">Course Progress</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-stone-200/50 dark:bg-stone-700/50 rounded-full h-3 overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Completion Message */}
        {allCompleted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card border-green-200 dark:border-green-800/50 rounded-2xl p-8 mb-10 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-green-500/5 dark:bg-green-500/10"></div>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-3 relative z-10">
              Congratulations 🎉
            </h3>
            <p className="text-green-800 dark:text-green-200 relative z-10 text-lg">
              You have successfully completed the Organic Mushroom Farm Training Course. We hope this training helps you start your own mushroom farming business.
            </p>
          </motion.div>
        )}

        {/* Course Content */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200/50 dark:border-stone-700/50 pb-4 gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Training Modules</h2>
              <span className="text-sm font-medium text-stone-500 bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full">
                {completedLessons.length} / {COURSE_LESSONS.length} Completed
              </span>
            </div>
            {nextUnlockTime && (
              <CountdownTimer targetDate={nextUnlockTime} />
            )}
          </div>
          
          <div className="space-y-6">
            {COURSE_LESSONS.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id);
              
              let isUnlocked = false;
              let unlockMessage = "";

              if (lesson.requiresPreviousComplete) {
                const prevIndex = COURSE_LESSONS.findIndex(l => l.id === lesson.id) - 1;
                const prevLesson = COURSE_LESSONS[prevIndex];
                const prevCompleted = completedLessons.includes(prevLesson.id);
                
                if (prevCompleted) {
                  isUnlocked = true;
                } else {
                  unlockMessage = "Complete the previous lesson to unlock.";
                }
              } else {
                if (daysSinceReg > lesson.unlockDayOffset) {
                  isUnlocked = true;
                } else if (daysSinceReg === lesson.unlockDayOffset) {
                  if (reachedTime) {
                    isUnlocked = true;
                  } else {
                    unlockMessage = "This training will start at 4:00 PM. Please come back at the scheduled time.";
                  }
                } else {
                  unlockMessage = "This lesson will unlock on the next training day at 4:00 PM.";
                }
              }

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <LessonCard 
                    lesson={lesson}
                    isUnlocked={isUnlocked}
                    isCompleted={isCompleted}
                    unlockMessage={unlockMessage}
                    userId={profile.id}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass mt-16 py-10 border-t-0 border-t border-white/20 dark:border-white/5 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg mb-4 flex items-center justify-center md:justify-start">
              <Sprout className="h-5 w-5 mr-2 text-purple-600" /> Support
            </h3>
            <div className="flex flex-col space-y-3 text-sm text-stone-600 dark:text-stone-400">
              <a href="tel:9203544140" className="flex items-center hover:text-purple-600 transition-colors">
                <div className="h-8 w-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mr-3">
                  <Phone className="h-4 w-4" />
                </div>
                9203544140
              </a>
              <a href="https://wa.me/919203544140" target="_blank" rel="noreferrer" className="flex items-center hover:text-green-600 transition-colors">
                <div className="h-8 w-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mr-3">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="h-4 w-4" />
                </div>
                Message on WhatsApp
              </a>
              <a href="mailto:sonib491@gmail.com" className="flex items-center hover:text-purple-600 transition-colors">
                <div className="h-8 w-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mr-3">
                  <Mail className="h-4 w-4" />
                </div>
                sonib491@gmail.com
              </a>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/organic_mushroom_farm_jabalpur" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-stone-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/organic.mushroom.farm0" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-stone-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/@organicmushroomfarm" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://www.pinterest.com/organicmushroomfarm" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.435 2.981 7.435 6.961 0 4.156-2.619 7.502-6.255 7.502-1.222 0-2.372-.635-2.764-1.385l-.752 2.868c-.271 1.033-.999 2.325-1.492 3.114 1.259.388 2.593.596 3.972.596 6.621 0 11.988-5.367 11.988-11.987C24.005 5.367 18.638 0 12.017 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
