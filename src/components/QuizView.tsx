import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserData, Word } from '../types';
import { getWordsForDay } from '../data/words';
import { CheckCircle2, XCircle, ArrowRight, Trophy, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import Confetti from 'react-confetti';

interface Question {
  type: 'multiple' | 'writing';
  word: Word;
  options?: string[];
  correctAnswer: string;
}

export default function QuizView({ user, userData }: { user: User, userData: UserData | null }) {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const currentDay = parseInt(day || '1');
  const words = getWordsForDay(currentDay);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<Word[]>([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);

    // Generate 5 questions from 10 words
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    const qs = selected.map((word, idx) => {
      const type = idx % 2 === 0 ? 'multiple' : 'writing';
      if (type === 'multiple') {
        const others = words.filter(w => w.id !== word.id).sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [word.korean, ...others.map(o => o.korean)].sort(() => 0.5 - Math.random());
        return { type, word, options, correctAnswer: word.korean };
      } else {
        return { type, word, correctAnswer: word.english };
      }
    });
    
    setQuestions(qs as Question[]);
    return () => window.removeEventListener('resize', handleResize);
  }, [day, words]);

  const handleAnswer = async (answer: string) => {
    if (isAnswered) return;
    
    const q = questions[currentIndex];
    const correct = answer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore(prev => prev + 5);
    } else {
      setScore(prev => prev - 2);
      setWrongAnswers(prev => [...prev, q.word]);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizComplete(true);
    
    if (user && userData) {
      const userRef = doc(db, 'users', user.uid);
      const totalPoints = (userData.points || 0) + score;
      
      // Update words to review (add wrong ones, optionally remove correct ones)
      // Actually, user said: "If there are wrong words, expose them frequently in review"
      const wrongIds = wrongAnswers.map(w => w.id);
      
      await updateDoc(userRef, {
        points: Math.max(0, totalPoints),
        stars: Math.min(Math.floor(Math.max(0, totalPoints) / 200), 5),
        wrongWords: arrayUnion(...wrongIds)
      });
    }
  };

  if (quizComplete) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-8">
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-sky-100 border border-sky-50 space-y-6">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-yellow-100">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">퀴즈 완료!</h2>
            <p className="text-sky-600 font-bold text-xl">{score >= 25 ? "완벽해요! 대단해요!" : "수고했어요! 조금 더 노력해봐요!"}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="bg-sky-50 p-6 rounded-3xl">
              <span className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">획득 점수</span>
              <span className="text-3xl font-black text-sky-600">{score}점</span>
            </div>
            <div className="bg-emerald-50 p-6 rounded-3xl">
              <span className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">정답 개수</span>
              <span className="text-3xl font-black text-emerald-600">{questions.length - wrongAnswers.length}/5</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
          >
            홈으로 돌아가기
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 text-left">
            <div className="flex items-center gap-2 text-orange-600 font-bold mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>다시 확인해볼까요?</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {wrongAnswers.map(word => (
                <div key={word.id} className="bg-white p-3 rounded-xl border border-orange-100 text-center">
                  <p className="font-bold text-slate-800">{word.english}</p>
                  <p className="text-xs text-slate-400">{word.korean}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="max-w-xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 w-10 rounded-full transition-all duration-500",
                i === currentIndex ? "bg-indigo-600" : i < currentIndex ? "bg-emerald-400" : "bg-slate-200"
              )} 
            />
          ))}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentIndex + 1} / 5</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white rounded-[2.5rem] p-12 shadow-xl shadow-slate-200 border border-slate-200 space-y-10 relative overflow-hidden"
        >
          <div className="absolute top-6 left-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Quiz Phase</div>
          
          <div className="text-center space-y-4 pt-4">
            <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              {currentQ.type === 'multiple' ? 'Multiple Choice' : 'Spelling Test'}
            </span>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">
              {currentQ.type === 'multiple' ? currentQ.word.english : currentQ.word.korean}
            </h2>
          </div>

          <div className="space-y-4">
            {currentQ.type === 'multiple' ? (
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options?.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full p-6 rounded-2xl text-left font-bold text-lg transition-all border-2",
                      isAnswered 
                        ? option === currentQ.correctAnswer 
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                          : option.toLowerCase() === userInput.toLowerCase() 
                            ? "bg-red-50 border-red-500 text-red-700" 
                            : "bg-slate-50 border-transparent text-slate-400"
                        : "bg-white border-slate-100 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {isAnswered && option === currentQ.correctAnswer && <CheckCircle2 className="w-6 h-6" />}
                      {isAnswered && userInput === option && option !== currentQ.correctAnswer && <XCircle className="w-6 h-6" />}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isAnswered}
                  autoFocus
                  placeholder="..."
                  className={cn(
                    "w-full p-8 rounded-2xl font-black text-4xl text-center outline-none border-b-4 transition-all tracking-tight",
                    isAnswered
                      ? isCorrect 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                        : "bg-red-50 border-red-500 text-red-700"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-600 focus:bg-white text-slate-900"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && userInput && !isAnswered) {
                      handleAnswer(userInput);
                    }
                  }}
                />
                
                {!isAnswered ? (
                  <button
                    onClick={() => handleAnswer(userInput)}
                    disabled={!userInput}
                    className="w-full bg-slate-900 py-6 rounded-2xl text-white font-black text-lg shadow-xl active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest mt-4"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="text-center p-6 rounded-3xl bg-slate-900 border-none animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-slate-400 font-bold text-[10px] mb-2 uppercase tracking-widest">Correct Answer</p>
                    <p className="text-3xl font-black text-white uppercase tracking-tight">{currentQ.correctAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {isAnswered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={nextQuestion}
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              {currentIndex === questions.length - 1 ? '결과 보기' : '다음 문제'}
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
  );
}
