import React, { useState, useEffect } from 'react';
import { Lesson } from '../data/course';
import { CheckCircle, Lock, PlayCircle, FileText, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { isLiveClassTime } from '../lib/utils';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface LessonCardProps {
  key?: React.Key;
  lesson: Lesson;
  isUnlocked: boolean;
  isCompleted: boolean;
  unlockMessage?: string;
  userId: string;
}

export default function LessonCard({ lesson, isUnlocked, isCompleted, unlockMessage, userId }: LessonCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [marking, setMarking] = useState(false);
  const [englishDownloaded, setEnglishDownloaded] = useState(false);
  const [hindiDownloaded, setHindiDownloaded] = useState(false);

  const isLive = isLiveClassTime();

  const handleMarkComplete = async () => {
    if (!isUnlocked || isCompleted) return;
    setMarking(true);
    try {
      await setDoc(doc(db, 'progress', `${userId}_${lesson.id}`), {
        user_id: userId,
        lesson_id: lesson.id,
        completed: true,
        completion_date: Date.now()
      });
    } catch (err) {
      console.error("Error marking complete", err);
    } finally {
      setMarking(false);
    }
  };

  useEffect(() => {
    if (englishDownloaded && hindiDownloaded && !isCompleted && !marking && isUnlocked) {
      handleMarkComplete();
    }
  }, [englishDownloaded, hindiDownloaded, isCompleted, marking, isUnlocked]);

  return (
    <div className={`rounded-2xl overflow-hidden mb-6 transition-all duration-300 ${isUnlocked ? 'glass-card border-purple-200/50 dark:border-purple-800/30' : 'bg-white/40 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700/50 opacity-80'}`}>
      <div 
        className="p-5 sm:p-6 flex items-center justify-between cursor-pointer relative overflow-hidden"
        onClick={() => isUnlocked && setExpanded(!expanded)}
      >
        {isCompleted && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10"></div>
        )}
        
        <div className="flex items-center space-x-5 relative z-10">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner ${isCompleted ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/30' : isUnlocked ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-purple-500/30' : 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400'}`}>
            {isCompleted ? <CheckCircle className="h-6 w-6" /> : isUnlocked ? <PlayCircle className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-bold ${isUnlocked ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400'}`}>
              {lesson.title}
            </h3>
            {!isUnlocked && unlockMessage && (
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mt-1">{unlockMessage}</p>
            )}
            {isCompleted && (
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">Lesson completed successfully. PDF notes are now available.</p>
            )}
          </div>
        </div>
        {isUnlocked && (
          <div className={`text-stone-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-6 w-6" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isUnlocked && expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-stone-200/50 dark:border-stone-700/50 bg-white/30 dark:bg-black/10">
              {lesson.videoUrl && (
                <div className="mb-8 mt-4">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-3 uppercase tracking-wider">Training Video</h4>
                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <iframe 
                      src={lesson.videoUrl} 
                      className="w-full h-full border-0" 
                      allow="autoplay"
                    ></iframe>
                    {isLive && (
                      <div className="absolute inset-0 z-10 bg-transparent" title="Live class in progress. Controls are disabled until 5:30 PM."></div>
                    )}
                  </div>
                  {lesson.password && (
                    <p className="text-sm font-medium text-stone-600 dark:text-stone-300 mt-3 flex items-center bg-black/5 dark:bg-white/5 p-3 rounded-xl inline-block">
                      <Lock className="h-4 w-4 mr-2 text-purple-500" />
                      Video Password: <span className="font-mono bg-white dark:bg-black px-2 py-1 rounded-md ml-2 shadow-sm">{lesson.password}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/50 dark:bg-black/20 p-5 rounded-2xl border border-white/40 dark:border-white/5">
                <div>
                  {isUnlocked ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">Study Materials (PDFs)</h4>
                        {!isCompleted && (englishDownloaded || hindiDownloaded) && (
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full animate-pulse">
                            {englishDownloaded && hindiDownloaded ? 'Completing...' : 'Download both to complete'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <a 
                          href={lesson.pdfs.english} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={() => !isCompleted && setEnglishDownloaded(true)}
                          className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 ${
                            englishDownloaded || isCompleted 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200/50 dark:border-green-800/30 text-green-700 dark:text-green-300' 
                              : 'bg-white/80 dark:bg-stone-800/80 border-stone-200/50 dark:border-stone-700/50 text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-700'
                          }`}
                        >
                          <FileText className={`h-5 w-5 mr-2 ${englishDownloaded || isCompleted ? 'text-green-500' : 'text-purple-600 dark:text-purple-400'}`} />
                          English Notes
                          {(englishDownloaded || isCompleted) && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                        </a>
                        <a 
                          href={lesson.pdfs.hindi} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={() => !isCompleted && setHindiDownloaded(true)}
                          className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 ${
                            hindiDownloaded || isCompleted 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200/50 dark:border-green-800/30 text-green-700 dark:text-green-300' 
                              : 'bg-white/80 dark:bg-stone-800/80 border-stone-200/50 dark:border-stone-700/50 text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-700'
                          }`}
                        >
                          <FileText className={`h-5 w-5 mr-2 ${hindiDownloaded || isCompleted ? 'text-green-500' : 'text-purple-600 dark:text-purple-400'}`} />
                          Hindi Notes
                          {(hindiDownloaded || isCompleted) && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-stone-500 dark:text-stone-400 flex items-center">
                      <Lock className="h-5 w-5 mr-2 text-stone-400" /> PDFs will unlock after marking lesson as complete.
                    </p>
                  )}
                </div>

                {!isCompleted && (
                  <button
                    onClick={handleMarkComplete}
                    disabled={marking}
                    className="button-3d text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center whitespace-nowrap"
                  >
                    {marking ? 'Updating...' : 'Mark as Completed'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
