import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Lesson } from '../data/lessons';
import { 
  Play, 
  Lock, 
  CheckCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  Loader2, 
  Trophy,
  ChevronRight,
  AlertCircle,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VideoPlayer from '../components/VideoPlayer';
import { format, addDays, isAfter, isBefore, setHours, setMinutes, setSeconds, differenceInSeconds } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [now, setNow] = useState(new Date());
  const [downloadedPdfs, setDownloadedPdfs] = useState<Record<string, { english: boolean; hindi: boolean }>>({});

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'lessons'), (snap) => {
      const fetchedLessons = snap.docs.map(doc => doc.data() as Lesson);
      fetchedLessons.sort((a, b) => a.order - b.order);
      setLessons(fetchedLessons);
      setLoading(false);
    });

    const timer = setInterval(() => setNow(new Date()), 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const getUnlockTime = (order: number) => {
    if (!profile?.created_at) return new Date();
    const startDate = new Date(profile.created_at);
    const unlockDate = addDays(startDate, order - 1);
    return setSeconds(setMinutes(setHours(unlockDate, 16), 0), 0); // 4:00 PM
  };

  const getRestrictedEndTime = (order: number) => {
    const unlockTime = getUnlockTime(order);
    return setSeconds(setMinutes(setHours(unlockTime, 17), 30), 0); // 5:30 PM
  };

  const isLessonUnlocked = (lesson: Lesson) => {
    if (lesson.status === 'coming_soon') return false;
    
    // Check time unlock
    const unlockTime = getUnlockTime(lesson.order);
    if (isBefore(now, unlockTime)) return false;

    // Check sequential unlock
    if (lesson.order > 1) {
      const prevLessonId = lessons[lesson.order - 2]?.id;
      if (!profile?.completed_videos?.includes(prevLessonId)) return false;
    }

    return true;
  };

  const getLessonStatus = (lesson: Lesson) => {
    if (lesson.status === 'coming_soon') return 'Coming Soon';
    if (profile?.completed_videos?.includes(lesson.id)) return 'Completed';
    
    const unlockTime = getUnlockTime(lesson.order);
    if (isBefore(now, unlockTime)) return 'Locked';
    
    if (lesson.order > 1) {
      const prevLessonId = lessons[lesson.order - 2]?.id;
      if (!profile?.completed_videos?.includes(prevLessonId)) return 'Locked (Complete Previous)';
    }

    return 'Available';
  };

  const getCountdown = (lesson: Lesson) => {
    const unlockTime = getUnlockTime(lesson.order);
    const diff = differenceInSeconds(unlockTime, now);
    if (diff <= 0) return null;

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLessonComplete = async (lessonId: string) => {
    if (!user || profile?.completed_videos?.includes(lessonId)) return;
    try {
      const newCompletedVideos = [...(profile?.completed_videos || []), lessonId];
      const activeLessons = lessons.filter(l => l.status === 'active');
      const progressPercentage = Math.round((newCompletedVideos.length / activeLessons.length) * 100);

      await updateDoc(doc(db, 'users', user.uid), {
        completed_videos: newCompletedVideos,
        progress_percentage: progressPercentage
      });
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  const handlePdfDownload = (lessonId: string, lang: 'english' | 'hindi') => {
    if (profile?.completed_videos?.includes(lessonId)) return;

    setDownloadedPdfs(prev => {
      const current = prev[lessonId] || { english: false, hindi: false };
      const updated = { ...current, [lang]: true };
      
      if (updated.english && updated.hindi) {
        handleLessonComplete(lessonId);
      }
      
      return { ...prev, [lessonId]: updated };
    });
  };

  const activeLessons = lessons.filter(l => l.status === 'active');
  const progressPercentage = profile?.progress_percentage || 0;

  const allMainLessonsCompleted = activeLessons.length > 0 && 
    activeLessons.every(l => profile?.completed_videos?.includes(l.id));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-left"
          >
            <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight mb-2">
              Organic Mushroom Farm <span className="text-purple-600">Training</span>
            </h1>
            <p className="text-stone-600 dark:text-stone-400 text-lg">
              Welcome back, <span className="font-bold text-stone-900 dark:text-white">{profile?.full_name || 'Student'}</span>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-5 py-2.5 bg-stone-900 dark:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 dark:hover:bg-stone-700 transition-all shadow-lg shadow-stone-200 dark:shadow-none"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </motion.div>
        </header>

        {/* Progress Bar Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm mb-12"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">Overall Progress</h2>
            <span className="text-purple-600 dark:text-purple-400 font-black text-xl">{progressPercentage}%</span>
          </div>
          <div className="h-4 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600"
            />
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-500 mt-3 font-medium">
            {profile?.completed_videos?.length || 0} of {activeLessons.length} lessons completed
          </p>
        </motion.div>

        {allMainLessonsCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 p-8 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="h-20 w-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                <Trophy className="h-10 w-10 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Congratulations! 🎉</h2>
                <p className="text-purple-100 text-lg leading-relaxed">
                  You have successfully completed the Organic Mushroom Farm Training Course. We hope this training helps you start your own mushroom farming business.
                </p>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {lessons.map((lesson) => {
            const status = getLessonStatus(lesson);
            const unlocked = isLessonUnlocked(lesson);
            const countdown = getCountdown(lesson);
            const isCompleted = profile?.completed_videos?.includes(lesson.id);
            const restrictedEnd = getRestrictedEndTime(lesson.order);
            const isRestricted = isAfter(now, getUnlockTime(lesson.order)) && isBefore(now, restrictedEnd);

            return (
              <motion.div
                key={lesson.id}
                layout
                className={`bg-white dark:bg-stone-900 rounded-3xl border transition-all overflow-hidden ${
                  unlocked ? 'border-stone-200 dark:border-stone-800 shadow-sm' : 'border-stone-100 dark:border-stone-900 opacity-80'
                }`}
              >
                <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : unlocked ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-8 w-8" /> : unlocked ? <Play className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                        Lesson {lesson.order}
                      </span>
                      {isCompleted ? (
                        <span className="text-[10px] font-bold uppercase bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      ) : unlocked ? (
                        <span className="text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          In Progress
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded-full">
                          Not Started
                        </span>
                      )}
                      {isRestricted && (
                        <span className="text-[10px] font-bold uppercase bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Live Restricted
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-1">{lesson.title}</h3>
                    
                    {status === 'Locked' && countdown && (
                      <div className="mt-2 text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Class starts at 4 PM (Starts in {countdown})
                      </div>
                    )}
                    
                    {status === 'Locked (Complete Previous)' && (
                      <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">Complete previous lessons to unlock this one.</p>
                    )}

                    {lesson.status === 'coming_soon' && (
                      <p className="text-sm text-stone-500 dark:text-stone-500 mt-1 italic">This lesson is coming soon. Stay tuned!</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {unlocked ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedLesson(lesson)}
                          className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200 dark:shadow-none"
                        >
                          <Play className="h-5 w-5 fill-current" />
                          Watch Lesson
                        </button>
                        {!isCompleted && (
                          <button
                            onClick={() => handleLessonComplete(lesson.id)}
                            className="px-6 py-2 bg-white dark:bg-stone-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 rounded-xl text-sm font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                          >
                            Mark as Completed
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="px-6 py-3 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                        <Lock className="h-5 w-5" />
                        Locked
                      </div>
                    )}
                  </div>
                </div>

                {(unlocked || isCompleted || allMainLessonsCompleted) && (
                  <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-4 items-center">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                      <span className="text-xs font-bold text-stone-500 dark:text-stone-500 uppercase tracking-wider">Download Resources:</span>
                      <div className="flex flex-wrap gap-4">
                        <a 
                          href={lesson.pdfEnglish} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={() => handlePdfDownload(lesson.id, 'english')}
                          className={`text-sm font-bold flex items-center gap-1.5 transition-colors ${
                            (downloadedPdfs[lesson.id]?.english || isCompleted) 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300'
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                          View PDF (English)
                          {(downloadedPdfs[lesson.id]?.english || isCompleted) && <CheckCircle className="h-3 w-3" />}
                        </a>
                        <a 
                          href={lesson.pdfHindi} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={() => handlePdfDownload(lesson.id, 'hindi')}
                          className={`text-sm font-bold flex items-center gap-1.5 transition-colors ${
                            (downloadedPdfs[lesson.id]?.hindi || isCompleted) 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300'
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                          View PDF (Hindi)
                          {(downloadedPdfs[lesson.id]?.hindi || isCompleted) && <CheckCircle className="h-3 w-3" />}
                        </a>
                      </div>
                      {!isCompleted && (downloadedPdfs[lesson.id]?.english || downloadedPdfs[lesson.id]?.hindi) && (
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full animate-pulse ml-auto">
                          {downloadedPdfs[lesson.id]?.english && downloadedPdfs[lesson.id]?.hindi ? 'Completing...' : 'Download both to complete'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedLesson && (
          <VideoPlayer
            lesson={selectedLesson}
            isRestricted={isAfter(now, getUnlockTime(selectedLesson.order)) && isBefore(now, getRestrictedEndTime(selectedLesson.order))}
            onClose={() => setSelectedLesson(null)}
            onComplete={() => handleLessonComplete(selectedLesson.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
