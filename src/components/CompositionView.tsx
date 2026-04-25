import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserData, Word } from '../types';
import { VOCABULARY } from '../data/words';
import { Pencil, ArrowLeft, Send, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import Confetti from 'react-confetti';

export default function CompositionView({ user, userData }: { user: User, userData: UserData | null }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const allWords = Object.values(VOCABULARY).flat();
    const shuffled = allWords.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    const qs = shuffled.map(word => {
      // Create a sentence with [ ]
      const sentence = word.example.replace(new RegExp(word.english, 'gi'), '_____');
      const others = allWords.filter(w => w.id !== word.id).sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [word.english, ...others.map(o => o.english)].sort(() => 0.5 - Math.random());
      return { word, sentence, options, correctAnswer: word.english };
    });
    
    setQuestions(qs);
  }, []);

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    
    if (option.toLowerCase() === questions[currentIndex].correctAnswer.toLowerCase()) {
      setScore(prev => prev + 10);
    } else {
      setScore(prev => prev - 2);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
      if (user && userData) {
        const userRef = doc(db, 'users', user.uid);
        const finalPoints = Math.max(0, (userData.points || 0) + score);
        await updateDoc(userRef, {
          points: finalPoints,
          stars: Math.min(Math.floor(finalPoints / 200), 5)
        });
      }
    }
  };

  if (completed) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-8">
        <Confetti recycle={false} />
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-sky-50 space-y-6">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-black">작문 연습 완료!</h2>
          <div className="bg-emerald-50 p-8 rounded-3xl">
            <span className="block text-slate-400 font-bold text-xs uppercase mb-1">획득 점수</span>
            <span className="text-5xl font-black text-emerald-600">+{score}점</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-bold"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full transition-all">
          <ArrowLeft className="w-6 h-6 text-slate-400" />
        </button>
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <div key={i} className={cn("w-10 h-2 rounded-full", i === currentIndex ? "bg-emerald-500" : i < currentIndex ? "bg-emerald-100" : "bg-slate-100")} />
          ))}
        </div>
        <div className="w-10" />
      </div>

      <header className="text-center space-y-2">
        <div className="bg-emerald-100 text-emerald-600 px-4 py-1 rounded-full text-xs font-black inline-block uppercase tracking-widest">
          Sentence Completion
        </div>
        <h2 className="text-xl font-bold text-slate-500">문장을 완성해보세요!</h2>
      </header>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-emerald-50 space-y-12"
      >
        <div className="text-center">
          <p className="text-3xl md:text-5xl font-black text-slate-900 leading-relaxed tracking-tight">
            {q.sentence.split('_____').map((part: string, i: number, arr: any[]) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className={cn(
                    "mx-2 px-6 py-2 rounded-2xl border-b-4 inline-block min-w-[140px] transition-all",
                    isAnswered 
                      ? q.correctAnswer.toLowerCase() === selectedOption?.toLowerCase()
                        ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm"
                        : "bg-red-50 border-red-500 text-red-600 shadow-sm"
                      : "bg-slate-50 border-indigo-400 text-slate-100"
                  )}>
                    {isAnswered ? q.correctAnswer : '...'}
                  </span>
                )}
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {q.options.map((option: string) => (
            <button
              key={option}
              disabled={isAnswered}
              onClick={() => handleAnswer(option)}
              className={cn(
                "p-6 rounded-2xl font-black text-xl transition-all border-2",
                isAnswered
                  ? option.toLowerCase() === q.correctAnswer.toLowerCase()
                    ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-md"
                    : option === selectedOption
                      ? "bg-red-50 border-red-500 text-red-600"
                      : "bg-slate-50 border-transparent opacity-50 shadow-none scale-95"
                  : "bg-white border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-700 shadow-sm"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-slate-200"
          >
            {currentIndex === questions.length - 1 ? '결과 확인' : '다음 문제'}
            <Send className="w-6 h-6" />
          </button>
        )}
      </motion.div>
    </div>
  );
}
