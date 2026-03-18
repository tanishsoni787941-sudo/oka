import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { COURSE_LESSONS } from '../data/course';
import { getDaysSinceRegistration, hasReachedUnlockTime } from '../lib/utils';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import LessonCard from '../components/LessonCard';
import { LogOut, Moon, Sun, User as UserIcon, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100">
      {/* Header */}
      <header className="bg-white dark:bg-stone-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              OM
            </div>
            <h1 className="text-xl font-bold text-purple-700 dark:text-purple-400 hidden sm:block">
              Organic Mushroom Farm
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={logout} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 hover:text-red-500">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sticky Instructions */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-8">
          <p className="text-sm sm:text-base text-purple-800 dark:text-purple-300 font-medium">
            Please log in using the same browser where you received the login link on WhatsApp. The class will start at 4:00 PM. After completing the lesson, click 'Mark as Completed'. The next lesson will unlock automatically the next day at 4:00 PM.
          </p>
        </div>

        {/* User Profile */}
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center overflow-hidden shrink-0 border-4 border-white dark:border-stone-800 shadow-md">
            {profile.profile_photo ? (
              <img src={profile.profile_photo} alt={profile.full_name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon className="h-12 w-12 text-stone-400" />
            )}
          </div>
          <div className="flex-1 text-center sm:text-left w-full">
            <h2 className="text-2xl font-bold">{profile.full_name}</h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone-500 dark:text-stone-400">
              <span>{profile.email}</span>
              <span className="hidden sm:inline">•</span>
              <span className="font-mono bg-stone-100 dark:bg-stone-700 px-2 py-0.5 rounded text-stone-700 dark:text-stone-300">
                {profile.student_id}
              </span>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Course Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2.5">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {allCompleted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8 text-center">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
              Congratulations 🎉
            </h3>
            <p className="text-green-700 dark:text-green-300">
              You have successfully completed the Organic Mushroom Farm Training Course. We hope this training helps you start your own mushroom farming business.
            </p>
          </div>
        )}

        {/* Course Content */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold border-b border-stone-200 dark:border-stone-700 pb-2">
            Training Modules
          </h2>
          
          <div className="space-y-4">
            {COURSE_LESSONS.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              
              let isUnlocked = false;
              let unlockMessage = "";

              if (lesson.requiresPreviousComplete) {
                // Find previous lesson
                const prevIndex = COURSE_LESSONS.findIndex(l => l.id === lesson.id) - 1;
                const prevLesson = COURSE_LESSONS[prevIndex];
                const prevCompleted = completedLessons.includes(prevLesson.id);
                
                if (prevCompleted) {
                  isUnlocked = true;
                } else {
                  unlockMessage = "Coming Soon. Complete the previous lesson to unlock.";
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
                  unlockMessage = "Coming Soon. This lesson will unlock on the next training day at 4:00 PM.";
                }
              }

              return (
                <LessonCard 
                  key={lesson.id}
                  lesson={lesson}
                  isUnlocked={isUnlocked}
                  isCompleted={isCompleted}
                  unlockMessage={unlockMessage}
                  userId={profile.id}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 mt-12 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg mb-2">Support</h3>
            <div className="flex flex-col space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <a href="tel:9203544140" className="flex items-center hover:text-purple-600">
                <Phone className="h-4 w-4 mr-2" /> 9203544140
              </a>
              <a href="https://wa.me/919203544140" target="_blank" rel="noreferrer" className="flex items-center hover:text-green-600">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="h-4 w-4 mr-2" /> Message on WhatsApp
              </a>
              <a href="mailto:sonib491@gmail.com" className="flex items-center hover:text-purple-600">
                <Mail className="h-4 w-4 mr-2" /> sonib491@gmail.com
              </a>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <h3 className="font-bold text-lg mb-2">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/organic_mushroom_farm_jabalpur" target="_blank" rel="noreferrer" className="text-stone-400 hover:text-pink-600">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://www.facebook.com/organic.mushroom.farm0" target="_blank" rel="noreferrer" className="text-stone-400 hover:text-blue-600">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://www.youtube.com/@organicmushroomfarm" target="_blank" rel="noreferrer" className="text-stone-400 hover:text-red-600">
                <Youtube className="h-6 w-6" />
              </a>
              <a href="https://www.pinterest.com/organicmushroomfarm" target="_blank" rel="noreferrer" className="text-stone-400 hover:text-red-600">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
