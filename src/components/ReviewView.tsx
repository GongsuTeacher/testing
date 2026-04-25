import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserData, Word } from '../types';
import { VOCABULARY } from '../data/words';
import { Brain, Trophy, ArrowLeft, RefreshCw, Star, HelpCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import Confetti from 'react-confetti';

type GameMode = 'matching' | 'writing';

export default function ReviewView({ user, userData }: { user: User, userData: UserData | null }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<GameMode | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [reviewWords, setReviewWords] = useState<Word[]>([]);

  useEffect(() => {
    if (userData) {
      // Get words from wrongWords list first
      const allWords = Object.values(VOCABULARY).flat();
      const wrongWords = allWords.filter(w => userData.wrongWords.includes(w.id));
      
      // If less than 6, fill with random words
      if (wrongWords.length < 6) {
        const others = allWords.filter(w => !userData.wrongWords.includes(w.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 6 - wrongWords.length);
        setReviewWords([...wrongWords, ...others]);
      } else {
        setReviewWords(wrongWords.slice(0, 8)); // Max 8 for density
      }
    }
  }, [userData]);

  const handleFinish = async (finalScore: number) => {
    setScore(finalScore);
    setCompleted(true);
    
    if (user && userData) {
      const userRef = doc(db, 'users', user.uid);
      const totalPoints = (userData.points || 0) + finalScore;
      await updateDoc(userRef, {
        points: Math.max(0, totalPoints),
        stars: Math.min(Math.floor(Math.max(0, totalPoints) / 200), 5)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full transition-all">
          <ArrowLeft className="w-6 h-6 text-slate-400" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800">복습 퀴즈</h2>
          <p className="text-slate-500 font-medium">부족한 부분을 채워볼까요?</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!mode && !completed ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <GameModeCard 
              icon={<RefreshCw className="w-8 h-8 text-indigo-500" />}
              title="카드 짝 맞추기"
              desc="영단어와 뜻을 알맞게 매칭하세요."
              color="indigo"
              onClick={() => setMode('matching')}
            />
            <GameModeCard 
              icon={<HelpCircle className="w-8 h-8 text-emerald-500" />}
              title="단어 직접 쓰기"
              desc="한글 뜻을 보고 스펠링을 입력하세요."
              color="emerald"
              onClick={() => setMode('writing')}
            />
          </motion.div>
        ) : completed ? (
          <ReviewResult score={score} onReset={() => { setMode(null); setCompleted(false); setScore(0); }} />
        ) : (
          <div className="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-xl shadow-sky-100 border border-sky-50">
            {mode === 'matching' && <MatchingGame words={reviewWords} onFinish={handleFinish} />}
            {mode === 'writing' && <WritingReview words={reviewWords} onFinish={handleFinish} />}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GameModeCard({ icon, title, desc, color, onClick }: any) {
  const colorClasses: any = {
    indigo: "hover:border-indigo-200 hover:bg-indigo-50/30 bg-white shadow-indigo-100/50",
    emerald: "hover:border-emerald-200 hover:bg-emerald-50/30 bg-white shadow-emerald-100/50",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "p-8 rounded-[2.5rem] text-left border-2 border-slate-50 transition-all shadow-xl group active:scale-95 flex flex-col gap-4",
        colorClasses[color]
      )}
    >
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-800 mb-1">{title}</h3>
        <p className="text-slate-400 font-medium text-sm">{desc}</p>
      </div>
    </button>
  );
}

function MatchingGame({ words, onFinish }: { words: Word[], onFinish: (score: number) => void }) {
  const [cards, setCards] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const wordCards = words.map(w => ({ id: w.id, content: w.english, type: 'en' }));
    const meaningCards = words.map(w => ({ id: w.id, content: w.korean, type: 'ko' }));
    const all = [...wordCards, ...meaningCards].sort(() => 0.5 - Math.random());
    setCards(all);
  }, [words]);

  useEffect(() => {
    if (selected.length === 2) {
      setAttempts(prev => prev + 1);
      const [i1, i2] = selected;
      if (cards[i1].id === cards[i2].id && cards[i1].type !== cards[i2].type) {
        setMatched(prev => [...prev, i1, i2]);
        setSelected([]);
      } else {
        setTimeout(() => setSelected([]), 1000);
      }
    }
  }, [selected, cards]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      onFinish(Math.max(5, 50 - attempts)); // Base 50 points, minus attempts
    }
  }, [matched, cards, onFinish, attempts]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-4">
        <span className="font-bold text-slate-400">시도 횟수: {attempts}</span>
        <span className="font-black text-indigo-500">{matched.length / 2} / {words.length} MATCHED</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map((card, i) => {
          const isSelected = selected.includes(i);
          const isMatched = matched.includes(i);
          return (
            <button
              key={i}
              onClick={() => !isSelected && !isMatched && selected.length < 2 && setSelected(prev => [...prev, i])}
              className={cn(
                "aspect-square rounded-2xl flex items-center justify-center p-3 text-center transition-all font-bold text-sm sm:text-base",
                isMatched ? "bg-emerald-50 text-emerald-500 scale-90 opacity-50 cursor-default" :
                isSelected ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200 scale-105" :
                "bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
              )}
            >
              {card.content}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WritingReview({ words, onFinish }: { words: Word[], onFinish: (score: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const handleCheck = () => {
    if (input.toLowerCase().trim() === words[currentIndex].english.toLowerCase()) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongCount(prev => prev + 1);
    }
    
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setInput('');
    } else {
      onFinish(correctCount * 5 - wrongCount * 2);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 text-center space-y-10">
      <div className="space-y-2">
        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Question {currentIndex + 1} / {words.length}</span>
        <h2 className="text-4xl font-black text-slate-800">{words[currentIndex].korean}</h2>
      </div>

      <input 
        type="text" 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-6 bg-slate-50 rounded-2xl text-center text-2xl font-bold border-2 border-transparent focus:border-emerald-400 outline-none transition-all"
        placeholder="영단어를 입력하세요"
        onKeyDown={(e) => e.key === 'Enter' && input && handleCheck()}
      />

      <button 
        onClick={handleCheck}
        disabled={!input}
        className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-emerald-100 disabled:opacity-50"
      >
        확인
      </button>
    </div>
  );
}

function ReviewResult({ score, onReset }: { score: number, onReset: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[3rem] p-12 text-center shadow-2xl space-y-8"
    >
      <Confetti recycle={false} />
      <div className="w-24 h-24 bg-sky-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
        <CheckCircle2 className="w-12 h-12 text-white" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black">복습 완료!</h2>
        <p className="text-slate-500 font-medium">꾸준함이 실력을 만들어요.</p>
      </div>
      <div className="bg-sky-50 p-8 rounded-3xl">
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">획득한 점수</p>
        <p className="text-5xl font-black text-sky-600">{score}점</p>
      </div>
      <button 
        onClick={onReset}
        className="w-full bg-slate-900 text-white py-5 rounded-3xl font-bold hover:bg-slate-800"
      >
        다른 게임 하기
      </button>
    </motion.div>
  );
}
