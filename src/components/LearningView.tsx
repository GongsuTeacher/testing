import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserData, Word } from '../types';
import { getWordsForDay } from '../data/words';
import { Volume2, ChevronRight, ChevronLeft, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import Confetti from 'react-confetti';

export default function LearningView({ user, userData }: { user: User, userData: UserData | null }) {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const currentDay = parseInt(day || '1');
  const words = getWordsForDay(currentDay);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleComplete = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    setCompleted(true);

    if (user && userData) {
      const userRef = doc(db, 'users', user.uid);
      
      // Update points and stars logic
      let newPoints = (userData.points || 0) + 10;
      let newStars = Math.floor(newPoints / 200);
      
      await updateDoc(userRef, {
        points: newPoints,
        stars: Math.min(newStars, 5),
        lastLearnedDay: Math.max(userData.lastLearnedDay, currentDay),
        [`dailyProgress.${currentDay}`]: true
      });
    }

    setTimeout(() => {
      navigate(`/quiz/${currentDay}`);
    }, 3000);
  };

  const next = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      {completed && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />}
      
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/')}
          className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          Stop Learning
        </button>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Clock className="w-4 h-4 text-indigo-500" />
          <Timer startTime={startTime} />
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[2.5rem] p-12 shadow-xl shadow-slate-200 border border-slate-200 text-center space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-6 left-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Learning Mode</div>
            
            <div className="space-y-2 pt-4">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Word {currentIndex + 1} / 10</span>
              <h3 className="text-6xl font-black text-slate-900 tracking-tight">{words[currentIndex].english}</h3>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium italic text-lg">{words[currentIndex].phonetic}</span>
                <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg text-sm">{words[currentIndex].reading}</span>
              </div>
              
              <button 
                onClick={() => speak(words[currentIndex].english)}
                className="w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-95 transition-all"
              >
                <Volume2 className="w-8 h-8" />
              </button>
            </div>

            <div className="py-2">
              <span className="text-4xl font-black text-slate-700">{words[currentIndex].korean}</span>
            </div>

            <p className="text-slate-400 italic font-medium px-8 leading-relaxed">"{words[currentIndex].example}"</p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="flex justify-center gap-3 mt-10">
          {words.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === currentIndex ? "w-10 bg-indigo-600" : i < currentIndex ? "w-3 bg-emerald-400" : "w-3 bg-slate-200"
              )} 
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-10">
          <button 
            disabled={currentIndex === 0}
            onClick={prev}
            className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400 disabled:opacity-0 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          
          {currentIndex === words.length - 1 ? (
            <button 
              onClick={handleComplete}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-xl shadow-emerald-100 flex items-center gap-3 active:scale-95 transition-all"
            >
              Finish Day {day}
              <CheckCircle className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={next}
              className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Next Word
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {completed && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-sky-500/90 backdrop-blur-md p-6"
        >
          <div className="text-center text-white space-y-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black">학습 완료!</h2>
            <p className="text-xl font-medium opacity-80">+10점과 별을 획득했어요!<br/>잠시 후 퀴즈가 시작됩니다.</p>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
                className="h-full bg-white"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Timer({ startTime }: { startTime: number }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return <span className="font-mono font-bold text-sky-700">{formatTime(time)}</span>;
}
