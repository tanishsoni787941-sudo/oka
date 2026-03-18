import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lesson } from '../data/lessons';

interface VideoPlayerProps {
  lesson: Lesson;
  isRestricted: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function VideoPlayer({ lesson, isRestricted, onClose, onComplete }: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPdfs, setShowPdfs] = useState(false);
  
  // Simulated duration for completion tracking (e.g. 10 minutes)
  // In a real app, we'd get this from the video metadata
  const SIMULATED_DURATION = 600; // 10 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!loading && !completed) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev >= SIMULATED_DURATION) {
            handleComplete();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, completed]);

  const handleComplete = () => {
    setCompleted(true);
    setShowPdfs(true);
    onComplete();
  };

  // Convert Google Drive link to preview link if needed
  const getEmbedUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      if (url.includes('/view')) {
        return url.replace('/view', '/preview');
      }
      if (url.includes('/edit')) {
        return url.replace('/edit', '/preview');
      }
    }
    return url;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8"
    >
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
        >
          <X className="h-6 w-6" />
        </button>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
          </div>
        )}

        <div className="w-full h-full relative">
          <iframe
            src={getEmbedUrl(lesson.videoUrl)}
            className="w-full h-full border-none"
            allow="autoplay"
            onLoad={() => setLoading(false)}
          />

          {/* Restriction Overlay */}
          {isRestricted && !loading && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-transparent pointer-events-auto z-20" 
                 title="Seeking is disabled during live training window (4:00 PM - 5:30 PM)"
            />
          )}
          
          {/* Warning Message for Restricted Mode */}
          {isRestricted && !loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-orange-600/80 backdrop-blur-md text-white text-xs font-bold rounded-full flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Live Training Mode: Seeking is disabled until 5:30 PM
            </div>
          )}
        </div>

        {/* Completion Progress Bar */}
        {!loading && !completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-40">
            <motion.div 
              className="h-full bg-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${(timer / SIMULATED_DURATION) * 100}%` }}
            />
          </div>
        )}

        {/* Completion Overlay */}
        <AnimatePresence>
          {showPdfs && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-8"
            >
              <div className="text-center max-w-md">
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Lesson Completed!</h2>
                <p className="text-stone-400 mb-8">
                  Great job! You've successfully watched the lesson. You can now download the study guides below.
                </p>
                
                <div className="flex flex-col gap-3">
                  <a 
                    href={lesson.pdfEnglish} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-white text-stone-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-100 transition-all"
                  >
                    <FileText className="h-5 w-5" />
                    Download English PDF
                  </a>
                  <a 
                    href={lesson.pdfHindi} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all"
                  >
                    <FileText className="h-5 w-5" />
                    Download Hindi PDF
                  </a>
                  <button 
                    onClick={onClose}
                    className="mt-4 text-stone-500 hover:text-white transition-colors font-medium"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
