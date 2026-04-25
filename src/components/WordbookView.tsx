import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserData, Word } from '../types';
import { VOCABULARY } from '../data/words';
import { ArrowLeft, BookOpen, Volume2, Trash2 } from 'lucide-react';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { cn } from '../lib/utils';

export default function WordbookView({ user, userData }: { user: User, userData: UserData | null }) {
  const navigate = useNavigate();
  
  const allWords = Object.values(VOCABULARY).flat();
  const myWords = allWords.filter(w => userData?.wrongWords?.includes(w.id));

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const removeWord = async (wordId: string) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        wrongWords: arrayRemove(wordId)
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
          <h2 className="text-2xl font-black text-slate-800">나만의 단어장</h2>
          <p className="text-slate-500 font-medium">틀린 단어를 다시 복습해보세요.</p>
        </div>
      </div>

      {myWords.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-100 space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10 text-slate-200" />
          </div>
          <p className="text-slate-400 font-bold text-lg">아직 기록된 단어가 없어요!</p>
          <button 
            onClick={() => navigate('/')}
            className="text-sky-500 font-black hover:underline"
          >
            학습 시작하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myWords.map((word) => (
            <div key={word.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-800">{word.english}</h3>
                  <button 
                    onClick={() => speak(word.english)}
                    className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 text-xs font-medium text-slate-400">
                  <span>{word.phonetic}</span>
                  <span>|</span>
                  <span>{word.reading}</span>
                </div>
                <p className="text-sky-600 font-black pt-1">{word.korean}</p>
              </div>
              
              <button 
                onClick={() => removeWord(word.id)}
                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                title="단어장에서 삭제"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
