import React, { useState } from 'react';
import { Lesson } from '../data/course';
import { CheckCircle, Lock, PlayCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { isLiveClassTime } from '../lib/utils';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

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

  return (
    <div className={`border rounded-xl overflow-hidden mb-4 transition-all ${isUnlocked ? 'border-purple-200 dark:border-purple-900/50 bg-white dark:bg-stone-800 shadow-sm' : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 opacity-75'}`}>
      <div 
        className="p-4 sm:p-6 flex items-center justify-between cursor-pointer"
        onClick={() => isUnlocked && setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : isUnlocked ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-400'}`}>
            {isCompleted ? <CheckCircle className="h-6 w-6" /> : isUnlocked ? <PlayCircle className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
          </div>
          <div>
            <h3 className={`text-lg font-medium ${isUnlocked ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400'}`}>
              {lesson.title}
            </h3>
            {!isUnlocked && unlockMessage && (
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{unlockMessage}</p>
            )}
            {isCompleted && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Lesson completed successfully. PDF notes are now available.</p>
            )}
          </div>
        </div>
        {isUnlocked && (
          <div className="text-stone-400">
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        )}
      </div>

      {isUnlocked && expanded && (
        <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-stone-100 dark:border-stone-700">
          {lesson.videoUrl && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-stone-900 dark:text-white mb-2">Training Video</h4>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
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
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
                  Video Password: <span className="font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">{lesson.password}</span>
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {isCompleted ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-stone-900 dark:text-white">Study Materials (PDFs)</h4>
                  <div className="flex flex-wrap gap-3">
                    <a href={lesson.pdfs.english} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1.5 border border-stone-300 dark:border-stone-600 shadow-sm text-sm font-medium rounded text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600">
                      <FileText className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                      English Notes
                    </a>
                    <a href={lesson.pdfs.hindi} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1.5 border border-stone-300 dark:border-stone-600 shadow-sm text-sm font-medium rounded text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600">
                      <FileText className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                      Hindi Notes
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center">
                  <Lock className="h-4 w-4 mr-1" /> PDFs will unlock after marking lesson as complete.
                </p>
              )}
            </div>

            {!isCompleted && (
              <button
                onClick={handleMarkComplete}
                disabled={marking}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {marking ? 'Updating...' : 'Mark as Completed'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
